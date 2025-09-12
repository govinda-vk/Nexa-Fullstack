import React from "react";
import { useNavigate } from "react-router-dom";

function CashflowCard() {
  const navigate = useNavigate();

  return (
    <div
      className="flex ms-10  justify-center items-center bg-black rounded-3xl shadow-xl"
      style={{ width: "485px", height: "485px" }}
    >
      <div
        className="flex flex-col justify-center items-center text-center rounded-2xl p-6 
                   border-2 border-transparent shadow-2xl
                   transition-all duration-500 hover:border-[#6B6ED4] hover:shadow-[0_0_27px_#6B6ED4]"
        style={{
          width: "450px",
          height: "450px",
          background: "linear-gradient(135deg, #6B6ED4 0%, #4B4DCB 100%)",
        }}
      >
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-white mb-4 drop-shadow-lg">
          Cashflow Analysis
        </h2>

        {/* Description */}
        <p className="text-white/90 mb-8 max-w-xs leading-relaxed">
          Get a smart breakdown of your income & expenses with sleek interactive charts.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/cashflow")}
          className="bg-white text-[#6B6ED4] px-8 py-3 rounded-xl font-bold shadow-lg 
                     hover:shadow-[#6B6ED4]/60 hover:scale-110 
                     transition-transform duration-300"
        >
          Click Here
        </button>
      </div>
    </div>
  );
}

export default CashflowCard;
