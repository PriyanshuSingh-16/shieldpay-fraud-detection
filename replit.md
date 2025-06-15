# ShieldPay - UPI Fraud Detection System

## Overview

ShieldPay is a comprehensive fraud detection system designed specifically for UPI (Unified Payments Interface) transactions. The application provides real-time monitoring, QR code steganography detection, transaction pattern analysis, and comprehensive alerting capabilities to prevent financial fraud.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with custom configuration for monorepo structure
- **Styling**: Tailwind CSS with custom dark theme and component-based design system
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Routing**: Wouter for lightweight client-side routing
- **Charts & Visualization**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with TypeScript and ESM modules
- **Framework**: Express.js with custom middleware for request logging and error handling
- **Development Server**: Custom Vite integration for HMR in development
- **File Processing**: Multer for handling file uploads (QR code images)
- **Authentication**: JWT-based authentication with bcrypt for password hashing

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for serverless PostgreSQL connections

## Key Components

### Authentication System
- JWT-based authentication with token verification middleware
- Session management with localStorage on client-side
- Role-based access control (admin role)
- Protected routes with authentication context

### QR Code Analysis Engine
- Steganography detection using simulated LSB (Least Significant Bit) analysis
- CNN-based classification simulation for malicious QR codes
- Phishing detection algorithms
- Risk scoring system (0-100 scale)
- Support for UPI ID extraction and merchant name detection

### Transaction Analysis System
- Pattern detection for multiple fraud types:
  - Smurfing (structured layering)
  - Flash laundering
  - Mule networks
  - Circular transfers
- Real-time risk scoring based on transaction metadata
- Velocity checks and anomaly detection
- Geographic IP analysis integration

### Alert Management
- Multi-severity alert system (low, medium, high, critical)
- Real-time alert generation based on risk thresholds
- Alert acknowledgment and status tracking
- Dashboard integration with active alert counts

### Flagged Account Management
- Account flagging based on suspicious activities
- Status tracking (pending, under-investigation, cleared, suspended)
- Review workflow with assigned reviewers
- Bulk operations for account management

## Data Flow

1. **QR Code Analysis Flow**:
   - User uploads QR code image → Multer processes file → QR Analysis Service analyzes for steganography → Results stored in database → Real-time updates to dashboard

2. **Transaction Monitoring Flow**:
   - Transaction data ingested → Analysis Service applies pattern detection → Risk scores calculated → Alerts generated if thresholds exceeded → Flagged accounts updated

3. **Dashboard Updates Flow**:
   - TanStack Query polls APIs every 30 seconds → Real-time statistics updated → Charts and visualizations refreshed → Alert badges updated

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL serverless database
- **File Storage**: In-memory storage for uploaded QR codes (production would use cloud storage)
- **Authentication**: JWT tokens with configurable secret key

### Development Tools
- **Replit Integration**: Custom Cartographer plugin for development environment
- **Hot Module Replacement**: Vite HMR with Express middleware integration
- **Error Handling**: Runtime error overlay for development debugging

## Deployment Strategy

### Build Process
1. Frontend build using Vite → outputs to `dist/public`
2. Backend build using esbuild → outputs to `dist/index.js`
3. Static assets served from built frontend
4. ESM module bundling for Node.js deployment

### Environment Configuration
- **Development**: `npm run dev` - runs both frontend and backend with HMR
- **Production**: `npm run build && npm run start` - builds and serves optimized bundle
- **Database**: Drizzle migrations with `npm run db:push`

### Deployment Target
- Configured for Replit autoscale deployment
- PostgreSQL module integration
- Port 5000 internal, 80 external mapping
- Node.js 20 runtime environment

## Changelog
```
Changelog:
- June 15, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```