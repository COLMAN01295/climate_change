const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

const API_KEY = "035c5aa96105a880f6d12418dfa1163e";

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const icon = weatherItem.weather[0].icon;
    const description = weatherItem.weather[0].description;
    const temp = (weatherItem.main.temp - 273.15).toFixed(2);
    const windSpeed = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;

    if (index === 0) {
        return `<div class="details">
            <h2>${cityName} (${date})</h2>
            <h4>Temperature: ${temp} &#8728;C</h4>
            <h4>Wind: ${windSpeed} M/S</h4>
            <h4>Humidity: ${humidity}%</h4>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather-icon">
            <h4>${description}</h4>
        </div>`;
    } else {
        return `<li class="card">
            <h3>(${date})</h3>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${temp} &#8728;C</h4>
            <h4>Wind: ${windSpeed} M/S</h4>
            <h4>Humidity: ${humidity}%</h4>
        </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];

            // Filter the forecast to get only one forecast per day
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clear previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardDiv.innerHTML = "";

            // Create weather cards and add them to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // Get user entered city name and remove extra spaces
    if (!cityName) return; // Return if cityName is empty

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
