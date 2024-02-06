import { getDefaultStartDate } from "./rmc";

const loginCredentials = [
  { username: "sabuzbag" },
  { username: "badda" },
  { username: "jatrabari040" },
  { username: "konapara" },
  { username: "nayabazar1" },
  { username: "noyabazar2" },
  { username: "noyabazar3" },
  { username: "Nayabazar-2" },
  { username: "azampur" },
  { username: "dkhan063" },
  { username: "uttara103" },
  { username: "panchaboti" },
  { username: "postogola123" },
  { username: "fotulla-2" },
  { username: "samoli" },
  { username: "lalbag" },
  { username: "dhanmondi" },
  { username: "Sastapur2" },
  { username: "fotulla-1" },
];
document.addEventListener("DOMContentLoaded", () => {
  const getDataButton = document.getElementById("getData");
  const searchForm = document.querySelector("form");
  // Get the values from the form
  const fromDate = document.getElementById("from").value;

  const toDate = document.getElementById("toDate").value;

  const fetchData = () => {
    fetch("http://localhost:3000/api/data")
      .then((response) => response.json())
      .then((data) => {
        // Display JSON data in HTML
        const jsonDisplay = document.getElementById("json-display");

        // Loop through loginCredentials usernames
        for (const { username } of loginCredentials) {
          // Check if the username exists in the data
          if (data[username]) {
            jsonDisplay.innerHTML += `<p>${data[username].report_view}</p><br>`;
          } else {
            jsonDisplay.innerHTML += `<p>No data found for username: ${username}</p><br>`;
          }
        }
      })
      .catch((error) => console.error("Error fetching JSON:", error));
  };
  function searchByDate(event) {
    event.preventDefault();
    console.log(event);

    console.log(fromDate);
    console.log(toDate);
    // Make a POST request to your API endpoint with the form data
    // scrapData(fromDate, toDate);
    fetch("http://localhost:3000/api/scraping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: { fromDate: "2024-01-01", toDate: "2024-01-31" },
    })
      .then((response) => response && fetchData())
      .catch((error) => console.error("Error searching data:", error));
  }
  getDataButton.addEventListener("click", fetchData);
  searchForm.addEventListener("submit", searchByDate);
});
