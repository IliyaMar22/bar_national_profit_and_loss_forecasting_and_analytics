import { useState, useEffect } from 'react';
import styles from '../../styles/Financial.module.css';
import { formatCurrency, bgnToEur } from '../../utils/currency';

export default function ForecastingDashboard() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputs, setInputs] = useState({
    fixedCosts: 2000,
    cogsPercentage: 30,
    personnelMultiplier: 1.0,
    revenueMultiplier: 1.0
  });

  const calculateForecast = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      const data = await response.json();

      if (data.success) {
        setForecastData(data.data);
      } else {
        setError(data.error || 'Failed to calculate forecast');
      }
    } catch (err) {
      setError('Error calculating forecast: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const exportForecast = () => {
    if (!forecastData) return;

    const { forecast, historicalData } = forecastData;
    
    let csv = 'Bar National - Financial Forecast\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Forecast Parameters\n';
    csv += `Fixed Costs,BGN ${inputs.fixedCosts}\n`;
    csv += `COGS Percentage,${inputs.cogsPercentage}%\n`;
    csv += `Personnel Multiplier,${inputs.personnelMultiplier}x\n`;
    csv += `Revenue Multiplier,${inputs.revenueMultiplier}x\n\n`;
    
    csv += 'Monthly Projections (BGN / EUR)\n';
    csv += `Projected Revenue,BGN ${forecast.revenue.projected.toFixed(2)},€${bgnToEur(forecast.revenue.projected).toFixed(2)}\n`;
    csv += `COGS,BGN ${forecast.expenses.cogs.toFixed(2)},€${bgnToEur(forecast.expenses.cogs).toFixed(2)}\n`;
    csv += `Personnel Expenses,BGN ${forecast.expenses.personnel.toFixed(2)},€${bgnToEur(forecast.expenses.personnel).toFixed(2)}\n`;
    csv += `Other Expenses,BGN ${forecast.expenses.other.toFixed(2)},€${bgnToEur(forecast.expenses.other).toFixed(2)}\n`;
    csv += `Fixed Costs,BGN ${forecast.expenses.fixed.toFixed(2)},€${bgnToEur(forecast.expenses.fixed).toFixed(2)}\n`;
    csv += `Total Expenses,BGN ${forecast.expenses.total.toFixed(2)},€${bgnToEur(forecast.expenses.total).toFixed(2)}\n`;
    csv += `Projected Profit,BGN ${forecast.profit.projected.toFixed(2)},€${bgnToEur(forecast.profit.projected).toFixed(2)}\n`;
    csv += `Profit Margin,${forecast.profit.margin.toFixed(2)}%\n\n`;
    
    csv += 'Historical Data Summary\n';
    csv += `Based on ${historicalData.sampleSize} days of data\n`;
    csv += `Average Daily Revenue,BGN ${historicalData.averages.avgDailyRevenue.toFixed(2)}\n`;
    csv += `Average Daily Expenses,BGN ${historicalData.averages.avgDailyExpenses.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bar-national-forecast-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.forecastingDashboard}>
      <h2 className={styles.formTitle}>🔮 Financial Forecasting & P&L Projections</h2>
      
      <div className={styles.forecastControls}>
        <div className={styles.forecastInputs}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Fixed Costs (Monthly)</label>
            <input
              type="number"
              value={inputs.fixedCosts}
              onChange={(e) => handleInputChange('fixedCosts', e.target.value)}
              className={styles.input}
              placeholder="2000"
            />
            <small className={styles.inputHelp}>Rent, utilities, insurance, etc.</small>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>COGS Percentage</label>
            <input
              type="number"
              value={inputs.cogsPercentage}
              onChange={(e) => handleInputChange('cogsPercentage', e.target.value)}
              className={styles.input}
              min="0"
              max="100"
              step="0.1"
            />
            <small className={styles.inputHelp}>Cost of goods sold as % of revenue</small>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Personnel Multiplier</label>
            <input
              type="number"
              value={inputs.personnelMultiplier}
              onChange={(e) => handleInputChange('personnelMultiplier', e.target.value)}
              className={styles.input}
              min="0"
              step="0.1"
            />
            <small className={styles.inputHelp}>1.0 = same as last month, 1.2 = 20% increase</small>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Revenue Multiplier</label>
            <input
              type="number"
              value={inputs.revenueMultiplier}
              onChange={(e) => handleInputChange('revenueMultiplier', e.target.value)}
              className={styles.input}
              min="0"
              step="0.1"
            />
            <small className={styles.inputHelp}>1.0 = same as last month, 1.1 = 10% increase</small>
          </div>
        </div>

        <button 
          onClick={calculateForecast} 
          className={styles.forecastButton}
          disabled={loading}
        >
          {loading ? '🔄 Calculating...' : '🔮 Calculate Forecast'}
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {forecastData && (
        <div className={styles.forecastResults}>
          <div className={styles.forecastHeader}>
            <h3>📊 Monthly Forecast Results</h3>
            <button onClick={exportForecast} className={styles.exportButton}>
              📥 Export Forecast
            </button>
          </div>

          {/* Revenue Projections */}
          <div className={styles.forecastSection}>
            <h4>💰 Revenue Projections</h4>
            <div className={styles.forecastCards}>
              <div className={styles.forecastCard}>
                <div className={styles.cardLabel}>Monthly Revenue</div>
                <div className={styles.cardValue}>
                  {formatCurrency(forecastData.forecast.revenue.projected)}
                </div>
                <div className={styles.cardSubtext}>
                  Daily: {formatCurrency(forecastData.forecast.revenue.daily)}
                </div>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className={styles.forecastSection}>
            <h4>💸 Expense Breakdown</h4>
            <div className={styles.forecastCards}>
              <div className={styles.forecastCard}>
                <div className={styles.cardLabel}>COGS ({forecastData.forecast.assumptions.cogsPercentage}%)</div>
                <div className={styles.cardValue}>
                  {formatCurrency(forecastData.forecast.expenses.cogs)}
                </div>
              </div>
              <div className={styles.forecastCard}>
                <div className={styles.cardLabel}>Personnel</div>
                <div className={styles.cardValue}>
                  {formatCurrency(forecastData.forecast.expenses.personnel)}
                </div>
              </div>
              <div className={styles.forecastCard}>
                <div className={styles.cardLabel}>Other Expenses</div>
                <div className={styles.cardValue}>
                  {formatCurrency(forecastData.forecast.expenses.other)}
                </div>
              </div>
              <div className={styles.forecastCard}>
                <div className={styles.cardLabel}>Fixed Costs</div>
                <div className={styles.cardValue}>
                  {formatCurrency(forecastData.forecast.expenses.fixed)}
                </div>
              </div>
              <div className={`${styles.forecastCard} ${styles.totalCard}`}>
                <div className={styles.cardLabel}>Total Expenses</div>
                <div className={styles.cardValue}>
                  {formatCurrency(forecastData.forecast.expenses.total)}
                </div>
              </div>
            </div>
          </div>

          {/* Profit Projections */}
          <div className={styles.forecastSection}>
            <h4>📈 Profit Projections</h4>
            <div className={styles.forecastCards}>
              <div className={`${styles.forecastCard} ${forecastData.forecast.profit.projected >= 0 ? styles.profitCard : styles.lossCard}`}>
                <div className={styles.cardLabel}>Projected Profit</div>
                <div className={styles.cardValue}>
                  {formatCurrency(forecastData.forecast.profit.projected)}
                </div>
                <div className={styles.cardSubtext}>
                  Margin: {forecastData.forecast.profit.margin.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div className={styles.forecastSection}>
            <h4>📋 Forecast Assumptions</h4>
            <div className={styles.assumptionsList}>
              <div className={styles.assumptionItem}>
                <span className={styles.assumptionLabel}>Based on:</span>
                <span className={styles.assumptionValue}>
                  {forecastData.historicalData.sampleSize} days of historical data
                </span>
              </div>
              <div className={styles.assumptionItem}>
                <span className={styles.assumptionLabel}>Days in month:</span>
                <span className={styles.assumptionValue}>
                  {forecastData.forecast.assumptions.daysInMonth}
                </span>
              </div>
              <div className={styles.assumptionItem}>
                <span className={styles.assumptionLabel}>Personnel multiplier:</span>
                <span className={styles.assumptionValue}>
                  {forecastData.forecast.assumptions.personnelMultiplier}x
                </span>
              </div>
              <div className={styles.assumptionItem}>
                <span className={styles.assumptionLabel}>Revenue multiplier:</span>
                <span className={styles.assumptionValue}>
                  {forecastData.forecast.assumptions.revenueMultiplier}x
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
