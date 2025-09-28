import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    console.error("Application Error:", errorData);
    
    // Here you could send errors to a dedicated error tracking service
    // For now, we'll just log to console and optionally send to Google Sheets
    
    // Optionally send to Google Sheets for error tracking
    const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    
    if (googleScriptUrl) {
      try {
        await fetch(`${googleScriptUrl}?type=error`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: errorData,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to send error to Google Sheets:', err);
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log error' },
      { status: 500 }
    );
  }
}