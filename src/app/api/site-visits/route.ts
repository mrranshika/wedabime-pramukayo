import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Log the received data for debugging
    console.log("Received form data:", JSON.stringify(formData, null, 2));
    
    // Here you would typically:
    // 1. Validate the form data
    // 2. Save to the database using Prisma
    // 3. Handle file uploads
    // 4. Send data to Google Sheets
    // 5. Return success response
    
    // For now, we'll send the data to Google Sheets
    try {
      const googleSheetsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/google-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const googleSheetsResult = await googleSheetsResponse.json();
      
      if (!googleSheetsResult.success) {
        console.error("Failed to send data to Google Sheets:", googleSheetsResult);
        // We don't want to fail the whole submission if Google Sheets fails
        // but we should log it and potentially notify the user
      }
    } catch (googleSheetsError) {
      console.error("Error sending data to Google Sheets:", googleSheetsError);
      // Again, we don't want to fail the whole submission
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Site visit form submitted successfully",
      data: {
        id: `temp-${Date.now()}`, // Temporary ID
        ...formData
      }
    });
    
  } catch (error) {
    console.error("Error processing form submission:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process form submission",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Here you would typically fetch all site visits from the database
    // For now, return empty array
    return NextResponse.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error("Error fetching site visits:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch site visits",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}