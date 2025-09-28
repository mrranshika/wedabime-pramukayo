import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file received" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomId}.${fileExtension}`;
    
    // Save file to public/uploads directory
    const path = join(process.cwd(), "public", "uploads", fileName);
    await writeFile(path, buffer);

    // Return file URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type
      }
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload file",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}