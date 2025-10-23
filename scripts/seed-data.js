// MongoDB seed data script
// Populates the database with sample financial data for testing

// Connect to the database
db = db.getSiblingDB('bar-national');

// Sample data for the last 30 days
const sampleData = [];

// Generate data for the last 30 days
for (let i = 29; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateString = date.toISOString().split('T')[0];
  
  // Generate realistic sample data with some variation
  const baseRevenue = 800 + Math.random() * 400; // 800-1200 BGN base
  const posRevenue = baseRevenue * (0.6 + Math.random() * 0.2); // 60-80% POS
  const generalRevenue = baseRevenue + (Math.random() - 0.5) * 100; // Some variation
  
  // Staff expenses (varies by day of week)
  const dayOfWeek = date.getDay();
  const staffMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1.0; // Weekend premium
  
  const staffExpenses = [
    { role: 'Manager', amount: 80 * staffMultiplier },
    { role: 'Bartender', amount: 60 * staffMultiplier },
    { role: 'Server', amount: 50 * staffMultiplier },
    { role: 'Kitchen Staff', amount: 70 * staffMultiplier }
  ];
  
  // Other expenses
  const expenses = [
    { type: 'Supplies', amount: 30 + Math.random() * 20 },
    { type: 'Utilities', amount: 25 + Math.random() * 10 },
    { type: 'Maintenance', amount: 15 + Math.random() * 15 },
    { type: 'Marketing', amount: 20 + Math.random() * 10 }
  ];
  
  // Calculate totals
  const totalStaffExpenses = staffExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalOtherExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = totalStaffExpenses + totalOtherExpenses;
  
  const cashRevenue = generalRevenue - posRevenue;
  const cashTurnover = cashRevenue - totalExpenses;
  const generalTurnover = generalRevenue - totalExpenses;
  
  const report = {
    date: dateString,
    staff_expenses: staffExpenses,
    expenses: expenses,
    revenues: {
      general: Math.round(generalRevenue * 100) / 100,
      pos: Math.round(posRevenue * 100) / 100,
      cash: Math.round(cashRevenue * 100) / 100
    },
    summary: {
      total_expenses: Math.round(totalExpenses * 100) / 100,
      cash_turnover: Math.round(cashTurnover * 100) / 100,
      general_turnover: Math.round(generalTurnover * 100) / 100
    },
    notes: `Sample data for ${dateString}`,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  sampleData.push(report);
}

// Insert sample data
print('Inserting sample data...');
const result = db.dailyreports.insertMany(sampleData);

print(`Successfully inserted ${result.insertedCount} sample reports`);
print('Sample data includes:');
print('- 30 days of financial data');
print('- Realistic revenue patterns (800-1200 BGN daily)');
print('- Staff expenses with weekend premiums');
print('- Variable operating expenses');
print('- Calculated P&L metrics');

// Show some statistics
const totalRevenue = sampleData.reduce((sum, report) => sum + report.revenues.general, 0);
const totalExpenses = sampleData.reduce((sum, report) => sum + report.summary.total_expenses, 0);
const totalProfit = totalRevenue - totalExpenses;

print('\nSample Data Summary:');
print(`Total Revenue: ${totalRevenue.toFixed(2)} BGN`);
print(`Total Expenses: ${totalExpenses.toFixed(2)} BGN`);
print(`Total Profit: ${totalProfit.toFixed(2)} BGN`);
print(`Average Daily Revenue: ${(totalRevenue / 30).toFixed(2)} BGN`);
print(`Average Daily Profit: ${(totalProfit / 30).toFixed(2)} BGN`);

print('\nDatabase seeded successfully! 🎉');
