import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import RevenueChart from '../components/Charts/RevenueChart';
import ProfitChart from '../components/Charts/ProfitChart';
import ExpenseBreakdownChart from '../components/Charts/ExpenseBreakdownChart';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchReports();
  }, [session, status, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/aggregate/${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>🔄</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Bar National P&L Analysis</title>
        <meta name="description" content="Financial Dashboard with Analytics" />
      </Head>
      
      <div className={styles.dashboard}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.headerTitle}>🚀 Bar National Dashboard</h1>
              <p className={styles.headerSubtitle}>P&L Analysis Ultimate Edition</p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>
                  Welcome, {session.user.username}!
                </span>
                <span className={styles.userRole}>
                  {session.user.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
              <button onClick={handleSignOut} className={styles.signOutButton}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <button 
            className={styles.navButton}
            onClick={() => router.push('/')}
          >
            🏠 Back to Main App
          </button>
          <button className={`${styles.navButton} ${styles.activeNavButton}`}>
            📈 Analytics Dashboard
          </button>
        </nav>

        {/* Date Range Selector */}
        <div className={styles.controls}>
          <div className={styles.dateRangeSelector}>
            <label className={styles.controlLabel}>📅 Analysis Period:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.dateSelect}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <button 
            onClick={fetchReports}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Charts Grid */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartRow}>
            <RevenueChart 
              data={reports} 
              title="📈 Daily Revenue Trends"
            />
          </div>
          
          <div className={styles.chartRow}>
            <ProfitChart 
              data={reports} 
              title="💰 Daily Profit/Loss Analysis"
            />
          </div>
          
          <div className={styles.chartRow}>
            <ExpenseBreakdownChart 
              data={reports} 
              title="💸 Expense Breakdown"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className={styles.summaryStats}>
          <h3 className={styles.summaryTitle}>📊 Period Summary</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Revenue</div>
              <div className={styles.statValue}>
                BGN {reports.reduce((sum, r) => sum + (r.revenues?.general || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Expenses</div>
              <div className={styles.statValue}>
                BGN {reports.reduce((sum, r) => sum + (r.summary?.total_expenses || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Net Profit</div>
              <div className={`${styles.statValue} ${
                reports.reduce((sum, r) => sum + (r.summary?.general_turnover || 0), 0) >= 0 
                  ? styles.profitValue 
                  : styles.lossValue
              }`}>
                BGN {reports.reduce((sum, r) => sum + (r.summary?.general_turnover || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Days Analyzed</div>
              <div className={styles.statValue}>
                {reports.length} days
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
