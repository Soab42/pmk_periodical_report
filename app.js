import express from "express";
import { startScraping } from "./rmc.js";
import bodyParser from "body-parser";
import fs from "fs/promises";

const app = express();
const port = 3000;

// Use bodyParser middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Define a route to run the script when the API is hit
app.post("/api/scraping", async (req, res) => {
  const { fromDate, toDate } = req.body;
  console.log(fromDate, toDate);

  try {
    // Require and run the index.js script with fromDate and toDate parameters
    const data = await startScraping({ fromDate, toDate });
    res.send({ message: "scraping successfully completed", data });
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
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
