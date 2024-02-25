import express from "express";
import { startScraping } from "./rmc.js";
import { DateTime } from "luxon";
import bodyParser from "body-parser";
import fs from "fs/promises";
import cors from "cors";
import { scraping } from "./fbs.js";
import { fbsReport } from "./fbs_report.js";
const app = express();
const port = 3000;

// Use bodyParser middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use cors middleware to enable CORS
app.use(
  cors({
    origin: "https://periodical-report.vercel.app",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // enable set cookie
  })
);
// Define a route to run the script when the API is hit
app.post("/api/scraping", async (req, res) => {
  const { fromDate, toDate } = req.body;
  // console.log(fromDate, toDate);

  try {
    // Require and run the index.js script with fromDate and toDate parameters
    const data = await startScraping({ fromDate, toDate });
    res.send({ message: "scraping successfully completed", data });
  } catch (error) {
    console.error("Error running script:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/scraping/fbs", async (req, res) => {
  const { toDate } = req.body;
  // console.log(fromDate, toDate);

  try {
    // Require and run the index.js script with fromDate and toDate parameters
    await scraping(toDate);
    // await fbsReport();
    res.send({ message: "scraping successfully completed" });
  } catch (error) {
    console.error("Error running script:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/scraping/fbs_interest", async (req, res) => {
  // console.log(fromDate, toDate);

  try {
    // Require and run the index.js script with fromDate and toDate parameters
    await fbsReport();
    res.send({ message: "scraping successfully completed" });
  } catch (error) {
    console.error("Error running script:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Define a route to fetch and show data from the JSON file
app.get("/api/data", async (req, res) => {
  try {
    // Read the content of the data.json file
    const data = await fs.readFile("./periodical.json", "utf-8");
    // console.log(data);
    const jsonData = JSON.parse(data);

    // Send the JSON data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/fbs", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./fbs.json", "utf-8");
    const jsonData = JSON.parse(data);

    const formattedData = {};

    // Iterate over each object in the JSON data
    Object.keys(jsonData).forEach((objName) => {
      const objData = jsonData[objName];

      // Extract the values associated with the keys
      const branch_info =
        objData.branch_info || "Branch information not provided";
      const report_view = objData.report_view || "Report view not provided";
      const fdr_info = objData.fdr_info || "FDR information not provided";
      const date_to = objData.date_to || "Date to not provided";

      // Format the data for the current object
      formattedData[objName] = { branch_info, report_view, fdr_info, date_to };
    });

    // Send the formatted data in the response
    res.json(formattedData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/fbs/list", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./fbs.json", "utf-8");
    const jsonData = JSON.parse(data);

    const formattedData = {};

    // Iterate over each object in the JSON data
    Object.keys(jsonData).forEach((objName) => {
      const objData = jsonData[objName];

      const fdr_info = Array.isArray(objData.fdr_info) ? objData.fdr_info : [];

      // Format the data for the current object
      formattedData[objName] = fdr_info;
    });

    // Send the formatted data in the response
    res.json(formattedData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/fbs/interest/:date", async (req, res) => {
  try {
    const requestedDate = req.params.date; // Get the date from the URL parameter
    const parsedDate = DateTime.fromISO(requestedDate);

    if (!parsedDate.isValid) {
      // If the provided date is invalid, return a 400 Bad Request response
      return res
        .status(400)
        .send(
          "Invalid date format. Please provide the date in ISO format (YYYY-MM-DD)."
        );
    }

    // Read the content of the fbs.json file
    const data = await fs.readFile("./fbs_report.json", "utf-8");
    const jsonData = JSON.parse(data);
    let interestData = [];

    for (const key in jsonData) {
      const value = jsonData[key];
      if (value.saving_schedules) {
        interestData.push(value);
      }
    }

    // Filter out the matching objects whose savings schedule has the requested date
    const matchingObjects = interestData.filter((obj) => {
      return obj.saving_schedules.some(
        (schedule) => schedule.date === requestedDate
      );
    });

    // Send the matching objects in the response
    res.json(matchingObjects);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/fbs/:id", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./fbs_report.json", "utf-8");
    const jsonData = JSON.parse(data);
    const id = req.params.id;
    const formattedData = jsonData[id];
    // Send the formatted data in the response
    res.json(formattedData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);

  // available ports

  console.log(`Server is running at http://localhost:${port}/api/scraping`);
  console.log("");
  console.log(`Server is running at http://localhost:${port}/api/scraping/fbs`);
  console.log("toDate");
  console.log(
    `Server is running at http://localhost:${port}/api/scraping/fbs_interest`
  );
  console.log("");
  // for 22
  console.log(`Server is running at http://localhost:${port}/api/data`);

  // for 22
  console.log(`Server is running at http://localhost:${port}/api/fbs/list`);
  //for fbs
  console.log(`Server is running at http://localhost:${port}/api/fbs`);

  //for fbs
  console.log(
    `Server is running at http://localhost:${port}/api/fbs/interest/:date`
  );

  //for fbs member id
  console.log(`Server is running at http://localhost:${port}/api/fbs/:id`);

  console.log("exam-> /fbs/2024-02-25");
});
