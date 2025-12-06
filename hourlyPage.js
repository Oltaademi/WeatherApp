// Rona Hoxha

const searchBtn = document.getElementById('searchBtn'); 
const cityInput = document.getElementById('cityInput'); 
const alertBox = document.getElementById('alertBox');   
const summaryBox = document.getElementById('summaryBox');
const hourlyContainer = document.getElementById('hourlyContainer'); 
const themeToggle = document.getElementById('themeToggle');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
celsiusBtn.addEventListener('click', () => {
    isCelsius = true;
    celsiusBtn.classList.add('active');
    fahrenheitBtn.classList.remove('active');
    const city = cityInput.value.trim();
    if (city) fetchCityCoordinates(city);
});

fahrenheitBtn.addEventListener('click', () => {
    isCelsius = false;
    fahrenheitBtn.classList.add('active');
    celsiusBtn.classList.remove('active');
    const city = cityInput.value.trim();
    if (city) fetchCityCoordinates(city);
});


themeToggle.textContent = document.body.classList.contains('dark-theme') ? 'Light Mode' : 'Dark Mode';
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    if (globalTemps.length > 0) {
        const city = cityInput.value.trim();
        if (city) fetchCityCoordinates(city);
    }
});

let isCelsius = true; 
let globalTemps = []; 

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
        showAlert('Please enter a city name.', 'danger');
        return;
    }
    fetchCityCoordinates(city); 
});

function fetchCityCoordinates(city) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
    fetch(geoUrl)
        .then(res => res.json()) 
        .then(data => {
            if (!data.results || data.results.length === 0) {
                showAlert('City not found. Try another.', 'warning');
                return;
            }
            const { latitude, longitude, name, country } = data.results[0];
            summaryBox.innerHTML = `<div class='alert alert-primary shadow-sm'>Showing 24-hour forecast for <strong>${name}, ${country}</strong></div>`;
            fetchHourlyWeather(latitude, longitude); 
        })
        .catch(err => showAlert('error getting location info...', 'danger'));
}

function fetchHourlyWeather(lat, lon) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&timezone=auto`;
    fetch(weatherUrl)
        .then(res => res.json())
        .then(data => {
            globalTemps = data.hourly.temperature_2m;
            const hours = data.hourly.time;
            const codes = data.hourly.weathercode;
            displayHourlyForecast(hours, globalTemps, codes); 
        })
        .catch(err => showAlert('something went wrong with weather fetch...', 'danger'));
}

function displayHourlyForecast(times, temps, codes) {
    hourlyContainer.innerHTML = ''; 
    for (let i = 0; i < 24; i++) {
        const hourDate = new Date(times[i]); 
        const hour = hourDate.getHours().toString().padStart(2, '0') + ':00';
        const tempVal = isCelsius ? temps[i] : ((temps[i] * 9 / 5) + 32); 
        const temp = Math.round(tempVal) + (isCelsius ? '°C' : '°F');
        const icon = getWeatherIcon(codes[i]);
        const bg = getHourColor(hourDate.getHours());

        const card = document.createElement('div');
        card.className = 'card weather-card text-center p-2';
        card.style.backgroundColor = bg;
        card.innerHTML = `
      <h6>${hour}</h6>
      <div style="font-size: 2rem">${icon}</div>
      <div>${temp}</div>
    `;
        hourlyContainer.appendChild(card);
    }
}

function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 86) return '❄️';
    return '🌩️'; 
}

function getHourColor(hour) {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
        return '#2a2a2a'; // nice soft dark card for dark mode
    }

    // Light mode backgrounds based on time of day
    if (hour >= 6 && hour < 12) return '#e0f7fa'; // morning
    if (hour >= 12 && hour < 18) return '#f1f8e9'; // afternoon
    if (hour >= 18 && hour < 21) return '#ffe0b2'; // evening
    return '#eceff1'; // night
}




function showAlert(message, type) {
    alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

// Rona Hoxha
