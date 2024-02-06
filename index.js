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
  const loading = document.getElementById("loading");
  const searchForm = document.querySelector("form");

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
    // Get the values from the form
    const fromDate = document.getElementById("from").value;

    const toDate = document.getElementById("toDate").value;
    // console.log(fromDate);
    // console.log(toDate);
    // Make a POST request to your API endpoint with the form data
    loading.classList.remove("hidden");

    loading.classList.add("loading");

    fetch("http://localhost:3000/api/scraping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fromDate, toDate }),
    })
      .then((response) => response.json())
      .then((data) => loading.classList.add("hidden"))
      .catch((error) => console.error("Error:", error));
  }
  getDataButton.addEventListener("click", fetchData);
  searchForm.addEventListener("submit", searchByDate);

  function startCountdown() {
    let countdownTime = 180;
    updateClock(countdownTime);

    let countdownInterval = setInterval(function () {
      countdownTime--;

      if (countdownTime >= 0) {
        updateClock(countdownTime);
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);

    function updateClock(timeInSeconds) {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;

      const minutesStr = String(minutes).padStart(2, "0");
      const secondsStr = String(seconds).padStart(2, "0");

      const clock = document.getElementById("countdown-clock");
      clock.innerHTML = `
  <div class="flip">${createFlipCard(minutesStr[0])}</div>
  <div class="flip">${createFlipCard(minutesStr[1])}</div>
  <br></br>
  <div class="flip-divider">:</div>
  <div class="flip">${createFlipCard(secondsStr[0])}</div>
  <div class="flip">${createFlipCard(secondsStr[1])}</div>
`;
    }

    function createFlipCard(digit) {
      return `
  <div class="flip">
    <div class="upper">${digit}</div>
    <div class="lower">${digit}</div>
  </div>
`;
    }
  }
  startCountdown();
});
