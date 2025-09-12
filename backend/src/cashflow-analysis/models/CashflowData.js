// src/cashflow-analysis/models/CashflowData.js
const mongoose = require('mongoose');

const cashflowEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['revenue', 'expense', 'investment', 'financing', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'check', 'other']
  },
  reference: {
    type: String,
    trim: true
  }
});

const cashflowDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    trim: true
  },
  reportPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  fileName: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  entries: [cashflowEntrySchema],
  summary: {
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalExpenses: {
      type: Number,
      default: 0
    },
    netCashflow: {
      type: Number,
      default: 0
    },
    entriesCount: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'analyzed', 'error'],
    default: 'uploaded'
  },
  processingErrors: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
cashflowDataSchema.index({ userId: 1, uploadDate: -1 });
cashflowDataSchema.index({ userId: 1, 'reportPeriod.startDate': 1 });

// Pre-save middleware to calculate summary
cashflowDataSchema.pre('save', function(next) {
  if (this.entries && this.entries.length > 0) {
    let totalRevenue = 0;
    let totalExpenses = 0;
    
    this.entries.forEach(entry => {
      if (entry.category === 'revenue') {
        totalRevenue += entry.amount;
      } else if (entry.category === 'expense') {
        totalExpenses += Math.abs(entry.amount);
      }
    });
    
    this.summary.totalRevenue = totalRevenue;
    this.summary.totalExpenses = totalExpenses;
    this.summary.netCashflow = totalRevenue - totalExpenses;
    this.summary.entriesCount = this.entries.length;
  }
  next();
});

module.exports = mongoose.model('CashflowData', cashflowDataSchema);