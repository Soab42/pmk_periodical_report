import { Cluster } from "puppeteer-cluster";
import * as fs from "fs";
import { loginCredentials } from "./credentials.js";
import ExcelJS from "exceljs"; // Import exceljs for Excel manipulation

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scraping(toDate) {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT, // Run in parallel
    maxConcurrency: 1, // Number of concurrent puppeteer instances
    puppeteerOptions: { headless: false, defaultViewport: null },
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
      "https://mfnext.microfin360.com/pmk/#/reports/register-reports/fdr-register-index"
    );
    await delay(3000);

    async function scrapePageData(page) {
      // console.log("scraping started..");
      try {
        // await page.type('input[name="txt_date_to"]', toDate);

        // Select the appropriate option in the dropdown
        // await page.select("#cbo_duration", "1");

        // await searchButton.click();
        // Wait for a brief moment (you might need to adjust the timing)
        // Fill out the input field
        await page.type('input[name="txt_date_to"]', toDate);
        await page.waitForTimeout(5000);

        // Execute subsequent commands here

        // Example: Click on a button
        await page.click('button[type="submit"]');

        // console.log("searchButton", searchButton);

        return new Promise(async (resolve) => {
          // Listen for network responses
          page.on("response", async (response) => {
            const url = response.url();
            // console.log(url);

            if (url.includes("register_reports/ajax_for_fdr_register_report")) {
              const responseBody = await response.json();
              // console.log("responseBody", responseBody);
              jsonData[username] = responseBody; //can i add something that make it json data
              // console.log(responseBody);
              if (responseBody) {
                resolve(jsonData);
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

  // add excel writing
  // Write data to Excel using exceljs
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("fbs");
  // Save the workbook to a file
  const excelFilePath = "./excell/fbs.xlsx";
  await workbook.xlsx.writeFile(excelFilePath);

  // Save the collected data as a JSON file
  fs.writeFileSync("./data/fbs.json", JSON.stringify(jsonData, null, 2));
  return jsonData;
}
// scraping("2024-02-01");

// export function startScraping({ fromDate, toDate }) {
//   if (fromDate && toDate) {
//     return scraping(fromDate, toDate);
//   }
// }
