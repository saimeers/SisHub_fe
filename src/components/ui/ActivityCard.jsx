import React from "react";

const ActivityCard = ({
  title = "Actividad",
  description = "",
  onClick,
  rightAction,
}) => {
  return (
    <div
      className="rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] overflow-hidden bg-white"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="relative px-6 py-10 text-center text-white"
           style={{
             background: "linear-gradient(90deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)",
           }}>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">{title}</h2>
        {rightAction && (
          <div className="absolute right-4 top-4">{rightAction}</div>
        )}
      </div>
      <div className="px-8 py-6">
        <p className="text-gray-700 leading-relaxed max-w-3xl">{description}</p>
      </div>
    </div>
  );
};

export default ActivityCard;
