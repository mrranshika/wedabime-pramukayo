# Wedabime Pramukayo - Site Visitor Application

A comprehensive site visitor application for Wedabime Pramukayo built with Next.js, featuring green/blue theme and Google Sheets integration.

## Features

- **Customer Information Management**: Customer ID generation, contact details with WhatsApp integration
- **Location Tracking**: District, city, and address information with Google Maps integration
- **Service Selection**: Roof, Ceiling, and Gutters services with detailed specifications
- **Advanced Calculations**: Area calculations for ceiling services with automatic pricing
- **Measurement Tracking**: Gutters measurements with automatic total calculations
- **Hierarchical Selection**: Complex roof selection with material, color, and sub-option choices
- **Status Management**: Track project status (Pending, Running, Complete, Cancel)
- **Google Sheets Integration**: Automatic data storage to Google Sheets
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: React hooks
- **Backend**: Next.js API routes
- **Data Storage**: Google Sheets via Google Apps Script
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google account for Google Sheets
- Vercel account for deployment

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd wedabime-pramukayo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Google Sheets Setup

### 1. Create Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Wedabime Pramukayo - Site Visits"
3. Create the following columns in the first sheet:
   - Customer ID
   - Lead Date
   - Customer Name
   - Phone Number
   - Has WhatsApp
   - WhatsApp Number
   - District
   - City
   - Address
   - Has Removals
   - Removal Charge
   - Has Additional Labor
   - Additional Labor Charge
   - Status
   - Selected Service
   - Service Data (JSON)
   - Timestamp

### 2. Create Google Apps Script

1. In your Google Sheet, go to `Extensions` > `Apps Script`
2. Replace the code with the following:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    
    // Prepare row data
    const rowData = [
      data.customerId || '',
      data.leadDate || '',
      data.customerName || '',
      data.phoneNumber || '',
      data.hasWhatsApp || false,
      data.whatsappNumber || '',
      data.district || '',
      data.city || '',
      data.address || '',
      data.hasRemovals || false,
      data.removalCharge || '',
      data.hasAdditionalLabor || false,
      data.additionalLaborCharge || '',
      data.status || '',
      data.selectedService || '',
      JSON.stringify({
        ceilingData: data.ceilingData || null,
        guttersData: data.guttersData || null,
        roofData: data.roofData || null
      }),
      new Date().toISOString()
    ];
    
    // Append row to sheet
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    message: 'Google Sheets API is working',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Save the script (Ctrl + S or click Save project)
4. Click `Deploy` > `New deployment`
5. Select `Web app` as the deployment type
6. Configure:
   - Description: "Wedabime Pramukayo API"
   - Execute as: "Me (your email)"
   - Who has access: "Anyone"
7. Click `Deploy`
8. Copy the Web app URL
9. Update the `GOOGLE_SCRIPT_URL` in `/src/app/api/google-sheets/route.ts` with your URL

## Vercel Deployment Guide

### Basic Guide (Free Deployment)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- Set up and deploy `~/my-project`
- Which scope do you want to deploy to? (Select your account)
- Link to existing project? (No)
- What's your project's name? (wedabime-pramukayo)
- In which directory is your code located? (./)
- Want to modify the settings? (No)

Vercel will deploy your application and provide you with a URL.

### Advanced Guide (Custom Domain and Environment Variables)

#### Step 1: Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with your GitHub, GitLab, or Bitbucket account
3. Verify your email address

#### Step 2: Connect Your Repository

1. Click "New Project"
2. Select your Git provider
3. Choose your repository
4. Click "Import"

#### Step 3: Configure Project Settings

1. **Framework Preset**: Next.js should be automatically detected
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Install Command**: `npm install`

#### Step 4: Add Environment Variables (Optional)

If you need to add environment variables:

1. Go to project settings
2. Click "Environment Variables"
3. Add your variables (if any)
4. Click "Add"

#### Step 5: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Your application will be available at `https://your-project-name.vercel.app`

#### Step 6: Custom Domain (Optional)

1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### GitHub Integration (Recommended for Continuous Deployment)

#### Step 1: Connect GitHub Repository

1. In Vercel dashboard, click "New Project"
2. Select "Import Git Repository"
3. Choose your repository
4. Click "Import"

#### Step 2: Configure Automatic Deploys

1. **Root Directory**: `./`
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Install Command**: `npm install`

#### Step 3: Deploy on Push

1. Enable automatic deployments
2. Choose branch to deploy (usually `main` or `master`)
3. Click "Save"

Now every time you push to your repository, Vercel will automatically deploy your application.

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Google Sheets API URL (optional - can be hardcoded)
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/your-script-id/exec
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── google-sheets/
│   │       └── route.ts          # Google Sheets API endpoint
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main site visitor form
│   └── globals.css              # Global styles
├── components/
│   └── ui/                      # shadcn/ui components
├── hooks/
│   ├── use-mobile.ts            # Mobile detection hook
│   └── use-toast.ts             # Toast notification hook
└── lib/
    ├── utils.ts                 # Utility functions
    └── db.ts                    # Database connection (if using Prisma)
```

## API Endpoints

### POST /api/google-sheets
Submit form data to Google Sheets

**Request Body:**
```json
{
  "customerId": "A-000a01",
  "leadDate": "2024-01-15",
  "customerName": "John Doe",
  "phoneNumber": "+1234567890",
  "hasWhatsApp": true,
  "district": "Colombo",
  "city": "Colombo",
  "address": "123 Main Street",
  "hasRemovals": false,
  "hasAdditionalLabor": true,
  "additionalLaborCharge": "5000",
  "status": "pending",
  "selectedService": "ceiling",
  "ceilingData": {
    "type": "eltoro",
    "pricePerSqFt": 180,
    "areas": [
      {"length": "10' 0\"", "width": "10' 0\"", "area": 100}
    ],
    "totalArea": 100,
    "totalCost": 18000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {}
}
```

### GET /api/google-sheets
Health check endpoint

**Response:**
```json
{
  "message": "Google Sheets API endpoint is working",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Google Sheets CORS Error**
   - Make sure your Google Apps Script is deployed with "Anyone" access
   - Verify the Web app URL is correct

2. **Vercel Deployment Failed**
   - Check build logs for errors
   - Ensure all dependencies are properly installed
   - Verify Next.js configuration

3. **Form Not Submitting**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Ensure Google Apps Script is properly deployed

### Debug Mode

To enable debug mode, add this to your environment variables:

```env
DEBUG=true
```

## Mobile App Conversion

To convert this web app to a mobile app using webintoapp.com:

1. Go to [webintoapp.com](https://www.webintoapp.com/)
2. Enter your Vercel app URL
3. Configure app settings:
   - App name: "Wedabime Pramukayo"
   - Icon: Upload a suitable icon
   - Orientation: Portrait
   - Enable camera access for photo uploads
4. Generate the APK
5. Download and install on Android devices

## Support

For support and questions:
- Check the troubleshooting section above
- Review Vercel documentation
- Consult Google Apps Script documentation
- Create an issue in your repository

## License

This project is licensed under the MIT License.