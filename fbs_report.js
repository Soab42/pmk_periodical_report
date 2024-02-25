import { Cluster } from "puppeteer-cluster";
import * as fs from "fs";
import fbs from "./fbs.json" assert { type: "json" };

let data = [];
for (const key in fbs) {
  if (Array.isArray(fbs[key].fdr_info)) {
    data = [...data, ...fbs[key].fdr_info];
  }
}
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function login(page) {
  await page.goto("https://mfnext.microfin360.com/pmk/#/login");
  await page.setViewport({
    width: 1600,
    height: 1200,
    deviceScaleFactor: 5,
  });

  const usernameInput = await page.$("#__BVID__12");
  const passwordInput = await page.$("#__BVID__13");
  const loginButton = await page.$("button.btn:nth-child(3)");

  await usernameInput.type("nayabazarregion6");
  await passwordInput.type("nayabazarregion2662");
  await loginButton.click();

  await page.waitForNavigation();
}

export async function fbsReport() {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT, // Run in parallel
    maxConcurrency: 5, // Number of concurrent puppeteer instances
    puppeteerOptions: { headless: "new", defaultViewport: null },
  });

  const resultData = {};
  let totalData = data.length;
  await cluster.task(async ({ page, data: member }) => {
    // console.log("member", member);
    try {
      await login(page);

      await page.goto(
        `https://mfnext.microfin360.com/pmk/#/savings/savings/view/${member.id}`
      );
      // delay(2000);
      // await waitForNavigation(page);
      async function scrapResponse(page) {
        return new Promise(async (resolve) => {
          // Listen for network responses
          page.on("response", async (response) => {
            const url = response.url();
            // console.log("url", url);
            if (url.includes("core-service/index.php/savings/view/")) {
              const responseBody = await response.json();
              // console.log("responseBody", responseBody);

              resolve(responseBody);
              totalData--;
            }
          });

          // Close the browser when done
          // await browser.close();
        });
      }

      resultData[member.id] = await scrapResponse(page);
      console.log("completed", member.id, "remaining", totalData);
    } catch (error) {
      console.error("An error occurred during scraping:", error);
    }
  });

  for (const item of data) {
    // console.log("item", item);

    cluster.queue(item);
  }

  await cluster.idle();
  await cluster.close();

  // Save the collected data as a JSON file
  fs.writeFileSync("fbs_report.json", JSON.stringify(resultData, null, 2));
  return resultData;
}
