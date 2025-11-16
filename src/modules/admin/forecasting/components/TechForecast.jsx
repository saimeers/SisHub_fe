import React from "react";
import { ForecastChart } from "./ForecastChart";
import { getForecastProjectTechByName } from "../../../../services/forecastService";
import { TECNOLOGIAS } from "../constants/forecastConstants";

export function TechForecast() {
    const techOptions = [
        { id: "default", name: "Ninguna" },
        ...TECNOLOGIAS.map((tech, index) => ({ id: `tech-${index}`, name: tech }))
    ];

    return (
        <ForecastChart
            title="Predicción de Proyectos por Tecnología"
            options={techOptions}
            defaultOption={{ id: "default", name: "Ninguna" }}
            fetchFunction={getForecastProjectTechByName}
            itemType="tech"
        />
    );
}