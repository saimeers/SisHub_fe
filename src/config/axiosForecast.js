import axios from 'axios';

const axiosForecast = axios.create({
    baseURL: import.meta.env.VITE_FORECAST_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_FORECAST_KEY,
    },
});

export default axiosForecast;