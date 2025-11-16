import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from "../../../../components/ui/card";
import { toast } from "react-toastify";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../../../../components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select";
import dayjs from "dayjs";
import "dayjs/locale/es";
import TypingText from "./typing-text";
import { motion } from "framer-motion";
import { getPrescriptiveProject } from "../../../../services/forecastService";
import { DEFAULT_HISTORY, DEFAULT_FORECASTING } from "../constants/forecastConstants";

export function ForecastChart({
    title,
    options,
    defaultOption,
    fetchFunction,
    itemType
}) {
    const [selectedItem, setSelectedItem] = useState(`${defaultOption.name}-${defaultOption.id}`);
    const [prescriptive, setPrescriptive] = useState("");
    const [historyData, setHistoryData] = useState([]);
    const [projectionData, setProjectionData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isAnimating, setIsAnimating] = useState(true);

    const defaultForecastData = {
        name: defaultOption.name,
        history: DEFAULT_HISTORY,
        forecasting: DEFAULT_FORECASTING,
    };

    useEffect(() => {
        const svg = document.querySelector(".recharts-wrapper");
        if (!svg) return;

        const areaPaths = svg.querySelectorAll(".recharts-area-area path");
        areaPaths.forEach((path) => {
            if (isAnimating) {
                path.classList.add("animate-pulse-line");
            } else {
                path.classList.remove("animate-pulse-line");
            }
        });
    }, [isAnimating]);

    useEffect(() => {
        if (!selectedItem) return;
        setIsAnimating(true);
    }, [selectedItem]);

    const formatSemester = (dateStr) => {
        const date = dayjs(dateStr);
        const month = date.month();
        const year = date.year();

        if (month === 1) {
            return `S1 ${year}`;
        } else {
            return `S2 ${year}`;
        }
    };

    useEffect(() => {
        if (selectedItem === `${defaultOption.name}-${defaultOption.id}`) {
            const byDate = (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime();
            const rawHist = [...defaultForecastData.history].sort(byDate);
            const rawFct = [...defaultForecastData.forecasting].sort(byDate);

            const history = rawHist.map((d) => ({
                originalDate: d.date,
                date: formatSemester(d.date),
                value: d.value,
            }));

            const forecast = rawFct.map((d) => ({
                originalDate: d.date,
                date: formatSemester(d.date),
                value: d.value,
            }));

            setHistoryData(history);
            setProjectionData([...history, ...forecast]);
            setPrescriptive("Selecciona una opción para ver el análisis prescriptivo.");
            setLoading(false);
        }
    }, [selectedItem]);

    useEffect(() => {
        if (!selectedItem || selectedItem === `${defaultOption.name}-${defaultOption.id}`) return;

        setLoading(true);
        setError("");

        const name = selectedItem.split("-")[0];

        fetchFunction(name)
            .then(async (response) => {
                const byDate = (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime();
                const rawHist = [...response.history].sort(byDate);
                const rawFct = [...response.forecasting].sort(byDate);

                const history = rawHist.map((d) => ({
                    originalDate: d.date,
                    date: formatSemester(d.date),
                    value: d.value,
                }));

                const forecast = rawFct.map((d) => ({
                    originalDate: d.date,
                    date: formatSemester(d.date),
                    value: d.value,
                    lower: d.lower,
                    upper: d.upper,
                    confidence: d.confidence_pct,
                }));

                setHistoryData(history);
                setProjectionData([...history, ...forecast]);
                setLoading(false);

                try {
                    const prescriptiveText = await getPrescriptiveProject(
                        response,
                        name,
                        itemType
                    );
                    setPrescriptive(prescriptiveText);
                } catch (presErr) {
                    console.error("Error en análisis prescriptivo:", presErr);
                    setPrescriptive("No se pudo generar el análisis prescriptivo.");
                }
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, [selectedItem]);

    useEffect(() => {
        if (error) {
            toast.error("Error al cargar los datos. Por favor, intenta con otra opción.");
        }
    }, [error]);

    const chartHeight = 300;
    const isDefault = selectedItem === `${defaultOption.name}-${defaultOption.id}`;

    return (
        <Card className="bg-[#f8f8f8] text-gray-800 border-2 border-red-200 w-full px-1 py-2 overflow-visible relative h-full">
            <CardHeader className="relative grid grid-cols-1 xl:grid-cols-10 gap-6 items-start mt-5">
                <div className="xl:col-span-10 w-full flex flex-col items-center">
                    <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-4">
                        <CardTitle className="text-lg font-semibold text-gray-900 text-center">
                            {title}
                        </CardTitle>
                        <div className="w-64">
                            <Select onValueChange={(name) => setSelectedItem(name)}>
                                <SelectTrigger className="border border-gray-300 rounded-md px-3 py-2 transition-colors duration-200 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400">
                                    <SelectValue
                                        placeholder="Selecciona una opción"
                                        defaultValue={`${defaultOption.name}-${defaultOption.id}`}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map((opt) => (
                                        <SelectItem key={opt.id} value={`${opt.name}-${opt.id}`}>
                                            {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative grid grid-cols-1 xl:grid-cols-10 gap-6 items-start">
                {loading && projectionData.length === 0 && !error ? (
                    <>
                        <div className="xl:col-span-7 w-full space-y-4">
                            <Skeleton className="h-6 w-3/4 rounded bg-gray-300" />
                            <Skeleton className="h-6 w-full rounded bg-gray-200" />
                            <Skeleton className="h-[200px] w-full rounded bg-gray-100" />
                        </div>
                        <div className="xl:col-span-3 w-full space-y-4">
                            <Skeleton className="h-5 w-[90%] rounded bg-gray-300" />
                            <Skeleton className="h-5 w-[80%] rounded bg-gray-200" />
                            <Skeleton className="h-5 w-[60%] rounded bg-gray-100" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="xl:col-span-7 w-full">
                            <div style={{ width: "100%", height: chartHeight }}>
                                {projectionData.length > 0 ? (
                                    <ChartContainer config={{}} className="h-full w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={projectionData}
                                                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    minTickGap={32}
                                                    allowDuplicatedCategory={false}
                                                />
                                                <YAxis stroke="#888" />

                                                {!isDefault && (
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={
                                                            <ChartTooltipContent
                                                                labelFormatter={(val) => {
                                                                    const item = projectionData.find(
                                                                        (d) => d.date === val
                                                                    );
                                                                    if (!item) return val;
                                                                    return formatSemester(item.originalDate);
                                                                }}
                                                                labelClassName="text-black"
                                                                indicator="dot"
                                                            />
                                                        }
                                                    />
                                                )}

                                                <Legend
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    wrapperStyle={{
                                                        bottom: 10,
                                                        fontSize: 16,
                                                        fontWeight: "600",
                                                    }}
                                                    iconType="rect"
                                                    iconSize={14}
                                                />

                                                <Area
                                                    key="history"
                                                    type="monotone"
                                                    dataKey="value"
                                                    data={historyData}
                                                    stroke={isDefault ? "#737373" : "#DC2626"}
                                                    fill={isDefault ? "#d4d4d4" : "#DC2626"}
                                                    fillOpacity={0.1}
                                                    name="Histórico"
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                    isAnimationActive={true}
                                                    animationDuration={1000}
                                                    animationEasing="ease-in-out"
                                                    className={isAnimating ? "animate-pulse-line" : ""}
                                                />

                                                <Area
                                                    key="projection"
                                                    type="monotone"
                                                    dataKey="value"
                                                    data={projectionData}
                                                    stroke={isDefault ? "#a3a3a3" : "#EF4444"}
                                                    fill={isDefault ? "#d4d4d4" : "#EF4444"}
                                                    fillOpacity={0.08}
                                                    name="Proyección"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    isAnimationActive={true}
                                                    animationDuration={1000}
                                                    animationEasing="ease-in-out"
                                                    className={isAnimating ? "animate-pulse-line" : ""}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                ) : (
                                    !loading &&
                                    selectedItem &&
                                    !error && (
                                        <div className="flex items-center justify-center h-full">
                                            No hay datos para mostrar.
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="xl:col-span-3 w-full h-full">
                            <TypingText text={prescriptive} />
                        </div>

                        {!isDefault && projectionData.length > 0 && (
                            <motion.div
                                className="xl:col-span-10 w-full mt-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <motion.div
                                        className="relative overflow-hidden bg-white rounded-xl p-4 border-l-4 border-orange-400 shadow-md"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                    >
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Escenario Bajo</p>
                                        <motion.p
                                            className="text-3xl font-black text-orange-600 mb-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            {projectionData[projectionData.length - 1]?.lower || "N/A"}
                                        </motion.p>
                                        <p className="text-xs text-gray-500">Proyectos mínimos esperados</p>
                                        <div className="absolute top-2 right-2 w-12 h-12 bg-orange-100 rounded-full opacity-20"></div>
                                    </motion.div>

                                    <motion.div
                                        className="relative overflow-hidden bg-white rounded-xl p-4 border-l-4 border-red-600 shadow-md"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                    >
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Escenario Central</p>
                                        <motion.p
                                            className="text-3xl font-black text-red-600 mb-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
                                        >
                                            {projectionData[projectionData.length - 1]?.value || "N/A"}
                                        </motion.p>
                                        <p className="text-xs text-gray-500">Predicción más probable</p>
                                        <div className="absolute top-2 right-2 w-12 h-12 bg-red-100 rounded-full opacity-20"></div>
                                    </motion.div>

                                    <motion.div
                                        className="relative overflow-hidden bg-white rounded-xl p-4 border-l-4 border-rose-400 shadow-md"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                    >
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Escenario Alto</p>
                                        <motion.p
                                            className="text-3xl font-black text-rose-600 mb-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.5 }}
                                        >
                                            {projectionData[projectionData.length - 1]?.upper || "N/A"}
                                        </motion.p>
                                        <p className="text-xs text-gray-500">Proyectos máximos esperados</p>
                                        <div className="absolute top-2 right-2 w-12 h-12 bg-rose-100 rounded-full opacity-20"></div>
                                    </motion.div>

                                    <motion.div
                                        className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 shadow-md"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                    >
                                        <p className="text-xs font-semibold text-red-100 uppercase tracking-wide mb-2">Nivel de Confianza</p>
                                        <motion.p
                                            className="text-3xl font-black text-white mb-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.6 }}
                                        >
                                            {projectionData[projectionData.length - 1]?.confidence?.toFixed(1) || "N/A"}%
                                        </motion.p>
                                        <p className="text-xs text-red-100">Certeza del modelo</p>
                                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full opacity-10 transform translate-x-6 translate-y-6"></div>
                                    </motion.div>
                                </div>

                                <motion.div
                                    className="mt-6 bg-white rounded-lg p-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-700">Rango de Predicción</span>
                                        <span className="text-sm font-bold text-red-600">
                                            {projectionData[projectionData.length - 1]?.lower} → {projectionData[projectionData.length - 1]?.upper}
                                        </span>
                                    </div>

                                    <div className="relative h-4 bg-gray-200 rounded-full overflow-visible shadow-inner mb-8">
                                        {/* Barra de gradiente */}
                                        <motion.div
                                            className="absolute h-full bg-gradient-to-r from-orange-400 via-red-500 to-rose-400 rounded-full"
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
                                        ></motion.div>

                                        {/* Indicador del valor central con posición corregida */}
                                        <motion.div
                                            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                                            initial={{
                                                left: '0%',
                                                opacity: 0
                                            }}
                                            animate={{
                                                left: `${((projectionData[projectionData.length - 1]?.value - projectionData[projectionData.length - 1]?.lower) /
                                                    (projectionData[projectionData.length - 1]?.upper - projectionData[projectionData.length - 1]?.lower)) * 100}%`,
                                                opacity: 1
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                delay: 0.9,
                                                ease: "easeOut"
                                            }}
                                        >
                                            <div className="relative flex flex-col items-center">
                                                {/* Línea vertical */}
                                                <div className="w-0.5 h-6 bg-red-700 mb-1"></div>

                                                {/* Círculo principal */}
                                                <div className="relative">
                                                    <div className="w-4 h-4 bg-white border-2 border-red-700 rounded-full shadow-lg">
                                                        <div className="absolute inset-0.5 bg-red-600 rounded-full"></div>
                                                    </div>
                                                </div>

                                                {/* Etiqueta con el valor */}
                                                <div className="mt-2 bg-red-700 text-white text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                                                    {projectionData[projectionData.length - 1]?.value}
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Marcadores de límites */}
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-600 rounded-l-full"></div>
                                        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-rose-600 rounded-r-full"></div>
                                    </div>
                                </motion.div>

                            </motion.div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}