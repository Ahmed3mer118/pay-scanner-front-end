import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTransfers } from '../hooks/useData';
import { transfersAPI } from '../services/api';
import { useI18n } from '../context/I18nContext';

const STATUSES = ['all', 'verified', 'pending', 'duplicate', 'suspicious', 'failed_ocr'];
const METHODS = ['', 'InstaPay', 'Vodafone Cash', 'Etisalat Cash', 'Orange Cash', 'Bank Transfer'];

const StatusBadge = ({ status, t }) => (
  <span className={`badge ${status}`}>{t(`transfers.statuses.${status}`) || status?.replace('_', ' ')}</span>
);

const Transfers = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [filters, setFilters] = useState({ status: 'all', method: '', search: '', page: 1 });
  const [selected, setSelected] = useState([]);

  const queryParams = {
    ...(filters.status !== 'all' && { status: filters.status }),
    ...(filters.method && { method: filters.method }),
    ...(filters.search && { search: filters.search }),
    page: filters.page,
    limit: 20,
  };

  const { transfers, pagination, loading, refetch } = useTransfers(queryParams);

  const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const handleStatusChange = async (id, status) => {
    try {
      await transfersAPI.updateStatus(id, { status });
      toast.success(t('transfers.markedAs', { status: t(`transfers.statuses.${status}`) }));
      refetch();
    } catch {
      toast.error(t('transfers.updateFailed'));
    }
  };

  const handleBulkVerify = async () => {
    if (!selected.length) return;
    try {
      await transfersAPI.bulkVerify(selected);
      toast.success(t('transfers.bulkVerified', { count: selected.length }));
      setSelected([]);
      refetch();
    } catch {
      toast.error(t('transfers.bulkFailed'));
    }
  };

  const toggleSelect = (id) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('transfers.title')}</div>
          <div className="page-subtitle">
            {pagination.total || 0} {t('transfers.totalRecords')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selected.length > 0 && (
            <button className="btn btn-success" onClick={handleBulkVerify}>
              {t('transfers.verifySelected', { count: selected.length })}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            {t('transfers.upload')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateFilter('status', s)}
              style={{
                padding: '5px 12px', borderRadius: '20px', border: '1px solid',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--mono)',
                background: filters.status === s ? 'rgba(245,166,35,0.12)' : 'transparent',
                borderColor: filters.status === s ? 'var(--amber-dim)' : 'var(--border)',
                color: filters.status === s ? 'var(--amber)' : 'var(--text2)',
              }}
            >
              {t(`transfers.statuses.${s}`)}
            </button>
          ))}
        </div>
        <select className="input" style={{ width: 'auto' }} value={filters.method} onChange={(e) => updateFilter('method', e.target.value)}>
          <option value="">{t('transfers.allMethods')}</option>
          {METHODS.filter(Boolean).map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="search-wrap" style={{ position: 'relative', marginBottom: '16px' }}>
        <span className="search-icon">⌕</span>
        <input
          className="input search-input"
          placeholder={t('transfers.searchPlaceholder')}
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : transfers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '13px' }}>
            {t('transfers.noResults')}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '36px' }}></th>
                  <th>{t('transfers.sender')}</th>
                  <th>{t('transfers.phoneTxn')}</th>
                  <th>{t('transfers.amount')}</th>
                  <th>{t('transfers.method')}</th>
                  <th>{t('transfers.date')}</th>
                  <th>{t('transfers.status')}</th>
                  <th>{t('transfers.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((tr) => (
                  <tr key={tr._id} onClick={() => navigate(`/transfers/${tr._id}`)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(tr._id)}
                        onChange={() => toggleSelect(tr._id)}
                        style={{ accentColor: 'var(--amber)' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{tr.senderName || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{tr.receiverName || ''}</div>
                    </td>
                    <td className="mono">
                      <div>{tr.senderPhone || '—'}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text3)' }}>{tr.transactionId || ''}</div>
                    </td>
                    <td className="amount">{t('common.egp')} {(tr.amount || 0).toLocaleString(locale)}</td>
                    <td>
                      <span style={{ fontSize: '11.5px', padding: '3px 7px', borderRadius: '4px', background: 'var(--bg3)', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
                        {tr.paymentMethod}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '11.5px', color: 'var(--text3)' }}>
                      {tr.createdAt ? new Date(tr.createdAt).toLocaleDateString(locale) : '—'}
                    </td>
                    <td><StatusBadge status={tr.status} t={t} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {tr.status !== 'verified' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(tr._id, 'verified')}>✓</button>
                        )}
                        {tr.status !== 'suspicious' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(tr._id, 'suspicious')}>!</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px', borderTop: '1px solid var(--border)' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className="btn btn-sm"
                style={{ background: p === filters.page ? 'rgba(245,166,35,0.12)' : undefined, color: p === filters.page ? 'var(--amber)' : undefined }}
                onClick={() => setFilters((f) => ({ ...f, page: p }))}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfers;
