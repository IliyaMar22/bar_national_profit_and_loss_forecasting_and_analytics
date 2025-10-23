import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DailyInputForm from '../components/Financial/DailyInputForm';
import CalendarView from '../components/Financial/CalendarView';
import ReportsDashboard from '../components/Financial/ReportsDashboard';
import ForecastingDashboard from '../components/Financial/ForecastingDashboard';
import styles from '../styles/Financial.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>🔄</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Bar National P&L Analysis Ultimate Edition</title>
        <meta name="description" content="Dockerized Financial Management System with Forecasting for Bar National" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.financialContainer}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>🚀 Bar National P&L Analysis Ultimate Edition</h1>
              <p className={styles.subtitle}>Dockerized Financial Management • Daily Reports • P&L Analysis • Forecasting</p>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.welcomeText}>Welcome, {session.user.username}!</span>
              <button 
                onClick={() => router.push('/dashboard')}
                className={styles.dashboardButton}
              >
                📈 Analytics Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'daily' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            📝 Daily Input
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'calendar' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            📅 Calendar
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'reports' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📊 Reports
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'forecast' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('forecast')}
          >
            🔮 Forecasting
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'daily' && <DailyInputForm />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'reports' && <ReportsDashboard />}
          {activeTab === 'forecast' && <ForecastingDashboard />}
        </div>

        <footer style={{ 
          marginTop: '4rem', 
          textAlign: 'center', 
          color: '#daa520',
          opacity: 0.7,
          padding: '2rem'
        }}>
          <p>© 2024 Bar National Financial Management System</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            📞 +359896823923 | 📧 info@barnational.bg
          </p>
        </footer>
      </div>
    </>
  );
}

