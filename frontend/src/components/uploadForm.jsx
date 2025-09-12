import React, { useState } from "react";
import Card from "./card.jsx";

const UploadForm = ({ onSubmit, loading, analysisLoading, analysisProgress }) => {
  const [file, setFile] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      // file upload mode
      onSubmit({ 
        file, 
        type: "file", 
        businessName: businessName.trim() || "My Business",
        businessType: businessType.trim()
      });
    }
  };

  const isFormValid = () => {
    return file && businessName.trim().length > 0;
  };

  return (
    <Card title="📊 Upload Expenses">
      {/* Loading States */}
      {(loading || analysisLoading) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
            <span className="text-black font-medium">
              {loading ? 'Uploading data...' : analysisProgress || 'Processing...'}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="space-y-4">
          <label className="block text-sm text-gray-600 font-light mb-3">
            Business Information
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Business Name *"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                         focus:border-black focus:ring-1 focus:ring-black outline-none
                         placeholder-gray-400 font-light transition-colors"
            />
            <input
              type="text"
              placeholder="Business Type (Optional)"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                         focus:border-black focus:ring-1 focus:ring-black outline-none
                         placeholder-gray-400 font-light transition-colors"
            />
          </div>
        </div>

        {/* Excel/CSV Upload */}
        <div>
          <label className="block text-sm mb-3 text-gray-600 font-light">
            Upload Excel/CSV File
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading || analysisLoading}
            className="w-full text-black bg-gray-50 p-4 rounded-lg border border-gray-300 
                       file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                       file:text-sm file:font-medium
                       file:bg-black file:text-white
                       hover:file:bg-gray-800 cursor-pointer
                       focus:border-black focus:outline-none transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: .xlsx, .xls, .csv. File should contain columns for Date, Description, Category, Amount.
          </p>
        </div>



        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid() || loading || analysisLoading}
          className="w-full bg-black text-white py-4 rounded-full font-medium text-base
                     hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : analysisLoading ? 'Analyzing...' : 'Analyze Data'}
        </button>
      </form>
    </Card>
  );
};

export default UploadForm;
