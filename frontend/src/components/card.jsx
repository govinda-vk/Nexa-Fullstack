import React from "react";

const Card = ({ title, children }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 
                    shadow-sm hover:shadow-md  
                    transition-all duration-300">
      {title && <h2 className="text-2xl font-light text-black mb-6 tracking-tight">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;

