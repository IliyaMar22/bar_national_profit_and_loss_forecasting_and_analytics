import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency, bgnToEur } from '../../utils/currency';
import styles from '../../styles/Charts.module.css';

export default function RevenueChart({ data, title = "Daily Revenue Trend" }) {
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
    general: item.revenues?.general || 0,
    pos: item.revenues?.pos || 0,
    cash: item.revenues?.cash || 0,
    profit: item.summary?.general_turnover || 0
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

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Line 
              type="monotone" 
              dataKey="general" 
              stroke="#667eea" 
              strokeWidth={3}
              name="General Revenue"
              dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="pos" 
              stroke="#764ba2" 
              strokeWidth={3}
              name="POS Revenue"
              dot={{ fill: '#764ba2', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#764ba2', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="cash" 
              stroke="#38a169" 
              strokeWidth={3}
              name="Cash Revenue"
              dot={{ fill: '#38a169', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#38a169', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
