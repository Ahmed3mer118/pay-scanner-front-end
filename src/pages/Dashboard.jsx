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

const formatMoney = (n) => `EGP ${(n || 0).toLocaleString('ar-EG')}`;

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

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const today = stats?.today || {};
  const allTime = stats?.allTime || {};
  const charts = stats?.charts || {};
  const byMethod = stats?.byMethod || [];

  const barData = {
    labels: (charts.last7Days || []).map((d) => d._id?.slice(5) || ''),
    datasets: [{
      label: 'التحويلات',
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
          <div className="page-title">/ لوحة التحكم</div>
          <div className="page-subtitle">نظرة عامة · تحديث تلقائي كل 30 ثانية</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/upload')}>
          + رفع لقطة شاشة
        </button>
      </div>

      {/* Hero summary — today vs all time */}
      <div className="summary-hero">
        <div className="summary-card today">
          <div className="summary-card-label">إجمالي اليوم — مبالغ مؤكدة</div>
          <div className="summary-card-amount">{formatMoney(today.amount)}</div>
          <div className="summary-card-meta">
            <span>تحويلات: <strong>{today.transfers || 0}</strong></span>
            <span>قيد المراجعة: <strong>{today.pending || 0}</strong></span>
            <span>مكرر: <strong>{today.duplicates || 0}</strong></span>
          </div>
        </div>
        <div className="summary-card alltime">
          <div className="summary-card-label">الإجمالي الكلي — مبالغ مؤكدة</div>
          <div className="summary-card-amount">{formatMoney(allTime.amount)}</div>
          <div className="summary-card-meta">
            <span>كل التحويلات: <strong>{allTime.transfers || 0}</strong></span>
            <span>مؤكدة: <strong>{allTime.verified || 0}</strong></span>
            <span>قيد المراجعة: <strong>{allTime.pending || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Today details */}
      <section className="stats-section">
        <div className="stats-section-header">
          <span className="stats-section-title">تفاصيل اليوم</span>
          <span className="stats-section-badge live">● مباشر</span>
        </div>
        <div className="stat-grid">
          <StatCard label="تحويلات اليوم" value={today.transfers || 0} sub="لقطات تمت معالجتها" color="amber" />
          <StatCard label="مبالغ اليوم" value={formatMoney(today.amount)} sub="المؤكدة فقط" color="green" />
          <StatCard label="قيد المراجعة" value={today.pending || 0} sub="بانتظار الإجراء" color="amber" />
          <StatCard label="مكرر" value={today.duplicates || 0} sub="اليوم" color="red" />
          <StatCard label="فشل OCR" value={today.failedOcr || 0} sub="يحتاج مراجعة يدوية" />
        </div>
      </section>

      {/* All time details */}
      <section className="stats-section">
        <div className="stats-section-header">
          <span className="stats-section-title">الإجمالي الكلي</span>
          <span className="stats-section-badge">منذ البداية</span>
        </div>
        <div className="stat-grid">
          <StatCard label="كل التحويلات" value={allTime.transfers || 0} sub="إجمالي السجلات" color="blue" />
          <StatCard label="إجمالي المبالغ" value={formatMoney(allTime.amount)} sub="المؤكدة فقط" color="green" />
          <StatCard label="مؤكدة" value={allTime.verified || 0} sub="تحويلات verified" color="green" />
          <StatCard label="قيد المراجعة" value={allTime.pending || 0} sub="بانتظار الإجراء" color="amber" />
          <StatCard label="مكرر" value={allTime.duplicates || 0} sub="إجمالي المكرر" color="red" />
          <StatCard label="فشل OCR" value={allTime.failedOcr || 0} sub="إجمالي الفاشلة" />
        </div>
      </section>

      <div className="dashboard-charts">
        <div className="card">
          <div className="section-title">نشاط آخر 7 أيام</div>
          <div className="chart-box">
            <Bar data={barData} options={chartOpts} aria-label="رسم بياني لعدد التحويلات خلال 7 أيام" />
          </div>
        </div>

        <div className="card">
          <div className="section-title">طرق الدفع</div>
          <div className="chart-box-sm">
            <Doughnut data={doughnutData} options={doughnutOpts} aria-label="توزيع طرق الدفع" />
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
        <div className="section-title">الدخل الشهري — آخر 30 يوم</div>
        <div className="chart-box">
          <Bar
            data={{
              labels: (charts.last30Days || []).map((d) => d._id?.slice(5) || ''),
              datasets: [{
                label: 'المبلغ (EGP)',
                data: (charts.last30Days || []).map((d) => d.amount),
                backgroundColor: 'rgba(96,165,250,0.5)',
                borderRadius: 3,
              }],
            }}
            options={chartOpts}
            aria-label="رسم بياني للدخل خلال 30 يوم"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
