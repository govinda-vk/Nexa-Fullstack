import React from "react";
import { useNavigate } from "react-router-dom";

function CashflowCard() {
  const navigate = useNavigate();

  return (
    <div
      className="flex ms-10 justify-center items-center bg-black rounded-2xl shadow-sm border border-gray-800"
      style={{ width: "485px", height: "485px" }}
    >
      <div
        className="flex flex-col justify-center items-center text-center rounded-xl p-8 
                   border border-gray-700 bg-black
                   transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
        style={{
          width: "450px",
          height: "450px",
        }}
      >
        {/* Title */}
        <h2 className="text-4xl font-light text-white mb-6 tracking-tight leading-tight">
          Cashflow Analysis
        </h2>

        {/* Description */}
        <p className="text-gray-300 mb-10 max-w-sm leading-relaxed text-lg font-light">
          Get a smart breakdown of your income & expenses with sleek interactive charts.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/cashflow")}
          className="bg-white text-black px-10 py-4 rounded-full font-medium text-base
                     hover:bg-gray-200 
                     transition-all duration-200 ease-out
                     border-none shadow-sm hover:shadow-md"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default CashflowCard;