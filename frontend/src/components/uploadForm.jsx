import React, { useState } from "react";
import Card from "./card.jsx";

const UploadForm = ({ onSubmit }) => {
  const [file, setFile] = useState(null);
  const [manualData, setManualData] = useState({
    name: "",
    category: "",
    amount: "",
    date: "",
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleManualChange = (e) => {
    setManualData({ ...manualData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      // file upload mode
      onSubmit({ file, type: "file" });
    } else {
      // manual entry mode
      onSubmit({ ...manualData, type: "manual" });
    }
  };

  return (
    <Card title=" Upload Expenses">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Excel/CSV Upload */}
        <div>
          <label className="block text-sm mb-2 text-gray-300">
            Upload Excel/CSV
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="w-full text-white bg-[#1a1a1a] p-3 rounded-lg border border-gray-700 
                       file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-[#6B6ED4] file:text-white
                       hover:file:bg-[#5a5dc4] cursor-pointer"
          />
        </div>

        <p className="text-center text-gray-400">OR</p>

        {/* Manual Entry */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Expense Name"
            value={manualData.name}
            onChange={handleManualChange}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-700 
                       focus:border-[#6B6ED4] focus:ring-2 focus:ring-[#6B6ED4] outline-none"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={manualData.category}
            onChange={handleManualChange}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-700 
                       focus:border-[#6B6ED4] focus:ring-2 focus:ring-[#6B6ED4] outline-none"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={manualData.amount}
            onChange={handleManualChange}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-700 
                       focus:border-[#6B6ED4] focus:ring-2 focus:ring-[#6B6ED4] outline-none"
          />
          <input
            type="date"
            name="date"
            value={manualData.date}
            onChange={handleManualChange}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-700 
                       focus:border-[#6B6ED4] focus:ring-2 focus:ring-[#6B6ED4] outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#323686] text-white py-3 rounded-lg font-semibold 
                     hover:scale-105 transition-transform shadow-lg"
        >
          Submit Data
        </button>
      </form>
    </Card>
  );
};

export default UploadForm;
