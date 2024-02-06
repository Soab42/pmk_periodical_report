import { Cluster } from "puppeteer-cluster";
import * as fs from "fs";
import { loginCredentials } from "./credentials.js";
import ExcelJs from "exceljs";
import readlineSync from "readline-sync";
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

// // Function to get input from the terminal for the date range
// function getDateRange() {
//   const fromDate = readlineSync.question("Enter the from date (YYYY-MM-DD): ");
//   const toDate = readlineSync.question("Enter the to date (YYYY-MM-DD): ");
//   return { fromDate, toDate };
// }

function getDateRange() {
  const defaultStartDate = getDefaultStartDate();

  const fromDate =
    readlineSync.question(
      `Enter the from date (YYYY-MM-DD, default is ${defaultStartDate}): `
    ) || defaultStartDate;

  const toDate =
    readlineSync.question(
      "Enter the to date (YYYY-MM-DD, default is today): "
    ) || new Date().toISOString().split("T")[0];

  return { fromDate, toDate };
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

        // const fromDate = "2024-01-01";
        // const toDate = "2024-01-31";
        // const { fromDate, toDate } = getDateRange(); // Get date range from user input

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
                const data = await page.$eval(
                  ".report-header > table:nth-child(4)",
                  (table) => {
                    const rows = Array.from(table.querySelectorAll("tr"));
                    return rows.map((row) =>
                      Array.from(row.querySelectorAll("td, th")).map((cell) => {
                        return cell.textContent.trim();
                      })
                    );
                  }
                );

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
    // console.log("running " + username);
    // const url = process.env.BASE;
    // console.log(url);
    cluster.queue({ username, password });
  }

  await cluster.idle();
  await cluster.close();

  // Save the collected data as a JSON file
  fs.writeFileSync("periodical.json", JSON.stringify(jsonData, null, 2));
  const workbook = new ExcelJs.Workbook();
  const worksheet = workbook.addWorksheet("periodical");

  for (const { username } of loginCredentials) {
    if (resultData[username] && Array.isArray(resultData[username])) {
      const userData = resultData[username];
      // console.log("complete " + username);
      worksheet.addRow([`${username} Branch`]);

      worksheet.addRow([
        "",
        "",
        "",
        "Member Balance",
        "",
        "",
        "",
        "",
        "Savings Balance",
        "",
        "Loan Outstanding",
        "",
        "Loan No",
        "",
        "Borrower No",
        "",
        "Current",
        "",
        "Expired",
        "",
        "Total",
        "",
        "Current",
        "",
        "Expired",
        "",
        "Total",
        "",
        "OTR",
        "PAR",
      ]);
      worksheet.addRow([
        "",
        "",
        "",
        "Prev",
        "Curr",
        "In",
        "Out",
        "Previous",
        "Current",
        "Previous",
        "Current",
        "Previous",
        "Current",
        "Previous",
        "Current",
        "No",
        "Amount",
        "No",
        "Amount",
        "No",
        "Amount",
        "No",
        "Amount",
        "No",
        "Amount",
        "No",
        "Amount",
        "Curr",
        "Curr",
      ]);

      // worksheet.mergeCells("A4:A3");
      // worksheet.getCell("B5").value = "SL. No.";
      // expect(worksheet.getCell("B5").value).toBe(worksheet.getCell("A4").value);
      // expect(worksheet.getCell("B5").master).toBe(worksheet.getCell("A4"));

      // // ... merged cells share the same style object
      // expect(worksheet.getCell("B5").style).toBe(worksheet.getCell("A4").style);
      // worksheet.getCell("B5").style.font = myFonts.arial;
      // expect(worksheet.getCell("A4").style.font).toBe(myFonts.arial);

      // // unmerging the cells breaks the style links
      // worksheet.unMergeCells("A4");
      // expect(worksheet.getCell("B5").style).not.toBe(
      //   worksheet.getCell("A4").style
      // );
      // expect(worksheet.getCell("B5").style.font).not.toBe(myFonts.arial);

      // // merge by top-left, bottom-right
      // worksheet.mergeCells("K10", "M12");

      // // merge by start row, start column, end row, end column (equivalent to K10:M12)
      // worksheet.mergeCells(10, 11, 12, 13);

      for (let i = 0; i < userData.length; i++) {
        worksheet.addRow(userData[i + 4]);
      }
    }
  }

  // Save the workbook to a file
  const filePath = `periodical/periodical_report.xlsx`;
  await workbook.xlsx.writeFile(filePath);

  return jsonData;
}

export function startScraping({ fromDate, toDate }) {
  // const { fromDate, toDate } = getDateRange(); // Get date range from user input
  if (fromDate && toDate) {
    return scraping(fromDate, toDate);
  }
}
