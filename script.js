const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorDiv = document.getElementById("error");
const weatherIcon = document.getElementById("weatherIcon");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const uvIndex = document.getElementById("uvIndex");
const forecastContainer = document.getElementById("forecastContainer");

//show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

//hide error messag
function hideError() {
  errorDiv.style.display = "none";
}

// Converts weather code to description and icon
function getWeatherDescription(code) {
  const weatherCodes = {
    0: { description: "Clear sky", icon: "wi wi-day-sunny" },
    1: { description: "Partly cloudy", icon: "wi wi-day-cloudy" },
    2: { description: "Partly cloudy", icon: "wi wi-day-cloudy" },
    3: { description: "Partly cloudy", icon: "wi wi-cloudy" },
    45: { description: "Foggy", icon: "wi wi-fog" },
    48: { description: "Foggy", icon: "wi wi-fog" },
    51: { description: "Drizzle", icon: "wi wi-sprinkle" },
    53: { description: "Drizzle", icon: "wi wi-sprinkle" },
    55: { description: "Drizzle", icon: "wi wi-sprinkle" },
    61: { description: "Rain", icon: "wi wi-rain" },
    63: { description: "Rain", icon: "wi wi-rain" },
    65: { description: "Rain", icon: "wi wi-rain" },
    71: { description: "Snow", icon: "wi wi-snow" },
    73: { description: "Snow", icon: "wi wi-snow" },
    75: { description: "Snow", icon: "wi wi-snow" },
    80: { description: "Rain showers", icon: "wi wi-showers" },
    81: { description: "Rain showers", icon: "wi wi-showers" },
    82: { description: "Rain showers", icon: "wi wi-showers" },
    95: { description: "Thunderstorm", icon: "wi wi-thunderstorm" },
  };
  return weatherCodes[code] || { description: "Unknown", icon: "wi wi-na" };
}

// Gets city coordinates
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    showError("City not found. Check your spelling.");
    return null;
  }

  hideError();
  return data.results[0];
}

// Fetches weather data
async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();

  return data;
}

// update weather card
function displayCurrentWeather(data, name, country) {
  const temp = Math.round(data.current.temperature_2m);
  const humidity_val = data.current.relative_humidity_2m;
  const wind_val = data.current.wind_speed_10m;
  const code = data.current.weather_code;
  const feelsLike = Math.round(data.current.apparent_temperature);
  const weather = getWeatherDescription(code);

  cityName.textContent = `${name}, ${country}`;
  temperature.textContent = `${temp}°C`;
  condition.textContent = `${weather.description} · Feels like ${feelsLike}°C`;
  humidity.textContent = `${humidity_val}%`;
  windSpeed.textContent = `${wind_val} km/h`;
  weatherIcon.innerHTML = `<i class="${weather.icon}"></i>`;

  const uv = data.daily.uv_index_max[0];
  if (uv <= 2) {
    uvIndex.textContent = "Low";
  } else if (uv <= 5) {
    uvIndex.textContent = "Moderate";
  } else if (uv <= 7) {
    uvIndex.textContent = "High";
  } else {
    uvIndex.textContent = "Very High";
  }
}

// build forecast rows
function displayForecast(daily) {
  forecastContainer.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const date = new Date(daily.time[i]);
    const dayName =
      i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" });

    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);

    const weather = getWeatherDescription(daily.weather_code[i]);

    const row = `
        <div class="forecast-row">
            <p>${dayName}</p>
            <i class="${weather.icon}"></i>
            
            <div class="forecast-temps">
                <p>${high}°</p>
                <p>${low}°</p>
            </div>
        </div>
        `;
    forecastContainer.innerHTML += row;
  }
}

// Handles search
async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  const coords = await getCoordinates(city);

  if (!coords) return;

  const weatherData = await getWeather(coords.latitude, coords.longitude);

  displayCurrentWeather(weatherData, coords.name, coords.country);

  displayForecast(weatherData.daily);
}

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});
