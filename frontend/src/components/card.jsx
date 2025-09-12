import React from "react";

const Card = ({ title, children }) => {
  return (
    <div className="bg-gray-900 text-white  p-6 border-2 border-transparent 
                    shadow-xl  
                    transition-all duration-300">
      {title && <h2 className="text-xl font-bold text-[#6B6ED4] mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;

