# Export Report Edge Function

This Supabase Edge Function handles exporting reports in various formats (PDF, Excel, CSV).

## Features

- **Multiple Formats**: Export to PDF, Excel (.xls), or CSV
- **Report Types**: Sales, Stock, Purchase, Profit Analysis
- **Formatted Output**: Properly formatted tables with headers and styling
- **Summary Statistics**: Includes totals for sales and profit reports
- **Authentication**: Requires valid user authentication

## Deployment

### Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Logged in to Supabase: `supabase login`
3. Linked to your project: `supabase link --project-ref YOUR_PROJECT_REF`

### Deploy the Function

```bash
# Navigate to your project root
cd e:\Inventory_management_system\inventory_managment

# Deploy the edge function
supabase functions deploy export-report
```

### Set Environment Variables (if needed)
The function automatically uses the Supabase environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

These are automatically available in edge functions.

## Usage

### Request Format

```javascript
const { data, error } = await supabase.functions.invoke('export-report', {
  body: {
    reportType: 'sales',  // 'sales' | 'stock' | 'purchase' | 'profit'
    format: 'pdf',        // 'pdf' | 'excel' | 'csv'
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    categoryFilter: 'Electronics',  // Optional
    data: [
      // Array of report data objects
      {
        product: 'Laptop',
        category: 'Electronics',
        unitsSold: 50,
        revenue: 50000,
        profit: 15000
      },
      // ... more data
    ]
  }
});
```

### Response

- **CSV/Excel**: Returns file content as text/binary that can be downloaded
- **PDF**: Returns HTML that can be opened in a new window and printed to PDF

## Report Types

### 1. Sales Report
Columns: Product, Category, Units Sold, Revenue, Profit

### 2. Stock Report
Columns: SKU, Product, Category, Current Stock, Reorder Level, Status

### 3. Purchase Report
Columns: Product, Category, Total Quantity, Orders, Total Cost

### 4. Profit Analysis
Columns: Product, Category, Revenue, Cost, Profit, Margin %

## Format Details

### CSV Export
- Simple comma-separated values
- Headers included
- Direct download to file

### Excel Export
- HTML-based Excel file (.xls)
- Formatted tables with styling
- Colored headers
- Alternating row colors
- Includes report metadata

### PDF Export
- HTML content optimized for printing
- Professional styling
- Report metadata (period, category, generated date)
- User information
- Summary footer for sales/profit reports
- Opens in new window with print dialog

## Testing

Test the function locally:

```bash
# Start local Supabase
supabase start

# Serve the function locally
supabase functions serve export-report

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/export-report' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "reportType": "sales",
    "format": "csv",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "data": [...]
  }'
```

## Frontend Integration

The function is already integrated in `Reports.jsx`:

```javascript
const handleExport = async (format) => {
  const { data, error } = await supabase.functions.invoke('export-report', {
    body: {
      reportType,
      format: format.toLowerCase(),
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      categoryFilter,
      data: getCurrentReportData()
    }
  });
  
  // Handle download...
};
```

## Troubleshooting

### Function not found
Make sure the function is deployed:
```bash
supabase functions list
```

### CORS errors
The function includes proper CORS headers. If you still see errors, check your Supabase project settings.

### Authentication errors
Ensure the user is logged in before calling the function:
```javascript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  alert('Please log in to export reports');
  return;
}
```

## Next Steps

1. Deploy the function: `supabase functions deploy export-report`
2. Test in your application by clicking "Export to PDF/Excel/CSV" buttons
3. Check the Supabase Functions logs for any errors: `supabase functions logs export-report`

## Production Considerations

For production, consider:
- Rate limiting on the edge function
- Larger dataset pagination (currently limited by request size)
- Using a proper PDF library like puppeteer for better PDF generation
- Caching frequently requested reports
- Adding report generation to background jobs for very large datasets
