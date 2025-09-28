import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log("Sending data to Google Sheets via Apps Script:", JSON.stringify(data, null, 2));
    
    // Get the Google Apps Script URL from environment variables
    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    
    if (!googleScriptUrl) {
      throw new Error("Google Sheets URL not configured in environment variables");
    }
    
    // Send data to Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log("Google Apps Script response:", result);
    
    if (!result.success) {
      throw new Error(result.message || "Failed to save data to Google Sheets");
    }
    
    return NextResponse.json({
      success: true,
      message: "Data successfully saved to Google Sheets",
      row: result.row,
      spreadsheetId: "your-spreadsheet-id",
    });
    
  } catch (error) {
    console.error("Error sending data to Google Sheets:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send data to Google Sheets",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    
    if (!googleScriptUrl) {
      throw new Error("Google Sheets URL not configured in environment variables");
    }
    
    // Fetch data from Google Sheets
    const response = await fetch(googleScriptUrl, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      data: result.data || [],
      message: "Data retrieved from Google Sheets successfully"
    });
    
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data from Google Sheets",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}