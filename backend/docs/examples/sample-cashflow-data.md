# Sample Excel Template for Cashflow Analysis

Create an Excel file (.xlsx) with the following structure for testing the cashflow analysis system:

## Column Headers (Row 1)
| Date | Description | Category | Amount | Subcategory | Payment Method | Reference |
|------|-------------|----------|---------|-------------|----------------|-----------|

## Sample Data Rows

### Revenue Entries
| Date | Description | Category | Amount | Subcategory | Payment Method | Reference |
|------|-------------|----------|---------|-------------|----------------|-----------|
| 2024-01-15 | Product Sales - Online | revenue | 5000 | Product Sales | bank_transfer | INV-001 |
| 2024-01-20 | Service Revenue | revenue | 3500 | Services | credit_card | INV-002 |
| 2024-02-05 | Product Sales - Retail | revenue | 7200 | Product Sales | cash | INV-003 |
| 2024-02-15 | Consulting Revenue | revenue | 4000 | Services | bank_transfer | INV-004 |
| 2024-03-01 | Product Sales - Online | revenue | 6800 | Product Sales | credit_card | INV-005 |

### Expense Entries
| Date | Description | Category | Amount | Subcategory | Payment Method | Reference |
|------|-------------|----------|---------|-------------|----------------|-----------|
| 2024-01-05 | Office Rent | expense | -2000 | Rent | bank_transfer | RENT-001 |
| 2024-01-10 | Marketing Campaign | expense | -1500 | Marketing | credit_card | MKT-001 |
| 2024-01-25 | Employee Salaries | expense | -8000 | Salaries | bank_transfer | PAY-001 |
| 2024-02-01 | Utilities | expense | -300 | Utilities | bank_transfer | UTIL-001 |
| 2024-02-10 | Office Supplies | expense | -250 | Supplies | credit_card | SUP-001 |
| 2024-02-25 | Employee Salaries | expense | -8000 | Salaries | bank_transfer | PAY-002 |
| 2024-03-05 | Office Rent | expense | -2000 | Rent | bank_transfer | RENT-002 |

## Notes:
1. **Date**: Use any standard date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
2. **Amount**: 
   - Positive values for revenue/income
   - Negative values for expenses (optional, system can auto-detect)
3. **Category**: revenue, expense, investment, financing, other
4. **Payment Method**: cash, bank_transfer, credit_card, check, other
5. **Subcategory**: Optional but helpful for detailed analysis
6. **Reference**: Optional reference number or transaction ID

## File Requirements:
- File format: .xlsx or .xls
- Maximum file size: 10MB
- Minimum required columns: Date, Amount
- Business name will be entered during upload

Save this as an Excel file and use it to test the cashflow analysis API endpoints.