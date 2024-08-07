import { launch } from "puppeteer";

// Function to delay execution
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to write data to Excel file
const username = "konapara024";
const password = "PMK@konapara024";

// Function to click the button recursively
// Function to click the button recursively
async function clickButtonRecursively(page, selector, maxClicks) {
  let clickCount = 0;

  while (clickCount < maxClicks) {
    // Wait for the button to be available and then click it
    await page.waitForSelector(selector);
    const button = await page.$(selector);
    await button.click();
    console.log(`Button clicked ${clickCount + 1} times`);

    // Wait for the response indicating the completion of the dayend process
    await new Promise((resolve) => {
      page.on("response", (response) => {
        if (
          response.url().includes("process_day_ends/ajax_execute") &&
          response.status() === 200
        ) {
          console.log("Dayend process completed successfully");
          resolve();
        }
      });
    });

    // Increment the click counter
    clickCount++;
  }

  console.log("Finished clicking the button recursively");
}

// Function to collect data
(async () => {
  const browser = await launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-fullscreen"],
  });
  const page = await browser.newPage();
  await page.goto("https://mfnext.microfin360.com/pmk/#/login");

  // Get screen dimensions
  const dimensions = await page.evaluate(() => {
    return {
      width: window.screen.availWidth,
      height: window.screen.availHeight,
    };
  });

  await page.setViewport({
    width: dimensions.width,
    height: dimensions.height,
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

  await page.goto(
    "https://mfnext.microfin360.com/pmk/#/process/process-day-ends/index"
  );
  await delay(3000);

  // Click the button recursively
  await clickButtonRecursively(page, ".add", 10); // Adjust the number of clicks as needed

  await browser.close();
})();
