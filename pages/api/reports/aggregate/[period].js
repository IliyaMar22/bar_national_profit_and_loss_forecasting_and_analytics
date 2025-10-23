// Next.js API route for aggregated reports

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
    type: { type: String },  // 'type' is a reserved word, so we need to specify it explicitly
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

export default async function handler(req, res) {
  await connectDB();
  
  const { period } = req.query;
  let { start_date, end_date } = req.query;

  if (req.method === 'GET') {
    try {
      // If period is provided (number of days), calculate start_date and end_date
      if (period && !start_date && !end_date) {
        const days = parseInt(period);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days);
        
        end_date = today.toISOString().split('T')[0];
        start_date = startDate.toISOString().split('T')[0];
      }
      
      if (!start_date || !end_date) {
        return res.status(400).json({ 
          success: false, 
          error: 'Either period or start_date and end_date are required' 
        });
      }
      
      const reports = await DailyReport.find({
        date: { $gte: start_date, $lte: end_date }
      }).sort({ date: 1 });
      
      if (reports.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          summary: {
            period: `${start_date} - ${end_date}`,
            total_expenses: 0,
            total_general_revenue: 0,
            total_cash_revenue: 0,
            total_pos_revenue: 0,
            cash_turnover: 0,
            general_turnover: 0,
            days_count: 0
          }
        });
      }
      
      const aggregated = reports.reduce((acc, report) => {
        acc.total_expenses += report.summary.total_expenses || 0;
        acc.total_general_revenue += report.revenues.general || 0;
        acc.total_cash_revenue += report.revenues.cash || 0;
        acc.total_pos_revenue += report.revenues.pos || 0;
        acc.cash_turnover += report.summary.cash_turnover || 0;
        acc.general_turnover += report.summary.general_turnover || 0;
        return acc;
      }, {
        total_expenses: 0,
        total_general_revenue: 0,
        total_cash_revenue: 0,
        total_pos_revenue: 0,
        cash_turnover: 0,
        general_turnover: 0
      });
      
      res.status(200).json({
        success: true,
        data: reports,
        summary: {
          period: `${start_date} - ${end_date}`,
          ...aggregated,
          days_count: reports.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

