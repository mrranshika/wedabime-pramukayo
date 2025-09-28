# Wedabime Pramukayo - Site Visitor Application

A comprehensive site visitor application for Wedabime Pramukayo with Google Sheets integration.

## 🚀 Deployment Guide

### Prerequisites

- Google Account (for Google Sheets)
- GitHub Account (for Vercel deployment)
- Node.js 18+ installed locally

### Step 1: Google Sheets Setup

1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com)
2. Name it "Wedabime Pramukayo - Site Visits"
3. Set up column headers (see `COLUMNS.md` for complete list)
4. Create Google Apps Script with the code in `google-apps-script.js`
5. Deploy as Web App with "Anyone" access
6. Copy the Web App URL

### Step 2: Environment Setup

1. Fork this repository to your GitHub account
2. Clone it locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/wedabime-pramukayo.git
   cd wedabime-pramukayo
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_GOOGLE_SHEETS_URL=your_google_apps_script_url
   DATABASE_URL="file:./dev.db"
   ```

### Step 3: Vercel Deployment

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. Deploy to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable:
     - `NEXT_PUBLIC_GOOGLE_SHEETS_URL`: Your Google Apps Script URL
   - Deploy

### Step 4: Testing

1. Fill out the form on your deployed site
2. Check your Google Sheet for new entries
3. Verify all data is correctly saved

## 📋 Features

- ✅ Customer information management
- ✅ WhatsApp integration with conditional logic
- ✅ Location tracking with Google Maps
- ✅ Media upload (images & videos)
- ✅ Service selection (Roof, Ceiling, Gutters)
- ✅ Complex calculation systems
- ✅ Google Sheets integration
- ✅ Real-time form validation
- ✅ Responsive design

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (local), Google Sheets (production)
- **Deployment**: Vercel
- **Authentication**: Google Apps Script

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GOOGLE_SHEETS_URL` | Google Apps Script URL | Yes |
| `DATABASE_URL` | Local database URL | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Google Apps Script deployment
3. Ensure environment variables are correctly set
4. Check Vercel deployment logs

For additional support, please create an issue in the GitHub repository.