import axiosForecast from '../config/axiosForecast';
import axiosLLM from '../config/axiosLLM';

export async function getForecastProjectAll() {
    try {
        const { data } = await axiosForecast.get("/cached/forecast/project-total");
        return data;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el forecast";
        throw new Error(msg);
    }
}

export async function getForecastProjectLine() {
    try {
        const { data } = await axiosForecast.get("/cached/forecast/project-line");
        return data;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el forecast";
        throw new Error(msg);
    }
}

export async function getForecastProjectLineByName(name) {
    try {
        const { data } = await axiosForecast.post("/forecast/project-line",{name, semesters: 1});
        return data;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el forecast";
        throw new Error(msg);
    }
}

export async function getForecastProjectScope() {
    try {
        const { data } = await axiosForecast.get("/cached/forecast/project-scope");
        return data;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el forecast";
        throw new Error(msg);
    }
}

export async function getForecastProjectScopeByName(name) {
    try {
        const { data } = await axiosForecast.post("/forecast/project-scope",{name, semesters: 1});
        return data;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el forecast";
        throw new Error(msg);
    }
}

export async function getForecastProjectTech() {
    try {
        const { data } = await axiosForecast.get("/cached/forecast/project-tech");
        return data;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el forecast";
        throw new Error(msg);
    }
}

export async function getForecastProjectTechByName(name) {
    try {
        const { data } = await axiosForecast.post("/forecast/project-tech",{name, semesters: 1});
        return data;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el forecast";
        throw new Error(msg);
    }
}

export async function getPrescriptiveProject(forecastData, itemName, itemType) {
    const context = JSON.stringify({
        type: itemType, 
        name: itemName,
        history: forecastData.history,
        forecasting: forecastData.forecasting,
        semesters: forecastData.semesters
    });

    console.log(context);

    const payload = { context };

    try {
        const { data } = await axiosLLM.post("/run", payload);
        console.log(data);
        return data.analysis;
    } catch (err) {
        const msg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Error al obtener el análisis prescriptivo";
        throw new Error(msg);
    }
}