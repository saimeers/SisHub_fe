import React, { useState } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import { TotalForecast } from "../../modules/admin/forecasting/components/TotalForecast";
import { LineForecast } from "../../modules/admin/forecasting/components/LineForecast";
import { ScopeForecast } from "../../modules/admin/forecasting/components/ScopeForecast";
import { TechForecast } from "../../modules/admin/forecasting/components/TechForecast";

const Forecast = () => {
  const [activeTab, setActiveTab] = useState("total");

  const tabs = [
    { id: "total", label: "Total" },
    { id: "line", label: "Línea" },
    { id: "scope", label: "Alcance" },
    { id: "tech", label: "Tecnología" },
  ];

  return (
    <AdminLayout title="Predicción">
      <div className="flex flex-col flex-1 bg-white">
        <div className="@container/main flex flex-col flex-1 gap-3 px-4 py-6 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex justify-center mb-1">
            <div className="flex justify-center space-x-2 bg-gray-100 p-1 rounded-full w-fit mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido por Tab */}
          <div className="rounded-xl w-full mt-0 sm:mt-0">
            {activeTab === "total" && <TotalForecast />}
            {activeTab === "line" && <LineForecast />}
            {activeTab === "scope" && <ScopeForecast />}
            {activeTab === "tech" && <TechForecast />}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Forecast;
