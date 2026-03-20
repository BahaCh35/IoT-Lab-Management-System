# Novation SmartLab - AI-Powered Laboratory Management Platform

A comprehensive React-based frontend for the Novation SmartLab system - an AI-powered laboratory equipment management platform.

## Project Overview

**SmartLab** is a full-featured laboratory management system designed to streamline equipment tracking, checkout/checkin workflows, reservations, and analytics. The system combines a modern web interface with AI-powered chatbot assistance.

### Key Features

📊 **Core Functionality**
- Equipment catalog with advanced search and filtering
- Quick check-out/check-in via QR codes
- Reservation system with calendar integration
- Real-time analytics and usage reporting
- AI chatbot assistant for natural language queries

✨ **Modern UI Design**
- Built with Material-UI for a professional, responsive interface
- Blue & purple gradient branding
- Fully responsive design for desktop and tablet use

🔐 **User Management**
- Role-based access control (Admin, Lab Manager, Engineer, Technician)
- Secure authentication
- User profile management

## Tech Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Material-UI v5** - Professional component library
- **React Router** - Navigation and routing
- **Recharts** - Data visualization
- **Day.js** - Date manipulation

## Getting Started

### Installation

```bash
cd smartlab
npm install
```

### Development

```bash
npm start
```

Open `http://localhost:3000` in your browser.

**Demo Credentials:**
- Email: engineer@novation.com
- Password: demo123

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   └── Sidebar.tsx     # Main sidebar navigation
├── pages/              # Full page views
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── EquipmentCatalogPage.tsx
│   ├── CheckoutCheckinPage.tsx
│   ├── ReservationsPage.tsx
│   ├── ChatbotPage.tsx
│   └── AnalyticsPage.tsx
├── types/              # TypeScript types
├── constants/          # Application constants
├── theme.ts            # Material-UI theme
├── App.tsx             # Main app with routing
└── index.tsx           # React entry point
```

## Features

### Dashboard
- Equipment status overview
- Real-time statistics
- Usage trends and charts
- Recent activity log

### Equipment Catalog
- Browse all equipment
- Advanced search and filtering
- Detailed specifications
- Availability tracking

### Check-out/Check-in
- QR code scanning
- Quick equipment search
- Return date selection
- Condition tracking

### Reservations
- Calendar-based scheduling
- Conflict detection
- Recurring reservations
- Status notifications

### AI Chatbot
- Natural language queries
- Equipment recommendations
- Voice input support
- Smart suggestions

### Analytics
- Equipment utilization metrics
- Usage trends
- User activity reports
- Export functionality

## Design System

**Primary Colors:**
- Blue: `#1a73e8` - Main actions
- Purple: `#7c3aed` - Accents
- Green: `#10b981` - Available
- Orange: `#f59e0b` - Maintenance
- Red: `#ef4444` - Damaged

## Available Scripts

```bash
npm start      # Run development server
npm run build  # Create production build
npm test       # Run tests
```

## API Integration

The frontend is ready for backend API integration. Key endpoints:

```
POST   /api/auth/login
GET    /api/equipment
POST   /api/checkouts
GET    /api/reservations
POST   /api/chatbot/query
GET    /api/analytics/usage
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- Uses mock data for development
- Ready for API integration
- Fully typed with TypeScript
- Material-UI theme customization
- Responsive design throughout

## Production Deployment

```bash
npm run build
# Deploy the build/ folder to your hosting service
```

Set environment variables:
```
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_CHATBOT_API_KEY=your_api_key
```

## Troubleshooting

**Port 3000 already in use:**
```bash
npm start -- --port 3001
```

**Clear cache:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Backend API integration
2. Real database connection
3. Authentication setup
4. AI chatbot integration
5. Mobile app development
6. Testing and QA
7. Deployment

## Version

**Version:** 1.0.0-alpha  
**Status:** Development  
**Last Updated:** February 15, 2026

## License

Proprietary - Novation City Sousse

---

Built with ❤️ for Novation SmartLab
