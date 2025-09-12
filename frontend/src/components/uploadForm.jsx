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
    <Card title="📊 Upload Expenses">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Excel/CSV Upload */}
        <div>
          <label className="block text-sm mb-3 text-gray-600 font-light">
            Upload Excel/CSV File
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="w-full text-black bg-gray-50 p-4 rounded-lg border border-gray-300 
                       file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                       file:text-sm file:font-medium
                       file:bg-black file:text-white
                       hover:file:bg-gray-800 cursor-pointer
                       focus:border-black focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-center">
          <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-light rounded-full">
            OR
          </span>
        </div>

        {/* Manual Entry */}
        <div className="space-y-4">
          <label className="block text-sm text-gray-600 font-light mb-3">
            Or enter manually
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Expense Name"
              value={manualData.name}
              onChange={handleManualChange}
              className="px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                         focus:border-black focus:ring-1 focus:ring-black outline-none
                         placeholder-gray-400 font-light transition-colors"
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={manualData.category}
              onChange={handleManualChange}
              className="px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                         focus:border-black focus:ring-1 focus:ring-black outline-none
                         placeholder-gray-400 font-light transition-colors"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={manualData.amount}
              onChange={handleManualChange}
              className="px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                         focus:border-black focus:ring-1 focus:ring-black outline-none
                         placeholder-gray-400 font-light transition-colors"
            />
            <input
              type="date"
              name="date"
              value={manualData.date}
              onChange={handleManualChange}
              className="px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                         focus:border-black focus:ring-1 focus:ring-black outline-none
                         font-light transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-black text-white py-4 rounded-full font-medium text-base
                     hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Analyze Data
        </button>
      </form>
    </Card>
  );
};

export default UploadForm;
