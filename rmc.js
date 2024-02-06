import { Cluster } from "puppeteer-cluster";
import * as fs from "fs";
import { loginCredentials } from "./credentials.js";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDefaultStartDate() {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    2
  );
  return firstDayOfMonth.toISOString().split("T")[0];
}

async function scraping(fromDate, toDate) {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT, // Run in parallel
    maxConcurrency: 5, // Number of concurrent puppeteer instances
    puppeteerOptions: { headless: "new", defaultViewport: null },
  });

  const resultData = {};
  const jsonData = {};
  let sl = 0;
  await cluster.task(async ({ page, data: { username, password } }) => {
    await page.goto("https://mfnext.microfin360.com/pmk/#/login");
    await page.setViewport({
      width: 1600,
      height: 1200,
      deviceScaleFactor: 1,
    });
    console.log(`starting ${username} data collection .....`);
    console.log("\n");
    const usernameInput = await page.$("#__BVID__12");
    const passwordInput = await page.$("#__BVID__13");
    const loginButton = await page.$("button.btn:nth-child(3)");

    await usernameInput.type(username);
    await passwordInput.type(password);
    await loginButton.click();

    await delay(3000);
    // console.log("login success and going to 22 point");
    await page.goto(
      "https://mfnext.microfin360.com/pmk/#/reports/periodical-progress-reports/index"
    );
    await delay(3000);

    async function scrapePageData(page) {
      // console.log("scraping started..");
      try {
        const fromInput = await page.$('input[name="txt_date_from"]');
        const toInput = await page.$('input[name="txt_date_to"]');

        const searchButton = await page.$(".col-auto > button:nth-child(1)");

        await fromInput.type(fromDate);

        await toInput.type(toDate);

        await page.select("#cbo_service_charge", "0"); // Replace 'your_option_value' with the actual value you want to select

        await searchButton.click();

        return new Promise(async (resolve) => {
          // Listen for network responses
          page.on("response", async (response) => {
            const url = response.url();

            if (
              url.includes(
                "periodical_progress_reports/ajax_for_periodical_progress_report"
              )
            ) {
              const responseBody = await response.json();
              jsonData[username] = responseBody; //can i add something that make it json data
              // console.log(responseBody);
              if (responseBody) {
                resolve(data);
              }
            }
          });

          // Close the browser when done
          // await browser.close();
        });

        // ... existing scraping logic ...
      } catch (error) {
        console.error("An error occurred during scraping:", username, error);
        return []; // Return an empty array to indicate error
      }
    }
    const tableData = await scrapePageData(page);
    // console.log("final", tableData);
    sl = sl + 1;
    console.log(sl + ".completed " + username);
    console.log("\n");
    resultData[username] = tableData;
  });

  for (const { username, password } of loginCredentials) {
    cluster.queue({ username, password });
  }

  await cluster.idle();
  await cluster.close();

  // Save the collected data as a JSON file
  fs.writeFileSync("periodical.json", JSON.stringify(jsonData, null, 2));
  return jsonData;
}

export function startScraping({ fromDate, toDate }) {
  if (fromDate && toDate) {
    return scraping(fromDate, toDate);
  }
}
