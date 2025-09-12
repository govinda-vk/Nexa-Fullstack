// src/cashflow-analysis/services/excelProcessor.js
const XLSX = require('xlsx');
const moment = require('moment');

class ExcelProcessor {
  constructor() {
    this.expectedColumns = {
      date: ['date', 'transaction date', 'entry date', 'timestamp'],
      description: ['description', 'transaction description', 'details', 'memo', 'note'],
      category: ['category', 'type', 'transaction type', 'category type'],
      amount: ['amount', 'value', 'transaction amount', 'money', 'cash'],
      subcategory: ['subcategory', 'sub category', 'sub-category'],
      paymentMethod: ['payment method', 'method', 'payment type'],
      reference: ['reference', 'ref', 'reference number', 'transaction id']
    };
  }

  /**
   * Process Excel file and extract cashflow data
   * @param {Buffer} fileBuffer - Excel file buffer
   * @param {string} fileName - Original file name
   * @returns {Object} Processed data or error
   */
  async processExcelFile(fileBuffer, fileName) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        blankrows: false
      });

      if (rawData.length < 2) {
        return {
          success: false,
          error: 'Excel file must contain at least a header row and one data row'
        };
      }

      // Identify column mappings
      const headers = rawData[0].map(h => h ? h.toString().toLowerCase().trim() : '');
      console.log('📊 Excel headers found:', headers);
      
      const columnMapping = this.identifyColumns(headers);
      console.log('🔍 Column mapping:', columnMapping);
      
      if (columnMapping.date === undefined || columnMapping.amount === undefined) {
        console.log('❌ Missing required columns. Date mapping:', columnMapping.date, 'Amount mapping:', columnMapping.amount);
        return {
          success: false,
          error: 'Excel file must contain at least Date and Amount columns. Found headers: ' + headers.join(', ')
        };
      }

      console.log('✅ Required columns found successfully');

      // Process data rows
      const entries = [];
      const errors = [];
      
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        try {
          const entry = this.processRow(row, columnMapping, i + 1);
          if (entry) {
            entries.push(entry);
          }
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      if (entries.length === 0) {
        return {
          success: false,
          error: 'No valid entries found in the Excel file',
          details: errors
        };
      }

      // Calculate period
      const dates = entries.map(e => e.date).sort();
      const reportPeriod = {
        startDate: dates[0],
        endDate: dates[dates.length - 1]
      };

      return {
        success: true,
        data: {
          fileName,
          entries,
          reportPeriod,
          processingErrors: errors.length > 0 ? errors : undefined
        },
        stats: {
          totalRows: rawData.length - 1,
          validEntries: entries.length,
          errorCount: errors.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to process Excel file',
        details: error.message
      };
    }
  }

  /**
   * Identify column mappings from headers
   * @private
   */
  identifyColumns(headers) {
    const mapping = {};
    
    for (const [field, possibleNames] of Object.entries(this.expectedColumns)) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header && possibleNames.some(name => header.toLowerCase().includes(name.toLowerCase()))) {
          mapping[field] = i;
          break;
        }
      }
    }
    
    return mapping;
  }

  /**
   * Process a single data row
   * @private
   */
  processRow(row, columnMapping, rowNumber) {
    // Skip empty rows
    if (!row || row.every(cell => !cell && cell !== 0)) {
      return null;
    }

    const entry = {};

    // Process date
    const dateValue = row[columnMapping.date];
    if (!dateValue) {
      throw new Error('Date is required');
    }
    
    entry.date = this.parseDate(dateValue);
    if (!entry.date) {
      throw new Error('Invalid date format');
    }

    // Process amount
    const amountValue = row[columnMapping.amount];
    if (amountValue === null || amountValue === undefined) {
      throw new Error('Amount is required');
    }
    
    entry.amount = this.parseAmount(amountValue);
    if (isNaN(entry.amount)) {
      throw new Error('Invalid amount format');
    }

    // Process description
    entry.description = columnMapping.description 
      ? (row[columnMapping.description] || '').toString().trim()
      : 'No description';
    
    if (!entry.description) {
      entry.description = `Transaction ${rowNumber}`;
    }

    // Process category
    entry.category = this.categorizeTransaction(
      columnMapping.category ? row[columnMapping.category] : null,
      entry.amount,
      entry.description
    );

    // Process optional fields
    if (columnMapping.subcategory) {
      entry.subcategory = (row[columnMapping.subcategory] || '').toString().trim();
    }

    if (columnMapping.paymentMethod) {
      entry.paymentMethod = this.normalizePaymentMethod(row[columnMapping.paymentMethod]);
    }

    if (columnMapping.reference) {
      entry.reference = (row[columnMapping.reference] || '').toString().trim();
    }

    entry.currency = 'USD'; // Default currency

    return entry;
  }

  /**
   * Parse date from various formats
   * @private
   */
  parseDate(dateValue) {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (typeof dateValue === 'number') {
      // Excel date number
      return new Date((dateValue - 25569) * 86400 * 1000);
    }
    
    if (typeof dateValue === 'string') {
      const date = moment(dateValue, [
        'MM/DD/YYYY',
        'DD/MM/YYYY',
        'YYYY-MM-DD',
        'MM-DD-YYYY',
        'DD-MM-YYYY',
        'M/D/YYYY',
        'D/M/YYYY'
      ], true);
      
      return date.isValid() ? date.toDate() : null;
    }
    
    return null;
  }

  /**
   * Parse amount from various formats
   * @private
   */
  parseAmount(amountValue) {
    if (typeof amountValue === 'number') {
      return amountValue;
    }
    
    if (typeof amountValue === 'string') {
      // Remove currency symbols and whitespace
      const cleaned = amountValue.replace(/[\$,\s]/g, '');
      
      // Handle parentheses for negative amounts
      if (cleaned.includes('(') && cleaned.includes(')')) {
        return -parseFloat(cleaned.replace(/[()]/g, ''));
      }
      
      return parseFloat(cleaned);
    }
    
    return NaN;
  }

  /**
   * Categorize transaction based on available data
   * @private
   */
  categorizeTransaction(categoryValue, amount, description) {
    // If category is provided, normalize it
    if (categoryValue) {
      const category = categoryValue.toString().toLowerCase().trim();
      
      if (category.includes('revenue') || category.includes('income') || category.includes('sales')) {
        return 'revenue';
      }
      if (category.includes('expense') || category.includes('cost') || category.includes('payment')) {
        return 'expense';
      }
      if (category.includes('investment')) {
        return 'investment';
      }
      if (category.includes('financing') || category.includes('loan')) {
        return 'financing';
      }
    }

    // Auto-categorize based on amount and description
    const desc = description.toLowerCase();
    
    if (amount > 0) {
      if (desc.includes('sale') || desc.includes('payment received') || desc.includes('income')) {
        return 'revenue';
      }
    } else {
      if (desc.includes('expense') || desc.includes('payment') || desc.includes('bill') || desc.includes('cost')) {
        return 'expense';
      }
    }

    // Default categorization based on amount sign
    return amount >= 0 ? 'revenue' : 'expense';
  }

  /**
   * Normalize payment method
   * @private
   */
  normalizePaymentMethod(paymentValue) {
    if (!paymentValue) return 'other';
    
    const method = paymentValue.toString().toLowerCase().trim();
    
    if (method.includes('cash')) return 'cash';
    if (method.includes('bank') || method.includes('transfer') || method.includes('wire')) return 'bank_transfer';
    if (method.includes('credit') || method.includes('card')) return 'credit_card';
    if (method.includes('check') || method.includes('cheque')) return 'check';
    
    return 'other';
  }

  /**
   * Validate file format
   */
  validateFileFormat(fileName, fileSize) {
    const allowedExtensions = ['.xlsx', '.xls'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    const ext = fileName.toLowerCase().substr(fileName.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: 'Only Excel files (.xlsx, .xls) are allowed'
      };
    }
    
    if (fileSize > maxFileSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      };
    }
    
    return { valid: true };
  }
}

module.exports = ExcelProcessor;