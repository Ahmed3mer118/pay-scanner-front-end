import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const { t, toggleLang, isRtl } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const NAV = [
    { to: '/dashboard', icon: '⬡', label: t('nav.dashboard') },
    { to: '/transfers', icon: '⇌', label: t('nav.transfers') },
    { to: '/upload', icon: '↑', label: t('nav.upload') },
  ];

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
          aria-label={t('layout.closeMenu')}
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
            aria-label={collapsed ? t('layout.expandMenu') : t('layout.collapseMenu')}
          >
            {collapsed ? (isRtl ? '→' : '←') : (isRtl ? '←' : '→')}
          </button>
          <button
            type="button"
            className="collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label={t('layout.close')}
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
          <button type="button" className="lang-btn" onClick={toggleLang} title={t('layout.langSwitch')}>
            {t('layout.langSwitch')}
          </button>
          <button type="button" className="logout-btn" onClick={logout} title={t('layout.logout')}>⏻</button>
        </div>
      </aside>

      <div className="layout-main">
        <header className="mobile-header mobile-only">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label={t('layout.openMenu')}
          >
            ☰
          </button>
          <span className="mobile-brand">◈ PayScanner</span>
          <button type="button" className="lang-btn lang-btn-mobile" onClick={toggleLang}>
            {t('layout.langSwitch')}
          </button>
        </header>

        <main className="main-content">
          <Outlet />
        </main>

        <nav className="bottom-nav mobile-only" aria-label={t('layout.quickNav')}>
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
