import React from "react";
import { ForecastChart } from "./ForecastChart";
import { getForecastProjectScopeByName } from "../../../../services/forecastService";
import { ALCANCES } from "../constants/forecastConstants";

export function ScopeForecast() {
    const scopeOptions = [
        { id: "default", name: "Ninguno" },
        ...ALCANCES.map((scope, index) => ({ id: `scope-${index}`, name: scope }))
    ];

    return (
        <ForecastChart
            title="Predicción de Proyectos por Tipo de Alcance"
            options={scopeOptions}
            defaultOption={{ id: "default", name: "Ninguno" }}
            fetchFunction={getForecastProjectScopeByName}
            itemType="scope"
        />
    );
}