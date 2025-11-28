import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { FiUsers, FiBookmark, FiPieChart, FiTrendingUp } from "react-icons/fi";
import SummaryCard from "./SummaryCard";
import GraphCard from "./GraphCard";
import { fetchGraphDataset, fetchTagMetric } from "../../services/dashboardService";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import LoadingScreen from "../ui/LoadingScreen";

const SUMMARY_CONFIG = [
  {
    endpoint: "proyectos-completados",
    title: "Proyectos calificados",
    helper: "Estado CALIFICADO",
    field: "cantidad",
    icon: <FiBookmark />,
    accent: "from-red-600 via-rose-500 to-pink-500",
    formatter: (value) => value?.cantidad ?? 0,
  },
  {
    endpoint: "proyectos-disponibles",
    title: "Ideas disponibles",
    helper: "Ideas libres listas para asignar",
    icon: <FiTrendingUp />,
    accent: "from-orange-500 via-amber-500 to-yellow-400",
    formatter: (value) => value?.cantidad ?? 0,
  },
  {
    endpoint: "promedio-integrantes",
    title: "Integrantes por equipo",
    helper: (value) =>
      `${value?.total_integrantes ?? 0} integrantes en ${value?.total_equipos ?? 0} equipos`,
    icon: <FiUsers />,
    accent: "from-emerald-500 via-green-500 to-teal-500",
    formatter: (value) => (value?.promedio ?? 0).toFixed(2),
  },
  {
    endpoint: "estadisticas-grupos",
    title: "Grupos activos",
    helper: (value) =>
      `${value?.activos ?? 0} activos / ${value?.inactivos ?? 0} inactivos`,
    icon: <FiPieChart />,
    accent: "from-blue-500 via-indigo-500 to-sky-500",
    formatter: (value) => value?.total ?? 0,
  },
];

const GRAPH_CONFIG = [
  {
    endpoint: "proyectos-semestre",
    title: "Proyectos por semestre",
    description: "Semestres académicos",
    type: "area",
    xKey: "semester",
    yKey: "total",
  },
  {
    endpoint: "actividad-reciente",
    title: "Actividad reciente",
    description: "Últimos 6 meses",
    type: "bar",
    xKey: "mes",
    yKey: "cantidad",
  },
  {
    endpoint: "porcentaje-roles",
    title: "Distribución de roles",
    description: "Usuarios activos",
    type: "pie",
    nameKey: "rol",
    valueKey: "cantidad",
  },
  {
    endpoint: "proyectos-estado",
    title: "Proyectos por estado",
    description: "Estados actuales",
    type: "pie",
    nameKey: "estado",
    valueKey: "cantidad",
  },
  {
    endpoint: "ideas-estado",
    title: "Ideas por estado",
    type: "pie",
    nameKey: "estado",
    valueKey: "cantidad",
  },
  {
    endpoint: "tendencia-tecnologias",
    title: "Top tecnologías",
    description: "Tecnologías más usadas",
    type: "bar",
    xKey: "tecnologia",
    yKey: "cantidad",
  },
  {
    endpoint: "tendencia-lineas",
    title: "Líneas de investigación",
    type: "bar",
    xKey: "linea",
    yKey: "cantidad",
  },
  {
    endpoint: "materias-proyectos",
    title: "Materias con más proyectos",
    type: "bar",
    xKey: "nombre_materia",
    yKey: "cantidad",
  },
  {
    endpoint: "proyectos-alcance",
    title: "Proyectos por alcance",
    type: "pie",
    nameKey: "tipo_alcance",
    valueKey: "cantidad",
  },
  {
    endpoint: "entregables-tipo",
    title: "Entregables por tipo",
    type: "bar",
    xKey: "tipo",
    yKey: "cantidad",
  },
  {
    endpoint: "top-lideres",
    title: "Top líderes",
    description: "Equipos liderados",
    type: "bar",
    xKey: "nombre_usuario",
    yKey: "cantidad_proyectos",
  },
];

const COLORS = [
  "#2563EB",
  "#0EA5E9",
  "#14B8A6",
  "#10B981",
  "#22C55E",
  "#F59E0B",
  "#F97316",
  "#EC4899",
  "#8B5CF6",
  "#6366F1",
  "#94A3B8",
];

const DashboardView = () => {
  const [graphData, setGraphData] = useState({});
  const [tagData, setTagData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [graphsResponse, tagsResponse] = await Promise.all([
        Promise.all(
          GRAPH_CONFIG.map(async (cfg) => [
            cfg.endpoint,
            await fetchGraphDataset(cfg.endpoint),
          ])
        ),
        Promise.all(
          SUMMARY_CONFIG.map(async (cfg) => [
            cfg.endpoint,
            await fetchTagMetric(cfg.endpoint),
          ])
        ),
      ]);

      setGraphData(Object.fromEntries(graphsResponse));
      setTagData(Object.fromEntries(tagsResponse));
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message || "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summaryItems = useMemo(
    () =>
      SUMMARY_CONFIG.map((item) => {
        const data = tagData[item.endpoint];
        return {
          ...item,
          value:
            typeof item.formatter === "function"
              ? item.formatter(data)
              : data?.[item.field] ?? 0,
          helper:
            typeof item.helper === "function"
              ? item.helper(data)
              : item.helper,
        };
      }),
    [tagData]
  );

  const renderChart = (config, data) => {
    if (config.type === "pie") {
      return renderPieChart(
        data,
        config.nameKey,
        config.valueKey,
        config.showLegend
      );
    }

    if (config.type === "area") {
      return renderAreaChart(data, config.xKey, config.yKey);
    }

    return renderBarChart(data, config.xKey, config.yKey);
  };

  if (loading && !lastUpdate) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">
            Información centralizada de proyectos, usuarios e ideas.
          </p>
          {lastUpdate && (
            <p className="text-xs text-gray-400">
              Última actualización: {lastUpdate.toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#B70000] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#930000] transition-colors"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryItems.map((card) => (
          <SummaryCard key={card.endpoint} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {GRAPH_CONFIG.map((cfg) => (
          <GraphCard
            key={cfg.endpoint}
            title={cfg.title}
            description={cfg.description}
            isLoading={loading}
            empty={!graphData[cfg.endpoint]?.length}
          >
            <div className="h-[260px]">
              {renderChart(cfg, graphData[cfg.endpoint] || [])}
            </div>
          </GraphCard>
        ))}
      </div>
    </div>
  );
};

const renderPieChart = (data, nameKey, valueKey) => {
  const chartConfig = data.reduce((acc, item, index) => {
    const label = item[nameKey] ?? `Dato ${index + 1}`;
    acc[label] = {
      label,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {});

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, bottom: 10 }}>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const renderBarChart = (data, xKey, yKey) => {
  const chartConfig = {
    [yKey]: {
      label: "Total",
      color: COLORS[0],
    },
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            tick={<CustomTick />}
            interval={0}
            tickLine={false}
            axisLine={false}
            height={60}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey={yKey} radius={[8, 8, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const renderAreaChart = (data, xKey, yKey) => {
  const chartConfig = {
    [yKey]: {
      label: "Total",
      color: COLORS[1],
    },
  };
  const color = COLORS[1];

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            fill="url(#colorArea)"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const CustomTick = ({ x, y, payload }) => {
  const lines = splitLabel(payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={`${line}-${index}`}
          x={0}
          y={12 + index * 12}
          textAnchor="middle"
          fill="#4B5563"
          fontSize={11}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const splitLabel = (label, maxChars = 12) => {
  if (!label) return [""];
  const words = label.split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if ((current + word).length <= maxChars) {
      current = current ? `${current} ${word}` : word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 3);
};

export default DashboardView;

