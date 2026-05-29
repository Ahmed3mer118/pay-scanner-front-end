import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTransfers } from '../hooks/useData';
import { transfersAPI } from '../services/api';

const STATUSES = ['all', 'verified', 'pending', 'duplicate', 'suspicious', 'failed_ocr'];
const METHODS = ['', 'InstaPay', 'Vodafone Cash', 'Etisalat Cash', 'Orange Cash', 'Bank Transfer'];

const StatusBadge = ({ status }) => (
  <span className={`badge ${status}`}>{status?.replace('_', ' ')}</span>
);

const Transfers = () => {
  const navigate = useNavigate();
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
      toast.success(`Marked as ${status}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleBulkVerify = async () => {
    if (!selected.length) return;
    try {
      await transfersAPI.bulkVerify(selected);
      toast.success(`${selected.length} transfers verified`);
      setSelected([]);
      refetch();
    } catch {
      toast.error('Bulk verify failed');
    }
  };

  const toggleSelect = (id) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">/ transfers</div>
          <div className="page-subtitle">
            {pagination.total || 0} total records
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selected.length > 0 && (
            <button className="btn btn-success" onClick={handleBulkVerify}>
              ✓ Verify {selected.length} selected
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            + Upload
          </button>
        </div>
      </div>

      {/* Filters */}
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
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <select className="input" style={{ width: 'auto' }} value={filters.method} onChange={(e) => updateFilter('method', e.target.value)}>
          <option value="">All methods</option>
          {METHODS.filter(Boolean).map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '14px' }}>⌕</span>
        <input
          className="input"
          style={{ paddingLeft: '32px' }}
          placeholder="Search by sender name, phone, or transaction ID..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : transfers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '13px' }}>
            No transfers found
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '36px' }}></th>
                  <th>Sender</th>
                  <th>Phone / Txn ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t._id} onClick={() => navigate(`/transfers/${t._id}`)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(t._id)}
                        onChange={() => toggleSelect(t._id)}
                        style={{ accentColor: 'var(--amber)' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.senderName || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{t.receiverName || ''}</div>
                    </td>
                    <td className="mono">
                      <div>{t.senderPhone || '—'}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text3)' }}>{t.transactionId || ''}</div>
                    </td>
                    <td className="amount">EGP {(t.amount || 0).toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: '11.5px', padding: '3px 7px', borderRadius: '4px', background: 'var(--bg3)', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '11.5px', color: 'var(--text3)' }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-EG') : '—'}
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {t.status !== 'verified' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(t._id, 'verified')}>✓</button>
                        )}
                        {t.status !== 'suspicious' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(t._id, 'suspicious')}>!</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
