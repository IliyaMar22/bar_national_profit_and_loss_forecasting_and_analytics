import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import styles from '../../styles/Charts.module.css';

export default function ProfitChart({ data, title = "Daily Profit/Loss Analysis" }) {
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

  const chartData = data.map(item => ({
    date: item.date,
    profit: item.summary?.general_turnover || 0,
    expenses: item.summary?.total_expenses || 0,
    revenue: item.revenues?.general || 0
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getBarColor = (value) => {
    return value >= 0 ? '#38a169' : '#e53e3e';
  };

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#718096"
              fontSize={12}
              tick={{ fill: '#718096' }}
            />
            <YAxis 
              stroke="#718096"
              fontSize={12}
              tick={{ fill: '#718096' }}
              tickFormatter={(value) => `BGN ${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="profit" name="Profit/Loss">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.profit)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
