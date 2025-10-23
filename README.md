# 🚀 Bar National P&L Analysis Ultimate Edition

**Dockerized Financial Management System with Advanced Forecasting**

A comprehensive financial management platform for Bar National, now containerized with Docker and enhanced with powerful forecasting capabilities.

## ✨ Features

### 🏗️ **Dockerized Architecture**
- **Next.js Application Container**: Optimized production-ready container
- **MongoDB Container**: Local database with persistent storage
- **Automated Seeding**: Sample data population for testing
- **Easy Development**: One-command setup and deployment

### 📊 **Financial Management**
- **Daily Input Forms**: Track revenues, expenses, and staff costs
- **Calendar View**: Visual overview of daily performance
- **Advanced Reports**: Weekly, monthly, quarterly, and annual analysis
- **P&L Analysis**: Comprehensive profit and loss calculations
- **CSV Export**: Export reports for external analysis

### 🔮 **NEW: Financial Forecasting**
- **Revenue Projections**: Based on historical data patterns
- **Expense Forecasting**: COGS, personnel, and fixed costs
- **Profit Predictions**: Monthly profit/loss projections
- **Scenario Planning**: Adjust multipliers for different scenarios
- **Export Capabilities**: Download forecast reports

## 🛠️ Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (for cloning)

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd bar-national-pnl-ultimate
```

### 2. Start the Application
```bash
# Start all services (app + database + seeding)
docker-compose up -d

# Or start with logs visible
docker-compose up
```

### 3. Access the Application
- **Application**: http://localhost:3000
- **MongoDB**: localhost:27017

### 4. Stop the Application
```bash
docker-compose down
```

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Docker Commands
npm run docker:build    # Build Docker image
npm run docker:run      # Run container
npm run docker:up       # Start all services
npm run docker:down     # Stop all services
npm run docker:logs     # View logs
npm run docker:seed     # Seed database only
npm run docker:clean    # Clean up everything
```

## 🗄️ Database

### MongoDB Configuration
- **Database**: `bar-national`
- **User**: `bar-national-user`
- **Password**: `bar-national-password`
- **Port**: `27017`

### Sample Data
The application automatically seeds the database with 30 days of realistic sample data including:
- Revenue patterns (800-1200 BGN daily)
- Staff expenses with weekend premiums
- Variable operating expenses
- Calculated P&L metrics

## 🔮 Forecasting API

### Endpoint: `/api/forecast`

#### POST Request
```json
{
  "fixedCosts": 2000,
  "cogsPercentage": 30,
  "personnelMultiplier": 1.0,
  "revenueMultiplier": 1.0
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "forecast": {
      "revenue": {
        "projected": 25000,
        "daily": 833.33
      },
      "expenses": {
        "cogs": 7500,
        "personnel": 6000,
        "other": 2000,
        "fixed": 2000,
        "total": 17500
      },
      "profit": {
        "projected": 7500,
        "margin": 30.0
      }
    },
    "historicalData": {
      "averages": {
        "avgDailyRevenue": 833.33,
        "avgDailyExpenses": 583.33
      },
      "sampleSize": 30
    }
  }
}
```

## 🏗️ Architecture

```
bar-national-pnl-ultimate/
├── components/
│   └── Financial/
│       ├── DailyInputForm.js
│       ├── CalendarView.js
│       ├── ReportsDashboard.js
│       └── ForecastingDashboard.js    # NEW
├── pages/
│   ├── api/
│   │   ├── reports/
│   │   └── forecast.js                # NEW
│   └── index.js
├── scripts/
│   ├── init-mongo.js                  # NEW
│   └── seed-data.js                   # NEW
├── styles/
│   └── Financial.module.css
├── Dockerfile                         # NEW
├── docker-compose.yml                 # NEW
└── package.json
```

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/bar-national?authSource=admin
PORT=3000
```

### Docker Compose Services
- **app**: Next.js application (port 3000)
- **mongodb**: MongoDB database (port 27017)
- **seed**: One-time data seeding service

## 📊 Usage Guide

### 1. Daily Input
- Navigate to "📝 Daily Input" tab
- Enter daily revenues (general, POS, cash)
- Add staff expenses by role
- Record other operating expenses
- Save to database

### 2. View Reports
- Go to "📊 Reports" tab
- Select time period (daily, weekly, monthly, etc.)
- View comprehensive P&L analysis
- Export data to CSV

### 3. Financial Forecasting
- Click "🔮 Forecasting" tab
- Set fixed costs (rent, utilities, etc.)
- Adjust COGS percentage
- Modify personnel and revenue multipliers
- Generate monthly projections
- Export forecast reports

## 🚀 Deployment

### Production Deployment
1. Build the Docker image:
   ```bash
   docker build -t bar-national-pnl-ultimate .
   ```

2. Run with production settings:
   ```bash
   docker run -d -p 3000:3000 bar-national-pnl-ultimate
   ```

### Development
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app

# Rebuild after changes
docker-compose up --build
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB container
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Database Not Seeded**
   ```bash
   # Run seeding manually
   docker-compose up seed
   ```

4. **Clean Start**
   ```bash
   # Remove everything and start fresh
   docker-compose down -v
   docker system prune -f
   docker-compose up --build
   ```

## 📈 Performance

- **Optimized Docker Image**: Multi-stage build for smaller size
- **MongoDB Indexing**: Optimized queries for better performance
- **Caching**: Database connection caching
- **Responsive Design**: Mobile-friendly interface

## 🔒 Security

- **Container Isolation**: Services run in isolated containers
- **Database Authentication**: MongoDB with user authentication
- **Input Validation**: All API endpoints validate input data
- **Error Handling**: Comprehensive error handling and logging

## 📞 Support

- **Phone**: +359896823923
- **Email**: info@barnational.bg
- **Documentation**: See individual component READMEs

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Integration with POS systems
- [ ] Mobile app development
- [ ] Advanced forecasting algorithms

---

**© 2024 Bar National P&L Analysis Ultimate Edition**
*Dockerized Financial Management System with Forecasting*