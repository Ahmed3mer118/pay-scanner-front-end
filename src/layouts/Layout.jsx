import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV = [
  { to: '/dashboard', icon: '⬡', label: 'لوحة التحكم' },
  { to: '/transfers', icon: '⇌', label: 'التحويلات' },
  { to: '/upload', icon: '↑', label: 'رفع صورة' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-mark">
            <span className="logo-icon">◈</span>
            {!collapsed && <span className="logo-text">PayScanner</span>}
          </div>
          <button
            type="button"
            className="collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {collapsed ? '→' : '←'}
          </button>
          <button
            type="button"
            className="collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{n.icon}</span>
              {!collapsed && <span className="nav-label">{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
            {!collapsed && (
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            )}
          </div>
          <button type="button" className="logout-btn" onClick={logout} title="تسجيل الخروج">⏻</button>
        </div>
      </aside>

      <div className="layout-main">
        <header className="mobile-header mobile-only">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="فتح القائمة"
          >
            ☰
          </button>
          <span className="mobile-brand">◈ PayScanner</span>
        </header>

        <main className="main-content">
          <Outlet />
        </main>

        <nav className="bottom-nav mobile-only" aria-label="التنقل السريع">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <span className="bottom-nav-icon">{n.icon}</span>
              <span className="bottom-nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
