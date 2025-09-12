import React, { useState, useEffect } from "react";
import UploadForm from "./uploadForm.jsx";
import Results from "./result.jsx";
import { useAuth } from '../contexts/AuthContext.jsx';
import { API_BASE_URL } from '../config/api.js';

const CashflowPage = () => {
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(null);

  // Load user's cashflow data and analyses on component mount
  useEffect(() => {
    if (user) {
      loadCashflowData();
      loadAnalyses();
    }
  }, [user]);

  // Load user's uploaded cashflow data
  const loadCashflowData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cashflow/data?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setUploadedData(result.data || []);
      }
    } catch (error) {
      console.error('Error loading cashflow data:', error);
    }
  };

  // Load user's analyses
  const loadAnalyses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cashflow/analysis?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setAnalyses(result.data || []);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  // Handle file upload and manual data submission
  const handleAnalysis = async (data) => {
    setUploadLoading(true);
    setError(null);

    try {
      let uploadResult = null;

      if (data.type === "file") {
        // File upload
        const formData = new FormData();
        formData.append('cashflowFile', data.file);
        formData.append('businessName', data.businessName || 'My Business');
        if (data.businessType) {
          formData.append('businessType', data.businessType);
        }

        const uploadResponse = await fetch(`${API_BASE_URL}/api/cashflow/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        uploadResult = await uploadResponse.json();
      } else {
        // Manual entry - create a simple data structure
        const manualData = {
          businessName: data.businessName || 'My Business',
          entries: [{
            date: data.date,
            description: data.name,
            category: data.category,
            amount: parseFloat(data.amount),
            subcategory: data.category,
            paymentMethod: 'manual_entry',
            reference: 'MANUAL-001'
          }]
        };

        // For manual entry, we'll create a simplified upload
        const uploadResponse = await fetch(`${API_BASE_URL}/api/cashflow/upload-manual`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(manualData)
        });

        uploadResult = await uploadResponse.json();
      }

      if (uploadResult.success) {
        // Data uploaded successfully, now start analysis
        const dataId = uploadResult.data?._id || uploadResult.data?.id;
        if (dataId) {
          await startAnalysis(dataId);
          loadCashflowData(); // Refresh the data list
        } else {
          console.error('No data ID returned from upload:', uploadResult);
          setError('Upload succeeded but no data ID returned. Please try again.');
        }
      } else {
        setError(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Start AI analysis
  const startAnalysis = async (dataId) => {
    if (!dataId || dataId === 'undefined') {
      setError('Invalid data ID. Cannot start analysis.');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisProgress('Starting AI analysis...');
    setError(null);

    try {
      console.log('Starting analysis for dataId:', dataId);
      
      const response = await fetch(`${API_BASE_URL}/api/cashflow/analyze/${dataId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisProgress('Analysis started! Processing data...');
        // Check status periodically
        checkAnalysisStatus(result.data.analysisId);
      } else {
        setError(result.error || 'Failed to start analysis');
        setAnalysisLoading(false);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Analysis failed: ' + error.message);
      setAnalysisLoading(false);
    }
  };

  // Check analysis status periodically
  const checkAnalysisStatus = async (analysisId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cashflow/analysis/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.data.status === 'completed') {
          setAnalysisProgress('Analysis completed!');
          setAnalysisData(result.data);
          setAnalysisLoading(false);
          loadAnalyses(); // Refresh analyses list
        } else if (result.data.status === 'error') {
          setError('Analysis failed: ' + (result.data.errorMessage || 'Unknown error'));
          setAnalysisLoading(false);
        } else if (result.data.status === 'processing') {
          setAnalysisProgress('AI is analyzing your data...');
          // Check again in 3 seconds
          setTimeout(() => checkAnalysisStatus(analysisId), 3000);
        }
      }
    } catch (error) {
      console.error('Error checking analysis status:', error);
      setAnalysisLoading(false);
    }
  };

  // Load existing analysis
  const loadAnalysis = async (analysisId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/cashflow/analysis/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisData(result.data);
      } else {
        setError(result.error || 'Failed to load analysis');
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      setError('Failed to load analysis: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete analysis
  const deleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cashflow/analysis/${analysisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setAnalyses(analyses.filter(a => a._id !== analysisId));
        // Clear current analysis if it's the one being deleted
        if (analysisData && analysisData._id === analysisId) {
          setAnalysisData(null);
        }
      } else {
        setError(result.error || 'Failed to delete analysis');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      setError('Failed to delete analysis: ' + error.message);
    }
  };

  // Delete cashflow data
  const deleteCashflowData = async (dataId) => {
    if (!window.confirm('Are you sure you want to delete this cashflow data and all associated analyses?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cashflow/data/${dataId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        loadCashflowData(); // Refresh the data list
        loadAnalyses(); // Refresh analyses list
      } else {
        setError(result.error || 'Failed to delete data');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      setError('Failed to delete data: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-black mb-4 tracking-tight">
            Cashflow Analysis
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Upload your financial data or enter it manually to get AI-powered insights 
            and recommendations for your business.
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Upload Form */}
          <UploadForm 
            onSubmit={handleAnalysis} 
            loading={uploadLoading}
            analysisLoading={analysisLoading}
            analysisProgress={analysisProgress}
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium">Error</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {/* Previous Analyses Section */}
          {analyses.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-2xl font-light text-black mb-6">Previous Analyses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((analysis) => (
                  <div 
                    key={analysis._id} 
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-black">
                          {analysis.cashflowDataId?.businessName || 'Business Analysis'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Score: {analysis.overallHealthScore}/100
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(analysis.analysisDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAnalysis(analysis._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => loadAnalysis(analysis._id)}
                      disabled={loading}
                      className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium
                               hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'View Analysis'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Data Section */}
          {uploadedData.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-2xl font-light text-black mb-6">Your Cashflow Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedData.map((data) => (
                  <div 
                    key={data._id} 
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-black">{data.businessName}</h3>
                        <p className="text-sm text-gray-600">
                          Net: ${data.summary?.netCashflow?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(data.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCashflowData(data._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => startAnalysis(data._id)}
                      disabled={analysisLoading}
                      className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium
                               hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {analysisLoading ? 'Analyzing...' : 'Analyze Again'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Analysis Results */}
          {analysisData && (
            <div className="relative">
              {analysisData._id && (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => deleteAnalysis(analysisData._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete Analysis
                  </button>
                </div>
              )}
              <Results analysis={analysisData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashflowPage;
