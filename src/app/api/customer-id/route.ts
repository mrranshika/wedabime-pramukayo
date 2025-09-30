import { NextRequest, NextResponse } from 'next/server';
import { CustomerIDGenerator } from '@/lib/customer-id-generator';

// Simulated database - in production, this would be replaced with actual database calls
let usedCustomerIDs: Set<string> = new Set();

export async function GET() {
  try {
    // In production, you would fetch used IDs from your database
    // For now, we'll return the next available ID
    const usedIDsArray = Array.from(usedCustomerIDs);
    const nextID = CustomerIDGenerator.generateNextID(usedIDsArray);
    
    return NextResponse.json({ 
      success: true, 
      nextCustomerID: nextID,
      totalUsed: usedCustomerIDs.length
    });

  } catch (error) {
    console.error('Error generating customer ID:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate customer ID',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, action } = await request.json();
    
    if (action === 'reserve') {
      // Reserve a customer ID
      if (!CustomerIDGenerator.validateID(customerId)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid customer ID format'
        }, { status: 400 });
      }
      
      if (usedCustomerIDs.has(customerId)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Customer ID already in use'
        }, { status: 400 });
      }
      
      usedCustomerIDs.add(customerId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Customer ID reserved successfully',
        customerId
      });
    }
    
    if (action === 'release') {
      // Release a customer ID (for editing/deleting entries)
      usedCustomerIDs.delete(customerId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Customer ID released successfully',
        customerId
      });
    }
    
    if (action === 'preview') {
      // Generate preview IDs
      const previewIDs = CustomerIDGenerator.generatePreviewIDs(10);
      
      return NextResponse.json({ 
        success: true, 
        previewIDs,
        message: 'Preview IDs generated successfully'
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Error managing customer ID:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to manage customer ID',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}