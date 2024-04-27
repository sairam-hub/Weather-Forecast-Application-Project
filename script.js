const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "85698fce81f047bda2a130349240903"; // API key for WeatherAPI.com

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.date})</h2>
                    <h6>Temperature: ${weatherItem.temp_c}°C</h6>
                    <h6>Wind: ${weatherItem.wind_kph} km/h</h6>
                    <h6>Humidity: ${weatherItem.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="${weatherItem.icon}" alt="weather-icon">
                    <h6>${weatherItem.condition.text}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.date})</h3>
                    <img src="${weatherItem.icon}" alt="weather-icon">
                    <h6>Temp: ${weatherItem.temp_c}°C</h6>
                    <h6>Wind: ${weatherItem.wind_kph} km/h</h6>
                    <h6>Humidity: ${weatherItem.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, location) => {
    const WEATHER_API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=5`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const { current, forecast } = data;

            // Clearing previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Main weather card
            const mainWeather = {
                date: current.last_updated,
                temp_c: current.temp_c,
                wind_kph: current.wind_kph,
                humidity: current.humidity,
                icon: current.condition.icon,
                condition: {
                    text: current.condition.text
                }
            };
            currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, mainWeather, 0));

            // Forecast weather cards
            forecast.forecastday.forEach((day, index) => {
                const forecastWeather = {
                    date: day.date,
                    temp_c: day.day.avgtemp_c,
                    wind_kph: day.day.maxwind_kph,
                    humidity: day.day.avghumidity,
                    icon: day.day.condition.icon,
                    condition: {
                        text: day.day.condition.text
                    }
                };
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, forecastWeather, index + 1));
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.weatherapi.com/v1/geocode/search.json?key=${API_KEY}&q=${cityName}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const location = `${data[0].lat},${data[0].lon}`;
            getWeatherDetails(cityName, location);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            const location = `${latitude},${longitude}`;
            getWeatherDetails("Your Location", location);
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        getCityCoordinates();
    }
});
0