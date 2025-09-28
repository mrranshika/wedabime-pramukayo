// Google Apps Script for Wedabime Pramukayo Site Visitor App
// Replace your existing script with this code

const SHEET_NAME = "Sheet1"; // Change if your sheet has a different name
const SCRIPT_PROP = PropertiesService.getScriptProperties();

function doGet(e) {
  return handleResponse(e, 'GET');
}

function doPost(e) {
  return handleResponse(e, 'POST');
}

function handleResponse(e, method) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (method === 'POST') {
      // Parse the incoming data
      const data = JSON.parse(e.postData.contents);
      
      // Create a new row with the data
      const newRow = [
        new Date(), // Timestamp
        data.customerId || "",
        data.leadDate || "",
        data.customerName || "",
        data.phoneNumber || "",
        data.hasWhatsApp ? "Yes" : "No",
        data.whatsappNumber || "",
        data.district || "",
        data.city || "",
        data.address || "",
        data.status || "",
        data.selectedService || "",
        data.hasRemovals ? "Yes" : "No",
        data.removalCharge || 0,
        data.hasAdditionalLabor ? "Yes" : "No",
        data.additionalLaborCharge || 0,
        // Ceiling specific data
        data.ceilingData?.type || "",
        data.ceilingData?.hasMacfoil ? "Yes" : "No",
        data.ceilingData?.pricePerSqFt || 0,
        data.ceilingData?.totalArea || 0,
        data.ceilingData?.totalCost || 0,
        // Gutters specific data
        data.guttersData?.measurements?.guttersValanceB || "",
        data.guttersData?.measurements?.bFlashingValanceB || "",
        data.guttersData?.measurements?.gutters || "",
        data.guttersData?.measurements?.valanceB || "",
        data.guttersData?.measurements?.bFlashing || "",
        data.guttersData?.measurements?.dPipes || "",
        data.guttersData?.items?.nozzels || 0,
        data.guttersData?.items?.endCaps || 0,
        data.guttersData?.items?.chainPackets || 0,
        // Roof specific data
        data.roofData?.roofType || "",
        data.roofData?.structureType || "",
        data.roofData?.finishType || "",
        data.roofData?.material || "",
        data.roofData?.color || "",
        data.roofData?.subOption || "",
        // Quotation number (could be from any service)
        data.ceilingData?.quotationNumber || 
        data.guttersData?.quotationNumber || 
        data.roofData?.quotationNumber || ""
      ];
      
      // Append the new row to the sheet
      sheet.appendRow(newRow);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Data saved successfully",
        row: sheet.getLastRow()
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (method === 'GET') {
      // Return all data (for debugging or admin purposes)
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: rows
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Set up the web app
function setup() {
  const script = ScriptApp.getService();
  script.setTitle("Wedabime Pramukayo API");
  script.setDescription("API for Wedabime Pramukayo Site Visitor App");
  
  // Deploy as web app
  const deployment = script.createDeployment(
    ScriptApp.newDeploymentConfig()
      .setEntryPoint('doPost')
      .setExecuteAs('me')
      .setAccess('ANYONE_ANONYMOUS')
  );
  
  return deployment.getUrl();
}