// Financial Forecasting API Route
// Calculates basic financial forecasts based on historical data

import mongoose from 'mongoose';

let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@bar-national-mongodb:27017/bar-national?authSource=admin';
  
  const db = await mongoose.connect(MONGODB_URI);
  cachedDb = db;
  return db;
};

// Daily Report Schema (reused from reports API)
const dailyReportSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  staff_expenses: [{
    role: String,
    amount: Number
  }],
  expenses: [{
    type: { type: String },
    amount: Number
  }],
  revenues: {
    general: Number,
    pos: Number,
    cash: Number
  },
  summary: {
    total_expenses: Number,
    cash_turnover: Number,
    general_turnover: Number
  },
  notes: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const DailyReport = mongoose.models.DailyReport || mongoose.model('DailyReport', dailyReportSchema);

// Helper function to get historical data
// First tries to get last 30 days, if not enough data, gets all available data
const getHistoricalData = async () => {
  const now = new Date();
  
  // Try to get last 30 days of data
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const todayDate = now.toISOString().split('T')[0];
  
  let reports = await DailyReport.find({
    date: { $gte: startDate, $lte: todayDate }
  }).sort({ date: 1 });
  
  // If we don't have enough data from last 30 days, get all available data
  if (reports.length < 3) {
    reports = await DailyReport.find({}).sort({ date: 1 });
  }
  
  return reports;
};

// Calculate average daily metrics
const calculateAverages = (reports) => {
  if (reports.length === 0) {
    return {
      avgDailyRevenue: 0,
      avgDailyExpenses: 0,
      avgDailyPersonnel: 0,
      avgDailyOtherExpenses: 0,
      totalDays: 0
    };
  }
  
  const totalRevenue = reports.reduce((sum, report) => sum + report.revenues.general, 0);
  const totalExpenses = reports.reduce((sum, report) => sum + report.summary.total_expenses, 0);
  const totalPersonnel = reports.reduce((sum, report) => 
    sum + report.staff_expenses.reduce((staffSum, staff) => staffSum + staff.amount, 0), 0
  );
  const totalOtherExpenses = reports.reduce((sum, report) => 
    sum + report.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
  );
  
  return {
    avgDailyRevenue: totalRevenue / reports.length,
    avgDailyExpenses: totalExpenses / reports.length,
    avgDailyPersonnel: totalPersonnel / reports.length,
    avgDailyOtherExpenses: totalOtherExpenses / reports.length,
    totalDays: reports.length
  };
};

// Main forecasting logic
const calculateForecast = (averages, inputs) => {
  const {
    avgDailyRevenue,
    avgDailyPersonnel,
    avgDailyOtherExpenses
  } = averages;
  
  const {
    fixedCosts = 0,
    cogsPercentage = 30,
    personnelMultiplier = 1.0,
    revenueMultiplier = 1.0
  } = inputs;
  
  // Calculate monthly projections (assuming 30 days)
  const daysInMonth = 30;
  
  // Revenue projections
  const projectedMonthlyRevenue = avgDailyRevenue * revenueMultiplier * daysInMonth;
  
  // COGS calculation
  const projectedCOGS = projectedMonthlyRevenue * (cogsPercentage / 100);
  
  // Personnel expenses (from historical data with optional multiplier)
  const projectedPersonnel = avgDailyPersonnel * personnelMultiplier * daysInMonth;
  
  // Other variable expenses (from historical data)
  const projectedOtherExpenses = avgDailyOtherExpenses * daysInMonth;
  
  // Fixed costs (user input)
  const totalFixedCosts = fixedCosts;
  
  // Total expenses
  const totalExpenses = projectedCOGS + projectedPersonnel + projectedOtherExpenses + totalFixedCosts;
  
  // Profit/Loss calculation
  const projectedProfit = projectedMonthlyRevenue - totalExpenses;
  const profitMargin = projectedMonthlyRevenue > 0 ? (projectedProfit / projectedMonthlyRevenue) * 100 : 0;
  
  return {
    revenue: {
      projected: projectedMonthlyRevenue,
      daily: projectedMonthlyRevenue / daysInMonth
    },
    expenses: {
      cogs: projectedCOGS,
      personnel: projectedPersonnel,
      other: projectedOtherExpenses,
      fixed: totalFixedCosts,
      total: totalExpenses
    },
    profit: {
      projected: projectedProfit,
      margin: profitMargin
    },
    assumptions: {
      daysInMonth,
      cogsPercentage,
      personnelMultiplier,
      revenueMultiplier,
      basedOnDays: averages.totalDays
    }
  };
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const {
        fixedCosts = 0,
        cogsPercentage = 30,
        personnelMultiplier = 1.0,
        revenueMultiplier = 1.0
      } = req.body;
      
      // Validate inputs
      if (cogsPercentage < 0 || cogsPercentage > 100) {
        return res.status(400).json({
          success: false,
          error: 'COGS percentage must be between 0 and 100'
        });
      }
      
      if (personnelMultiplier < 0 || revenueMultiplier < 0) {
        return res.status(400).json({
          success: false,
          error: 'Multipliers must be positive numbers'
        });
      }
      
      // Get historical data
      const historicalReports = await getHistoricalData();
      
      // Calculate averages
      const averages = calculateAverages(historicalReports);
      
      // Calculate forecast
      const forecast = calculateForecast(averages, {
        fixedCosts: parseFloat(fixedCosts),
        cogsPercentage: parseFloat(cogsPercentage),
        personnelMultiplier: parseFloat(personnelMultiplier),
        revenueMultiplier: parseFloat(revenueMultiplier)
      });
      
      // Add metadata
      const result = {
        success: true,
        data: {
          forecast,
          historicalData: {
            averages,
            sampleSize: averages.totalDays,
            totalReports: historicalReports.length
          },
          generatedAt: new Date().toISOString()
        }
      };
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Forecast calculation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate forecast: ' + error.message
      });
    }
  } else if (req.method === 'GET') {
    // Return forecast parameters info
    res.status(200).json({
      success: true,
      data: {
        description: 'Financial Forecasting API',
        parameters: {
          fixedCosts: {
            type: 'number',
            description: 'Monthly fixed costs (rent, utilities, etc.)',
            default: 0,
            unit: 'BGN'
          },
          cogsPercentage: {
            type: 'number',
            description: 'Cost of Goods Sold as percentage of revenue',
            default: 30,
            unit: '%',
            min: 0,
            max: 100
          },
          personnelMultiplier: {
            type: 'number',
            description: 'Multiplier for personnel expenses (1.0 = same as last month)',
            default: 1.0,
            unit: 'multiplier'
          },
          revenueMultiplier: {
            type: 'number',
            description: 'Multiplier for revenue projection (1.0 = same as last month)',
            default: 1.0,
            unit: 'multiplier'
          }
        },
        usage: 'Send POST request with parameters to get forecast'
      }
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
