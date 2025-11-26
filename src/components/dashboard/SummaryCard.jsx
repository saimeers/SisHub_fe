import { twMerge } from "tailwind-merge";
import { IconContext } from "react-icons";

const SummaryCard = ({
  title,
  value,
  helper,
  icon,
  accent = "from-red-600 via-red-500 to-rose-500",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 flex items-center gap-4">
      <div
        className={twMerge(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-br",
          accent
        )}
      >
        <IconContext.Provider value={{ size: 22 }}>
          {icon}
        </IconContext.Provider>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}
        </p>
        {helper && <p className="text-xs text-gray-500">{helper}</p>}
      </div>
    </div>
  );
};

export default SummaryCard;

