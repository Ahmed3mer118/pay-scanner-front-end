import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import { useStats } from '../hooks/useData';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CHART_COLORS = ['#f5a623', '#60a5fa', '#4ade80', '#f87171', '#c084fc'];

const Dashboard = () => {
  const { stats, loading } = useStats(30000);
  const navigate = useNavigate();

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const today = stats?.today || {};
  const charts = stats?.charts || {};
  const byMethod = stats?.byMethod || [];

  const barData = {
    labels: (charts.last7Days || []).map((d) => d._id?.slice(5) || ''),
    datasets: [{
      label: 'Transfers',
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

  const chartOpts = (dark = true) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#505560', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#505560', font: { size: 10 } } },
    },
  });

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
          <div className="page-title">/ dashboard</div>
          <div className="page-subtitle">Live overview · Auto-refreshes every 30s</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          + Upload Screenshot
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Today's transfers</div>
          <div className="stat-value amber">{today.transfers || 0}</div>
          <div className="stat-sub">Screenshots processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Money received</div>
          <div className="stat-value green">EGP {(today.amount || 0).toLocaleString()}</div>
          <div className="stat-sub">Verified only</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending review</div>
          <div className="stat-value amber">{today.pending || 0}</div>
          <div className="stat-sub">Awaiting action</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Duplicates blocked</div>
          <div className="stat-value red">{today.duplicates || 0}</div>
          <div className="stat-sub">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">OCR failures</div>
          <div className="stat-value">{today.failedOcr || 0}</div>
          <div className="stat-sub">Manual review needed</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <div className="section-title">7-day transfer activity</div>
          <div style={{ height: '200px' }}>
            <Bar
              data={barData}
              options={chartOpts()}
              aria-label="Bar chart showing daily transfer counts over 7 days"
            />
          </div>
        </div>

        <div className="card">
          <div className="section-title">payment methods</div>
          <div style={{ height: '140px', marginBottom: '16px' }}>
            <Doughnut
              data={doughnutData}
              options={doughnutOpts}
              aria-label="Doughnut chart of payment method distribution"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {byMethod.slice(0, 5).map((m, i) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: CHART_COLORS[i] }} />
                  <span style={{ color: 'var(--text2)' }}>{m._id}</span>
                </div>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: '11px' }}>
                  {m.count} · EGP {(m.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">monthly income — last 30 days</div>
        <div style={{ height: '180px' }}>
          <Bar
            data={{
              labels: (charts.last30Days || []).map((d) => d._id?.slice(5) || ''),
              datasets: [{
                label: 'Amount (EGP)',
                data: (charts.last30Days || []).map((d) => d.amount),
                backgroundColor: 'rgba(96,165,250,0.5)',
                borderRadius: 3,
              }],
            }}
            options={chartOpts()}
            aria-label="Bar chart of monthly income over 30 days"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
