# ShieldPay - UPI Fraud Detection System

![ShieldPay Logo](https://img.shields.io/badge/ShieldPay-Fraud%20Detection-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

ShieldPay is a comprehensive fraud detection system designed specifically for UPI (Unified Payments Interface) transactions. The application provides real-time monitoring, QR code steganography detection, transaction pattern analysis, and comprehensive alerting capabilities to prevent financial fraud.

## Features

### 🔍 Advanced Fraud Detection
- **Transaction Pattern Analysis**: Detects smurfing, flash laundering, mule networks, and circular transfers
- **QR Code Steganography Detection**: AI-powered analysis using LSB detection and CNN classification
- **Real-time Risk Scoring**: Dynamic risk assessment with 0-100 scale scoring
- **Geographic Analysis**: IP-based location tracking for suspicious activities

### 🚨 Alert Management
- **Multi-severity Alerts**: Low, medium, high, and critical alert levels
- **Real-time Notifications**: Instant alerts for high-risk transactions
- **Alert Acknowledgment**: Track and manage alert responses
- **Dashboard Integration**: Centralized alert monitoring

### 📊 Comprehensive Dashboard
- **Real-time Statistics**: Live transaction monitoring and analytics
- **Interactive Charts**: Visual representation of fraud patterns
- **Account Flagging**: Automated suspicious account identification
- **Historical Analysis**: Trend analysis and reporting

### 🔐 Security Features
- **JWT Authentication**: Secure user authentication and session management
- **Role-based Access**: Admin-level access controls
- **Encrypted Data**: Secure data transmission and storage
- **Audit Logging**: Complete transaction and action logging

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Radix UI** components
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **JWT** for authentication
- **Multer** for file uploads

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/shieldpay-fraud-detection.git
cd shieldpay-fraud-detection

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Default Login Credentials
```
Email: admin@shieldpay.com
Password: admin123
```

## Sample Data

The project includes comprehensive test data in the `sample_data/` directory:

### Transaction Files
- `transactions_normal.csv` - Clean transaction data
- `transactions_suspicious.csv` - Suspicious patterns
- `transactions_flash_laundering.csv` - Flash laundering patterns
- `transactions_mule_network.csv` - Mule network patterns
- `transactions_mixed.json` - Mixed legitimate and suspicious data

### QR Code Test Files
- Clean QR codes for legitimate transactions
- Suspicious QR codes with potential steganography
- High-risk phishing QR codes

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

### Dashboard
- `GET /api/dashboard/stats` - Real-time statistics
- `GET /api/alerts/active` - Active alerts

### Analysis
- `POST /api/qr-codes/analyze` - QR code analysis
- `POST /api/transactions/analyze` - Transaction analysis

### Data Management
- `GET /api/transactions` - Transaction list
- `GET /api/flagged-accounts` - Flagged accounts
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alerts

## Deployment

### Vercel Deployment
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Environment Variables (Production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Set to "production"

### Database Setup
1. Create a PostgreSQL database (Neon, Supabase, or Vercel Postgres)
2. Add the connection string to environment variables
3. Run migrations: `npm run db:push`

## Usage

### Testing Transaction Analysis
1. Login to the dashboard
2. Navigate to Transactions section
3. Upload a CSV file from `sample_data/`
4. Review analysis results and alerts

### Testing QR Code Analysis
1. Go to QR Scanner section
2. Upload a test file (rename .txt to .png/.jpg)
3. Review steganography detection results
4. Monitor generated alerts

## Fraud Detection Patterns

### Transaction Patterns
- **Smurfing**: Multiple transactions under 10,000 threshold
- **Flash Laundering**: Rapid circular money movements
- **Mule Networks**: Single controller with multiple accounts
- **Circular Transfers**: Money flowing in circles

### QR Code Analysis
- **LSB Steganography**: Hidden data detection
- **Phishing Detection**: Suspicious merchant identification
- **Anomaly Detection**: Unusual payment patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security

- Report security vulnerabilities privately
- Regular security audits and updates
- Encrypted data transmission
- Secure authentication practices

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Review the deployment guide
- Check the sample data documentation

## Acknowledgments

- Built with modern web technologies
- Inspired by real-world fraud detection needs
- Community-driven development