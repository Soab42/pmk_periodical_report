import express from "express";
import { startScraping } from "./rmc.js";
import { DateTime } from "luxon";
import bodyParser from "body-parser";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import cors from "cors";
import { scraping } from "./fbs.js";
import { fbsReport } from "./fbs_report.js";
import { day } from "./day.js";
import { openBranchPage } from "./budget.js";
const app = express();
const port = 3000;

// Use bodyParser middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://periodical-report.vercel.app",
  "http://127.0.0.1:5500",
  // Add other allowed origins here
];

const corsOptions = {
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // enable set cookie
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
// Set storage engine for multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB file size limit
}).single("fileUpload");

app.post("/api/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (req.file) {
      const fileUrl = `./uploads/${req.file.filename}`;
      res.json({ message: "File uploaded successfully", url: fileUrl });
    } else {
      res.status(400).json({ error: "No file uploaded" });
    }
  });
});

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
app.post("/api/scraping/day", async (req, res) => {
  // console.log(fromDate, toDate);
  console.log("started day");
  try {
    // Require and run the index.js script with fromDate and toDate parameters
    const data = await day();
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
    const data = await fs.readFile("./data/periodical.json", "utf-8");
    // console.log(data);
    const jsonData = JSON.parse(data);

    // Send the JSON data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/branch/info", async (req, res) => {
  try {
    // Read the content of the data.json file
    const data = await fs.readFile("./data/mfnext.json", "utf-8");
    // console.log(data);
    const jsonData = JSON.parse(data);
    // console.log(jsonData);
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
    const data = await fs.readFile("./data/fbs.json", "utf-8");
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
    const data = await fs.readFile("./data/fbs.json", "utf-8");
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
    const data = await fs.readFile("./data/fbs_report.json", "utf-8");
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
    const data = await fs.readFile("./data/fbs_report.json", "utf-8");
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

//health
app.get("/api/health/rp", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/CONSUMER_RP.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});
//consumer
app.get("/api/consumer/orders", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/CONSUMER_ORDER.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/consumer/products", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/CONSUMER_PRODUCT.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/consumer/soldout", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/CONSUMER_SOLDOUT.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/consumer/bill", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/CONSUMER_BILL_PAID.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/consumer/transfer-from", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/CONSUMER_TRANS_FROM.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/consumer/transfer-this", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/CONSUMER_TRANS_THIS.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/health/day", async (req, res) => {
  try {
    // Read the content of the fbs.json file
    const data = await fs.readFile("./data/day.json", "utf-8");
    const jsonData = JSON.parse(data);

    // Send the formatted data in the response
    res.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/budget", async (req, res) => {
  const { username, password, filePath, cbo_date } = req.body;
  // console.log(fromDate, toDate);

  try {
    // Require and run the index.js script with fromDate and toDate parameters
    const data = await openBranchPage(username, password, filePath, cbo_date);
    res.send({ message: "browser successfully open", data });
  } catch (error) {
    console.error("Error running script:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/api/scraping/day", async (req, res) => {
  // console.log(fromDate, toDate);
  console.log("started day");
  try {
    // Require and run the index.js script with fromDate and toDate parameters
    const data = await day();
    res.send({ message: "scraping successfully completed", data });
  } catch (error) {
    console.error("Error running script:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log("");

  console.log(`Server is running at http://localhost:${port}/api/budget`);
  console.log("");
  // available ports
  console.log(`Server is running at http://localhost:${port}/api/scraping`);
  console.log("");

  console.log(`Server is running at http://localhost:${port}/api/scraping/fbs`);
  console.log("");

  console.log(
    `Server is running at http://localhost:${port}/api/scraping/fbs_interest`
  );
  console.log("");
  // for 22
  console.log(`Server is running at http://localhost:${port}/api/data`);
  console.log("");

  console.log(`Server is running at http://localhost:${port}/api/branch/info`);
  console.log("");

  // for 22
  console.log(`Server is running at http://localhost:${port}/api/fbs/list`);
  console.log("");
  //for fbs
  console.log(`Server is running at http://localhost:${port}/api/fbs`);
  console.log("");

  //for fbs
  console.log(
    `Server is running at http://localhost:${port}/api/fbs/interest/:date`
  );
  console.log("");
  //for fbs member id
  console.log(`Server is running at http://localhost:${port}/api/fbs/:id`);
  console.log("");

  console.log(`Server is running at http://localhost:${port}/health.rp`);
  console.log("");
  console.log(`Server is running at http://localhost:${port}/consumer/orders`);
  console.log("");
  console.log(
    `Server is running at http://localhost:${port}/consumer/products`
  );
  console.log("");
  console.log(`Server is running at http://localhost:${port}/consumer/soldout`);
  console.log("");
  console.log(`Server is running at http://localhost:${port}/consumer/bill`);
  console.log("");
  console.log(
    `Server is running at http://localhost:${port}/consumer/bill/transfer-from`
  );
  console.log("");
  console.log(
    `Server is running at http://localhost:${port}/consumer/bill/transfer-this`
  );
  console.log("");
});
