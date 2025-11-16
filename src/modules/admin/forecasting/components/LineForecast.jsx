// src/modules/admin/forecasting/components/LineForecast.jsx

import React from "react";
import { ForecastChart } from "./ForecastChart";
import { getForecastProjectLineByName } from "../../../../services/forecastService";
import { LINEAS } from "../constants/forecastConstants";

export function LineForecast() {
    const lineOptions = [
        { id: "default", name: "Ninguna" },
        ...LINEAS.map((line, index) => ({ id: `line-${index}`, name: line }))
    ];

    return (
        <ForecastChart
            title="Predicción de Proyectos por Línea de Investigación"
            options={lineOptions}
            defaultOption={{ id: "default", name: "Ninguna" }}
            fetchFunction={getForecastProjectLineByName}
            itemType="line"
        />
    );
}