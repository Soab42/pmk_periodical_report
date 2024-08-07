import { Cluster } from "puppeteer-cluster";
import * as fs from "fs";
import { loginCredentials } from "./credentialsh.js";
import ExcelJs from "exceljs";
(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT, // Run in parallel
    maxConcurrency: 5, // Number of concurrent puppeteer instances
    puppeteerOptions: { headless: false, defaultViewport: null },
  });

  const resultData = {};
  let count = 1;
  await cluster.task(async ({ page, data: { username, password } }) => {
    // const url = process.env.BASE;
    const url = "http://103.139.165.110:8080";
    // const rpUrl = process.env.RP;

    const CONSUMER_PRODUCT =
      "http://103.139.165.110:8080/consumer/cons_prod_reg.php";

    await page.goto(url);

    await page.type(
      "div.form-group:nth-child(1) > div:nth-child(2) > input:nth-child(1)",
      username
    );
    await page.type(
      "div.form-group:nth-child(2) > div:nth-child(2) > input:nth-child(1)",
      password
    );

    await Promise.all([
      page.waitForNavigation(),
      page.click(".btn"),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);

    await page.goto(CONSUMER_PRODUCT);

    async function scrapePageData(page) {
      try {
        // ... existing scraping logic ...
        const tableData = await page.evaluate(() => {
          console.log("starting scrape");
          const headerRows = Array.from(
            document.querySelectorAll("table thead tr")
          );
          // console.log("header rows", headerRows);
          const headerData = headerRows.map((row) => {
            const cells = Array.from(row.querySelectorAll("th"));
            const data = cells.map((cell) => cell.textContent.trim());
            return data;
          });

          const bodyRows = Array.from(
            document.querySelectorAll("table tbody tr")
          );
          const bodyData = bodyRows.map((row) => {
            const cells = Array.from(row.querySelectorAll("td"));
            const data = cells.map((cell) => cell.textContent.trim());
            return data;
          });

          return [...headerData, ...bodyData];
        });

        return tableData;
      } catch (error) {
        console.error("An error occurred during scraping:", error);
        return []; // Return an empty array to indicate error
      }
    }
    const tableData = await scrapePageData(page);
    // console.log("final", tableData);
    console.log(count + ". completed " + username);
    count++;
    resultData[username] = tableData;
  });

  for (const { username, password } of loginCredentials) {
    cluster.queue({ username, password });
  }

  await cluster.idle();
  await cluster.close();

  // Save the collected data as a JSON file
  fs.writeFileSync(
    "data/CONSUMER_PRODUCT.json",
    JSON.stringify(resultData, null, 2)
  );
})();
