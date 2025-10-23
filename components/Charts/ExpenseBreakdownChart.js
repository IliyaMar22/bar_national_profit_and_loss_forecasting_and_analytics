import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import styles from '../../styles/Charts.module.css';

export default function ExpenseBreakdownChart({ data, title = "Expense Breakdown" }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <div className={styles.noDataMessage}>
          📊 No data available for this period
        </div>
      </div>
    );
  }

  // Calculate totals for the period
  const totals = data.reduce((acc, item) => {
    const staffTotal = item.staff_expenses?.reduce((sum, staff) => sum + (staff.amount || 0), 0) || 0;
    const otherTotal = item.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
    
    acc.staff += staffTotal;
    acc.other += otherTotal;
    return acc;
  }, { staff: 0, other: 0 });

  const chartData = [
    { name: 'Staff Expenses', value: totals.staff, color: '#667eea' },
    { name: 'Other Expenses', value: totals.other, color: '#764ba2' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{data.name}</p>
          <p style={{ color: data.payload.color }}>
            {`Amount: ${formatCurrency(data.value)}`}
          </p>
          <p style={{ color: data.payload.color }}>
            {`Percentage: ${((data.value / (totals.staff + totals.other)) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
