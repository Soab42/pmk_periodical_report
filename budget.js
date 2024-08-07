import { launch } from "puppeteer";
import ExcelJS from "exceljs";
// Function to delay execution
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0]; // Access the first sheet
  const jsonData = [];

  worksheet.eachRow((row, rowNumber) => {
    const rowData = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      rowData[`column${colNumber}`] = Number(cell.value).toFixed(2);
    });
    jsonData.push(rowData);
  });

  return jsonData;
}

export async function openBranchPage(username, password, filePath, cbo_date) {
  const browser = await launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-fullscreen"],
  });
  const page = await browser.newPage();
  await page.goto("https://mfnext.microfin360.com/pmk/#/login");

  // console.log(window.screenX, window.screenY);

  await page.setViewport({
    width: 1920,
    height: 1200,
    deviceScaleFactor: 1,
  });
  console.log(username, password, filePath, cbo_date);
  // console.log(`starting ${username} data collection .....`);
  console.log("\n");
  const usernameInput = await page.$("#__BVID__12");
  const passwordInput = await page.$("#__BVID__13");
  const loginButton = await page.$("button.btn:nth-child(3)");
  // Function to write data to Excel file
  // const username = "dhanmondi";
  // const password = "dhanmondi020";

  // Example usage:
  const data = await readExcel(filePath);

  await usernameInput.type(username);
  await passwordInput.type(password);
  await loginButton.click();

  await delay(3000);
  // console.log("login success and going to 22 point");
  await page.goto(
    "https://mfnext.microfin360.com/pmk/#/config/monthly-targets/add"
  );
  await delay(3000);
  await page.select("#cbo_year", cbo_date); // Replace 'your_option_value' with the actual value you want to select
  const button = await page.$(".ml-3 > button:nth-child(1)");
  await button.click();

  await delay(3000);

  // samity and member
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#txt_savers_member_${i}`);
      if (input) {
        input.value = data[0][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);

  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#txt_member_admission_target_${i}`);
      if (input) {
        input.value = data[1][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);

  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#txt_member_dropout_target_${i}`);
      if (input) {
        input.value = Number(data[2][`column${i + 2}`]);
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);

  await delay(5000);
  const submitBtn = await page.$("button.col-sm-2:nth-child(2)");
  await submitBtn.click();

  // borrower;
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(
        `#current_borrower_with_expired_${i}`
      );
      if (input) {
        input.value = data[3][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#current_borrower_${i}`);
      if (input) {
        input.value = data[4][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#overdue_borrower_${i}`);
      if (input) {
        input.value = data[5][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);

  await delay(5000);
  const submitBtn2 = await page.$("button.col-sm-2:nth-child(3)");
  await submitBtn2.click();

  // savings;
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#MANDATORY_${i}`);
      if (input) {
        input.value = data[6][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#FDR_${i}`);
      if (input) {
        input.value = data[7][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#VOLUNTARY_${i}`);
      if (input) {
        input.value = data[9][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#DPS_${i}`);
      if (input) {
        input.value = data[8][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#MSP_${i}`);
      if (input) {
        input.value = "0.00";
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed
      }
    }
  }, data);

  await delay(5000);

  const submitBtn4 = await page.$("button.col-sm-2:nth-child(4)");
  await submitBtn4.click();

  // loan
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#no_of_borrower_${i}`);
      if (input) {
        input.value = data[10][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);

  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#disbursed_amount_${i}`);
      if (input) {
        input.value = data[11][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#current_outstanding_${i}`);
      if (input) {
        input.value = data[12][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#overdue_outstanding_${i}`);
      if (input) {
        input.value = data[13][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);

  await delay(5000);

  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#current_due_lonee_${i}`);
      if (input) {
        input.value = data[14][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#overdue_lonee_${i}`);
      if (input) {
        input.value = data[15][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#current_due_amount_${i}`);
      if (input) {
        input.value = data[16][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#overdue_amount_${i}`);
      if (input) {
        input.value = data[17][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);

  await delay(5000);

  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#current_loan_recovery_${i}`);
      if (input) {
        input.value = data[18][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#recovery_rate_${i}`);
      if (input) {
        input.value = data[19][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);
  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#current_due_collection_${i}`);
      if (input) {
        input.value = data[20][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);

  await page.evaluate(async (data) => {
    for (let i = 0; i < 12; ) {
      const input = document.querySelector(`#overdue_collection_${i}`);
      if (input) {
        input.value = data[21][`column${i + 2}`];
        const event = new Event("input", { bubbles: true });
        const event2 = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
        input.dispatchEvent(event2);
        i++; // Adjust the column index as needed // Adjust the column index as needed
      }
    }
  }, data);

  await delay(5000);
}
