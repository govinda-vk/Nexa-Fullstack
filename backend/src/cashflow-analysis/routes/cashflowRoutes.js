// src/cashflow-analysis/routes/cashflowRoutes.js
const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../../middleware/auth');
const CashflowData = require('../models/CashflowData');
const CashflowAnalysis = require('../models/CashflowAnalysis');
const ExcelProcessor = require('../services/excelProcessor');
const AIAnalysisService = require('../services/aiAnalysisService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  }
});

const excelProcessor = new ExcelProcessor();
const aiAnalysisService = new AIAnalysisService();

/**
 * POST /api/cashflow/upload
 * Upload and process Excel cashflow data
 */
router.post('/upload', authenticateToken, upload.single('cashflowFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { businessName, businessType } = req.body;
    
    if (!businessName || businessName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Business name is required'
      });
    }

    // Validate file format
    const validation = excelProcessor.validateFileFormat(req.file.originalname, req.file.size);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Process Excel file
    console.log('🔄 Processing Excel file:', req.file.originalname);
    const processingResult = await excelProcessor.processExcelFile(
      req.file.buffer, 
      req.file.originalname
    );

    if (!processingResult.success) {
      console.log('❌ Excel processing failed:', processingResult.error);
      return res.status(400).json({
        success: false,
        error: processingResult.error,
        details: processingResult.details
      });
    }

    // Save to database
    const cashflowData = new CashflowData({
      userId: req.user._id,
      businessName: businessName.trim(),
      businessType: businessType?.trim(),
      ...processingResult.data,
      status: 'uploaded'
    });

    await cashflowData.save();

    res.json({
      success: true,
      message: 'Cashflow data uploaded successfully',
      data: {
        id: cashflowData._id,
        businessName: cashflowData.businessName,
        reportPeriod: cashflowData.reportPeriod,
        summary: cashflowData.summary,
        entriesCount: cashflowData.entries.length,
        status: cashflowData.status
      },
      stats: processingResult.stats
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size is 10MB.'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process upload',
      details: error.message
    });
  }
});

/**
 * GET /api/cashflow/data
 * Get user's cashflow data with pagination
 */
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { userId: req.user._id };
    
    // Optional filters
    if (req.query.businessName) {
      query.businessName = { $regex: req.query.businessName, $options: 'i' };
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [cashflowData, total] = await Promise.all([
      CashflowData.find(query)
        .select('-entries') // Exclude entries for list view
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit),
      CashflowData.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: cashflowData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + cashflowData.length < total
      }
    });

  } catch (error) {
    console.error('Get cashflow data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cashflow data',
      details: error.message
    });
  }
});

/**
 * GET /api/cashflow/data/:id
 * Get specific cashflow data with entries
 */
router.get('/data/:id', authenticateToken, async (req, res) => {
  try {
    const cashflowData = await CashflowData.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!cashflowData) {
      return res.status(404).json({
        success: false,
        error: 'Cashflow data not found'
      });
    }

    res.json({
      success: true,
      data: cashflowData
    });

  } catch (error) {
    console.error('Get cashflow data by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cashflow data',
      details: error.message
    });
  }
});

/**
 * POST /api/cashflow/analyze/:id
 * Trigger AI analysis for specific cashflow data
 */
router.post('/analyze/:id', authenticateToken, async (req, res) => {
  try {
    const cashflowData = await CashflowData.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!cashflowData) {
      return res.status(404).json({
        success: false,
        error: 'Cashflow data not found'
      });
    }

    // Check if analysis already exists
    const existingAnalysis = await CashflowAnalysis.findOne({
      cashflowDataId: cashflowData._id,
      status: { $in: ['completed', 'processing'] }
    });

    if (existingAnalysis && existingAnalysis.status === 'processing') {
      return res.status(409).json({
        success: false,
        error: 'Analysis is already in progress',
        data: {
          analysisId: existingAnalysis._id,
          status: existingAnalysis.status
        }
      });
    }

    if (existingAnalysis && existingAnalysis.status === 'completed') {
      return res.json({
        success: true,
        message: 'Analysis already exists',
        data: {
          analysisId: existingAnalysis._id,
          status: existingAnalysis.status,
          analysis: existingAnalysis
        }
      });
    }

    // Create analysis record
    console.log('💡 Creating initial analysis record for:', cashflowData._id);
    const analysis = new CashflowAnalysis({
      cashflowDataId: cashflowData._id,
      userId: req.user._id,
      status: 'processing'
    });

    await analysis.save();
    console.log('✅ Analysis record created:', analysis._id);

    // Perform AI analysis (in background)
    setImmediate(async () => {
      try {
        console.log('🔄 Starting background AI analysis for:', analysis._id);
        const startTime = Date.now();
        
        // Update cashflow data status
        cashflowData.status = 'processing';
        await cashflowData.save();

        const analysisResult = await aiAnalysisService.analyzeCashflow(cashflowData);
        console.log('🤖 AI analysis result:', analysisResult.success ? 'Success' : 'Failed');
        
        if (analysisResult.success) {
          // Update analysis with results
          analysis.executiveSummary = analysisResult.analysis.executiveSummary;
          analysis.overallHealthScore = analysisResult.analysis.overallHealthScore;
          analysis.insights = analysisResult.analysis.insights;
          analysis.visualizations = analysisResult.analysis.visualizations;
          analysis.keyMetrics = analysisResult.analysis.keyMetrics;
          analysis.recommendations = analysisResult.analysis.recommendations;
          analysis.riskFactors = analysisResult.analysis.riskFactors;
          analysis.geminiResponse = analysisResult.rawResponse;
          analysis.status = 'completed';
          analysis.processingTime = Date.now() - startTime;
          
          cashflowData.status = 'analyzed';
          console.log('✅ Analysis completed successfully');
        } else {
          analysis.status = 'error';
          analysis.errorMessage = analysisResult.error;
          cashflowData.status = 'error';
          console.log('❌ Analysis failed:', analysisResult.error);
        }

        await Promise.all([analysis.save(), cashflowData.save()]);

      } catch (error) {
        console.error('❌ Background analysis error:', error);
        analysis.status = 'error';
        analysis.errorMessage = error.message;
        cashflowData.status = 'error';
        await Promise.all([analysis.save(), cashflowData.save()]);
      }
    });

    res.json({
      success: true,
      message: 'Analysis started successfully',
      data: {
        analysisId: analysis._id,
        status: analysis.status
      }
    });

  } catch (error) {
    console.error('Start analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start analysis',
      details: error.message
    });
  }
});

/**
 * GET /api/cashflow/analysis/:id
 * Get analysis results
 */
router.get('/analysis/:id', authenticateToken, async (req, res) => {
  try {
    const analysisId = req.params.id;
    
    // Validate ObjectId format
    if (!analysisId || analysisId === 'undefined' || !analysisId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis ID format'
      });
    }

    const analysis = await CashflowAnalysis.findOne({
      _id: analysisId,
      userId: req.user._id
    }).populate('cashflowDataId', 'businessName reportPeriod summary');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analysis',
      details: error.message
    });
  }
});

/**
 * GET /api/cashflow/analysis
 * Get user's analyses with pagination
 */
router.get('/analysis', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { userId: req.user._id };
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [analyses, total] = await Promise.all([
      CashflowAnalysis.find(query)
        .populate('cashflowDataId', 'businessName reportPeriod summary')
        .sort({ analysisDate: -1 })
        .skip(skip)
        .limit(limit),
      CashflowAnalysis.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + analyses.length < total
      }
    });

  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analyses',
      details: error.message
    });
  }
});

/**
 * DELETE /api/cashflow/data/:id
 * Delete cashflow data and associated analyses
 */
router.delete('/data/:id', authenticateToken, async (req, res) => {
  try {
    const cashflowData = await CashflowData.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!cashflowData) {
      return res.status(404).json({
        success: false,
        error: 'Cashflow data not found'
      });
    }

    // Delete associated analyses
    await CashflowAnalysis.deleteMany({ cashflowDataId: cashflowData._id });
    
    // Delete cashflow data
    await CashflowData.deleteOne({ _id: cashflowData._id });

    res.json({
      success: true,
      message: 'Cashflow data and associated analyses deleted successfully'
    });

  } catch (error) {
    console.error('Delete cashflow data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete cashflow data',
      details: error.message
    });
  }
});

/**
 * GET /api/cashflow/visualization/:analysisId/:chartType
 * Get specific visualization data for charts
 */
router.get('/visualization/:analysisId/:chartType', authenticateToken, async (req, res) => {
  try {
    const analysis = await CashflowAnalysis.findOne({
      _id: req.params.analysisId,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    const visualization = analysis.visualizations.find(
      v => v.chartType === req.params.chartType
    );

    if (!visualization) {
      return res.status(404).json({
        success: false,
        error: 'Visualization not found'
      });
    }

    res.json({
      success: true,
      data: visualization
    });

  } catch (error) {
    console.error('Get visualization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve visualization',
      details: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      details: error.message
    });
  }
  
  if (error.message.includes('Only Excel files')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
});

module.exports = router;