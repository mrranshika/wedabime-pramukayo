# Google Sheets Columns Structure for Wedabime Pramukayo

This document defines the required columns for your Google Sheet to store site visit data from the Wedabime Pramukayo application.

## Sheet Name
**"Site Visits"** (or "Sheet1" if using default)

## Required Columns

### Basic Information Columns
| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| **ID** | String | Unique identifier for the record | 1701234567890 |
| **Customer ID** | String | Auto-generated customer identifier | A-000a01 |
| **Lead Date** | Date | Date when the lead was received | 2024-01-15 |
| **Customer Name** | String | Full name of the customer | John Doe |
| **Phone Number** | String | Customer's phone number | +1234567890 |
| **Has WhatsApp** | Boolean | Whether phone number has WhatsApp | TRUE |
| **WhatsApp Number** | String | Alternative WhatsApp number if different | +0987654321 |
| **District** | String | Customer's district | Colombo |
| **City** | String | Customer's city | Colombo |
| **Address** | String | Customer's address (optional) | 123 Main Street |
| **Status** | String | Current status of the visit | pending |

### Additional Charges Columns
| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| **Has Removals** | Boolean | Whether there are removal charges | FALSE |
| **Removal Charge** | Number | Cost of removals (if applicable) | 5000.00 |
| **Has Additional Labor** | Boolean | Whether there are additional labor charges | TRUE |
| **Additional Labor Charge** | Number | Cost of additional labor (if applicable) | 2500.00 |

### Service Information Columns
| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| **Selected Service** | String | Type of service selected | ceiling |
| **Service Data** | String | JSON string containing service-specific data | See JSON Structure below |

### Media Columns
| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| **Images** | String | JSON string containing image data (base64) | [{"id":"1","type":"image","data":"base64...","name":"photo_1.jpg"}] |
| **Drawings** | String | JSON string containing drawing data (base64) | [{"id":"2","type":"drawing","data":"base64...","name":"drawing_1.png"}] |
| **Videos** | String | JSON string containing video data (base64) | [{"id":"3","type":"video","data":"base64...","name":"video_1.webm"}] |

### System Columns
| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| **Created At** | DateTime | When the record was created | 2024-01-15T10:30:00.000Z |
| **Updated At** | DateTime | When the record was last updated | 2024-01-15T11:45:00.000Z |

## JSON Structure for Service Data Column

The **Service Data** column contains a JSON string with service-specific information. Here are the possible structures:

### Ceiling Service Data Structure
```json
{
  "type": "eltoro",
  "hasMacfoil": false,
  "pricePerSqFt": 180,
  "areas": [
    {
      "length": "10' 0\"",
      "width": "10' 0\"",
      "area": 100
    },
    {
      "length": "12' 0\"",
      "width": "8' 6\"",
      "area": 102.5
    }
  ],
  "totalArea": 202.5,
  "totalCost": 36450,
  "quotationNumber": "Q-001"
}
```

### Gutters Service Data Structure
```json
{
  "measurements": {
    "guttersValanceB": "5' + 6' + 3'",
    "bFlashingValanceB": "4' + 5' + 2'",
    "gutters": "15' + 8'",
    "valanceB": "12' + 6'",
    "bFlashing": "8' + 4'",
    "dPipes": "6' + 3'",
    "ridgeCover": "20'",
    "ratGuard": "18'"
  },
  "items": {
    "nozzels": "5",
    "endCaps": "8",
    "chainPackets": "3"
  },
  "wallF": {
    "size": "9",
    "measurements": "10' + 12'"
  },
  "blindWallFlashing": {
    "size": "12",
    "measurements": "8' + 6'"
  },
  "customDesignNote": "Custom design around the main entrance",
  "quotationNumber": "Q-002"
}
```

### Roof Service Data Structure
```json
{
  "roofType": "new",
  "structureType": "wood",
  "finishType": "normal",
  "material": "asbestosColor",
  "color": "tileRed",
  "subOption": null,
  "quotationNumber": "Q-003"
}
```

### Images Data Structure
```json
[
  {
    "id": "1701234567890",
    "type": "image",
    "data": "base64_encoded_image_data",
    "name": "photo_1.jpg",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "size": 1024000
  }
]
```

### Drawings Data Structure
```json
[
  {
    "id": "1701234567891",
    "type": "drawing",
    "data": "base64_encoded_drawing_data",
    "name": "drawing_1.png",
    "timestamp": "2024-01-15T10:35:00.000Z"
  }
]
```

### Videos Data Structure
```json
[
  {
    "id": "1701234567892",
    "type": "video",
    "data": "base64_encoded_video_data",
    "name": "video_1.webm",
    "timestamp": "2024-01-15T10:40:00.000Z",
    "size": 5120000
  }
]
```

## Google Apps Script Setup

### 1. Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Wedabime Pramukayo - Site Visits"
4. Rename the first sheet to "Site Visits"
5. Create the columns in the exact order shown above (22 columns total)

### 2. Set Up Google Apps Script
1. In your Google Sheet, go to `Extensions` > `Apps Script`
2. Replace the default code with:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Site Visits");
    
    // Prepare row data in the correct column order
    const rowData = [
      data.id || Date.now().toString(), // ID
      data.customerId || '', // Customer ID
      data.leadDate || '', // Lead Date
      data.customerName || '', // Customer Name
      data.phoneNumber || '', // Phone Number
      data.hasWhatsApp || false, // Has WhatsApp
      data.whatsappNumber || '', // WhatsApp Number
      data.district || '', // District
      data.city || '', // City
      data.address || '', // Address
      data.hasRemovals || false, // Has Removals
      data.removalCharge || '', // Removal Charge
      data.hasAdditionalLabor || false, // Has Additional Labor
      data.additionalLaborCharge || '', // Additional Labor Charge
      data.status || '', // Status
      data.selectedService || '', // Selected Service
      JSON.stringify({ // Service Data
        ceilingData: data.ceilingData || null,
        guttersData: data.guttersData || null,
        roofData: data.roofData || null
      }),
      JSON.stringify(data.images || []), // Images
      JSON.stringify(data.drawings || []), // Drawings
      JSON.stringify(data.videos || []), // Videos
      new Date().toISOString(), // Created At
      new Date().toISOString() // Updated At
    ];
    
    // Append row to sheet
    sheet.appendRow(rowData);
    
    // Format the date columns
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 3).setNumberFormat("yyyy-mm-dd"); // Lead Date
    sheet.getRange(lastRow, 21).setNumberFormat("yyyy-mm-dd hh:mm:ss"); // Created At
    sheet.getRange(lastRow, 22).setNumberFormat("yyyy-mm-dd hh:mm:ss"); // Updated At
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully',
      id: data.id || Date.now().toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    message: 'Google Sheets API is working',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Helper function to get all data
function getAllData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Site Visits");
    const data = sheet.getDataRange().getValues();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Convert to array of objects
    const result = data.slice(1).map((row, index) => {
      const obj = {};
      headers.forEach((header, colIndex) => {
        obj[header] = row[colIndex];
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      total: result.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to get data by ID
function getDataById(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Site Visits");
    const data = sheet.getDataRange().getValues();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Find row with matching ID
    const targetRow = data.findIndex((row, index) => {
      return index > 0 && row[0] === id; // ID is in column 1 (index 0)
    });
    
    if (targetRow === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Data not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convert to object
    const obj = {};
    headers.forEach((header, colIndex) => {
      obj[header] = data[targetRow][colIndex];
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: obj
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Deploy the Script
1. Save the script (Ctrl + S or click Save project)
2. Click `Deploy` > `New deployment`
3. Select `Web app` as the deployment type
4. Configure:
   - **Description**: "Wedabime Pramukayo Site Visits API"
   - **Execute as**: "Me (your email)"
   - **Who has access**: "Anyone"
5. Click `Deploy`
6. Copy the Web app URL
7. Update the `GOOGLE_SCRIPT_URL` in `/src/app/api/google-sheets/route.ts` with your URL

## Column Formatting Recommendations

### Date Columns
- **Lead Date**: Format as `yyyy-mm-dd`
- **Created At**: Format as `yyyy-mm-dd hh:mm:ss`
- **Updated At**: Format as `yyyy-mm-dd hh:mm:ss`

### Number Columns
- **Removal Charge**: Format as currency (Rs. #,##0.00)
- **Additional Labor Charge**: Format as currency (Rs. #,##0.00)

### Boolean Columns
- **Has WhatsApp**: Format as checkbox (TRUE/FALSE)
- **Has Removals**: Format as checkbox (TRUE/FALSE)
- **Has Additional Labor**: Format as checkbox (TRUE/FALSE)

## Data Validation Rules

### Customer ID Column
- Pattern: `^[A-Z]{1,4}-\d{3}[A-Z]\d{2}$`
- Example valid values: A-000a01, AB-123z99, ZZZZ-999z99

### Status Column
- Allowed values: pending, running, complete, cancel
- Use dropdown validation with these options

### Selected Service Column
- Allowed values: roof, ceiling, gutters
- Use dropdown validation with these options

## Security Considerations

1. **Web App Access**: Set to "Anyone" for easy access from the application
2. **Data Privacy**: The sheet contains customer information - ensure proper sharing settings
3. **Backup**: Regularly backup your Google Sheet to prevent data loss
4. **Rate Limiting**: Google Apps Script has usage limits - monitor for quota exceeded errors

## Testing the Integration

1. **Test POST Request**: Use a tool like Postman to test the API endpoint
2. **Verify Data**: Check that data appears correctly in the Google Sheet
3. **Test JSON Parsing**: Verify that the Service Data column contains valid JSON
4. **Test Date Formatting**: Ensure dates are formatted correctly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the Google Apps Script is deployed with "Anyone" access
2. **Column Mismatch**: Verify that column order matches the Apps Script expectations
3. **Date Format Issues**: Check that dates are properly formatted in the script
4. **JSON Parsing Errors**: Ensure the Service Data column contains valid JSON strings

### Debug Mode

Add logging to the Apps Script to debug issues:

```javascript
Logger.log('Received data: ' + JSON.stringify(data));
Logger.log('Row data: ' + JSON.stringify(rowData));
```

View logs in the Apps Script editor under `Executions` tab.