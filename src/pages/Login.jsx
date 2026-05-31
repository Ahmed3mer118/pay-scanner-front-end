import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const { t, toggleLang } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px', position: 'relative' }}>
      <button
        type="button"
        className="lang-btn"
        onClick={toggleLang}
        style={{ position: 'absolute', top: '16px', insetInlineEnd: '16px' }}
      >
        {t('layout.langSwitch')}
      </button>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '28px', color: 'var(--amber)', marginBottom: '6px' }}>◈ PayScanner</div>
          <div style={{ color: 'var(--text3)', fontSize: '13px' }}>{t('login.subtitle')}</div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('login.email')}</label>
              <input
                className="input"
                type="email"
                required
                placeholder="admin@store.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('login.password')}</label>
              <input
                className="input"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {loading ? t('login.signingIn') : `${t('login.signIn')} →`}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {t('login.footer')}
        </div>
      </div>
    </div>
  );
};

export default Login;
