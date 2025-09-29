import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8YtmYBEkfiKhRheidKtzP1ca3V4FIzChjmCdzQ0JQ0pgSFo3pCv1UXAlO1NkTx9Na/exec';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Received form data:', body);

    // Send data to Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('Google Sheets response:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully',
      data: result 
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to submit form',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Google Sheets API endpoint is working',
    timestamp: new Date().toISOString()
  });
}