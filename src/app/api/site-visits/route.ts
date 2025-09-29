import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8YtmYBEkfiKhRheidKtzP1ca3V4FIzChjmCdzQ0JQ0pgSFo3pCv1UXAlO1NkTx9Na/exec';

// Simulated database for demo purposes
let siteVisits: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'getAll') {
      // In production, this would fetch from Google Sheets
      // For now, return mock data
      return NextResponse.json({ 
        success: true, 
        data: siteVisits,
        total: siteVisits.length
      });
    }
    
    if (action === 'getById') {
      const id = searchParams.get('id');
      const visit = siteVisits.find(v => v.customerId === id);
      
      if (!visit) {
        return NextResponse.json({ 
          success: false, 
          message: 'Site visit not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: visit
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Site visits API endpoint is working',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching site visits:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch site visits',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'create') {
      // Add new site visit
      const newVisit = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      siteVisits.push(newVisit);
      
      // Also send to Google Sheets
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (sheetsError) {
        console.error('Failed to save to Google Sheets:', sheetsError);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Site visit created successfully',
        data: newVisit
      });
    }
    
    if (action === 'update') {
      const { id, ...updateData } = data;
      const index = siteVisits.findIndex(v => v.id === id);
      
      if (index === -1) {
        return NextResponse.json({ 
          success: false, 
          message: 'Site visit not found'
        }, { status: 404 });
      }
      
      siteVisits[index] = {
        ...siteVisits[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json({ 
        success: true, 
        message: 'Site visit updated successfully',
        data: siteVisits[index]
      });
    }
    
    if (action === 'delete') {
      const { id } = data;
      const index = siteVisits.findIndex(v => v.id === id);
      
      if (index === -1) {
        return NextResponse.json({ 
          success: false, 
          message: 'Site visit not found'
        }, { status: 404 });
      }
      
      const deletedVisit = siteVisits.splice(index, 1)[0];
      
      return NextResponse.json({ 
        success: true, 
        message: 'Site visit deleted successfully',
        data: deletedVisit
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Error managing site visits:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to manage site visits',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}