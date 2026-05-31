import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import { useStats } from '../hooks/useData';
import { useI18n } from '../context/I18nContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CHART_COLORS = ['#f5a623', '#60a5fa', '#4ade80', '#f87171', '#c084fc'];

const StatCard = ({ label, value, sub, color = '' }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className={`stat-value ${color}`}>{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { stats, loading } = useStats(30000);
  const navigate = useNavigate();
  const { t, locale } = useI18n();

  const formatMoney = (n) => `${t('common.egp')} ${(n || 0).toLocaleString(locale)}`;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const today = stats?.today || {};
  const allTime = stats?.allTime || {};
  const charts = stats?.charts || {};
  const byMethod = stats?.byMethod || [];

  const barData = {
    labels: (charts.last7Days || []).map((d) => d._id?.slice(5) || ''),
    datasets: [{
      label: t('dashboard.transfers'),
      data: (charts.last7Days || []).map((d) => d.count),
      backgroundColor: 'rgba(245,166,35,0.6)',
      borderRadius: 4,
    }],
  };

  const doughnutData = {
    labels: byMethod.map((m) => m._id),
    datasets: [{
      data: byMethod.map((m) => m.count),
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#505560', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#505560', font: { size: 10 } } },
    },
  };

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '70%',
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('dashboard.title')}</div>
          <div className="page-subtitle">{t('dashboard.subtitle')}</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/upload')}>
          {t('dashboard.uploadBtn')}
        </button>
      </div>

      <div className="summary-hero">
        <div className="summary-card today">
          <div className="summary-card-label">{t('dashboard.todayTotal')}</div>
          <div className="summary-card-amount">{formatMoney(today.amount)}</div>
          <div className="summary-card-meta">
            <span>{t('dashboard.transfers')}: <strong>{today.transfers || 0}</strong></span>
            <span>{t('dashboard.pending')}: <strong>{today.pending || 0}</strong></span>
            <span>{t('dashboard.duplicate')}: <strong>{today.duplicates || 0}</strong></span>
          </div>
        </div>
        <div className="summary-card alltime">
          <div className="summary-card-label">{t('dashboard.allTimeTotal')}</div>
          <div className="summary-card-amount">{formatMoney(allTime.amount)}</div>
          <div className="summary-card-meta">
            <span>{t('dashboard.allTransfers')}: <strong>{allTime.transfers || 0}</strong></span>
            <span>{t('dashboard.verified')}: <strong>{allTime.verified || 0}</strong></span>
            <span>{t('dashboard.pending')}: <strong>{allTime.pending || 0}</strong></span>
          </div>
        </div>
      </div>

      <section className="stats-section">
        <div className="stats-section-header">
          <span className="stats-section-title">{t('dashboard.todayDetails')}</span>
          <span className="stats-section-badge live">{t('dashboard.live')}</span>
        </div>
        <div className="stat-grid">
          <StatCard label={t('dashboard.todayTransfers')} value={today.transfers || 0} sub={t('dashboard.processed')} color="amber" />
          <StatCard label={t('dashboard.todayAmount')} value={formatMoney(today.amount)} sub={t('dashboard.verifiedOnly')} color="green" />
          <StatCard label={t('dashboard.pending')} value={today.pending || 0} sub={t('dashboard.awaitingAction')} color="amber" />
          <StatCard label={t('dashboard.duplicate')} value={today.duplicates || 0} sub={t('dashboard.todayDetails')} color="red" />
          <StatCard label={t('dashboard.failedOcr')} value={today.failedOcr || 0} sub={t('dashboard.needsReview')} />
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-section-header">
          <span className="stats-section-title">{t('dashboard.allTimeDetails')}</span>
          <span className="stats-section-badge">{t('dashboard.sinceStart')}</span>
        </div>
        <div className="stat-grid">
          <StatCard label={t('dashboard.allTransfers')} value={allTime.transfers || 0} sub={t('dashboard.totalRecords')} color="blue" />
          <StatCard label={t('dashboard.todayAmount')} value={formatMoney(allTime.amount)} sub={t('dashboard.verifiedOnly')} color="green" />
          <StatCard label={t('dashboard.verified')} value={allTime.verified || 0} sub="verified" color="green" />
          <StatCard label={t('dashboard.pending')} value={allTime.pending || 0} sub={t('dashboard.awaitingAction')} color="amber" />
          <StatCard label={t('dashboard.duplicate')} value={allTime.duplicates || 0} sub={t('dashboard.allTimeDetails')} color="red" />
          <StatCard label={t('dashboard.failedOcr')} value={allTime.failedOcr || 0} sub={t('dashboard.needsReview')} />
        </div>
      </section>

      <div className="dashboard-charts">
        <div className="card">
          <div className="section-title">{t('dashboard.activity7')}</div>
          <div className="chart-box">
            <Bar data={barData} options={chartOpts} />
          </div>
        </div>

        <div className="card">
          <div className="section-title">{t('dashboard.paymentMethods')}</div>
          <div className="chart-box-sm">
            <Doughnut data={doughnutData} options={doughnutOpts} />
          </div>
          <div className="method-legend">
            {byMethod.slice(0, 5).map((m, i) => (
              <div key={m._id} className="method-legend-item">
                <div className="method-legend-left">
                  <div className="method-dot" style={{ background: CHART_COLORS[i] }} />
                  <span className="method-name">{m._id}</span>
                </div>
                <span className="method-stats">
                  {m.count} · {formatMoney(m.total || m.totalAmount || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('dashboard.monthlyIncome')}</div>
        <div className="chart-box">
          <Bar
            data={{
              labels: (charts.last30Days || []).map((d) => d._id?.slice(5) || ''),
              datasets: [{
                label: t('dashboard.amountLabel'),
                data: (charts.last30Days || []).map((d) => d.amount),
                backgroundColor: 'rgba(96,165,250,0.5)',
                borderRadius: 3,
              }],
            }}
            options={chartOpts}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
