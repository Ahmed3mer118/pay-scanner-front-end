import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTransfer } from '../hooks/useData';
import { transfersAPI } from '../services/api';
import { useI18n } from '../context/I18nContext';

const Field = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: '12.5px', color: 'var(--text2)' }}>{label}</span>
    <span style={{ fontSize: '13px', fontFamily: mono ? 'var(--mono)' : undefined, fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

const ValidationRow = ({ label, passed, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12.5px' }}>
    <span style={{ color: 'var(--text2)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {value && <span style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: '11px' }}>{value}</span>}
      <span style={{ color: passed ? 'var(--green)' : 'var(--red)', fontSize: '13px' }}>
        {passed ? '✓' : '✗'}
      </span>
    </div>
  </div>
);

const TL = ({ time, text, icon }) => (
  <div style={{ display: 'flex', gap: '10px', paddingBottom: '12px' }}>
    <div style={{
      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
      background: 'rgba(245,166,35,0.1)', border: '1px solid var(--amber-dim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px'
    }}>{icon}</div>
    <div style={{ paddingTop: '2px' }}>
      <div style={{ fontSize: '12.5px' }}>{text}</div>
      <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{time}</div>
    </div>
  </div>
);

const TransferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transfer, loading } = useTransfer(id);
  const { t, locale } = useI18n();
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      await transfersAPI.updateStatus(id, { status });
      toast.success(t('detail.statusUpdated', { status: t(`transfers.statuses.${status}`) }));
      window.location.reload();
    } catch {
      toast.error(t('detail.updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!transfer) return <div className="page"><div className="page-title">{t('detail.notFound')}</div></div>;

  const ai = transfer.aiValidation || {};
  const created = new Date(transfer.createdAt);
  const timeFmt = (d) => d.toLocaleTimeString(locale);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="btn btn-sm" onClick={() => navigate('/transfers')} style={{ marginBottom: '8px' }}>
            {t('detail.back')}
          </button>
          <div className="page-title">/ {transfer.transactionId || transfer._id?.slice(-8)}</div>
          <div className="page-subtitle">{transfer.paymentMethod} · {created.toLocaleString(locale)}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {transfer.status !== 'verified' && (
            <button className="btn btn-success" disabled={updating} onClick={() => handleStatus('verified')}>{t('detail.verify')}</button>
          )}
          {transfer.status !== 'suspicious' && (
            <button className="btn btn-danger" disabled={updating} onClick={() => handleStatus('suspicious')}>{t('detail.flag')}</button>
          )}
        </div>
      </div>

      {transfer.imageUrl && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="section-title">{t('detail.screenshot')}</div>
          <a href={transfer.imageUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
            <img
              src={transfer.imageUrl}
              alt="Transfer screenshot"
              style={{
                width: '100%',
                maxHeight: '480px',
                objectFit: 'contain',
                borderRadius: '8px',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
              }}
            />
          </a>
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {t('detail.clickFullSize')}
          </div>
        </div>
      )}

      <div className="detail-grid">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(245,166,35,0.1)', border: '1px solid var(--amber-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700, color: 'var(--amber)' }}>
              {transfer.senderName?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{transfer.senderName || 'Unknown'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{transfer.senderPhone || ''}</div>
            </div>
            <span className={`badge ${transfer.status}`} style={{ marginInlineStart: 'auto' }}>{t(`transfers.statuses.${transfer.status}`) || transfer.status?.replace('_', ' ')}</span>
          </div>
          <Field label={t('detail.amount')} value={`${t('common.egp')} ${(transfer.amount || 0).toLocaleString(locale)}`} />
          <Field label={t('detail.paymentMethod')} value={transfer.paymentMethod} />
          <Field label={t('detail.transactionId')} value={transfer.transactionId} mono />
          <Field label={t('detail.transferDate')} value={transfer.transferDate ? new Date(transfer.transferDate).toLocaleString(locale) : '—'} />
          <Field label={t('detail.senderPhone')} value={transfer.senderPhone} mono />
          <Field label={t('detail.receiverName')} value={transfer.receiverName} />
          <Field label={t('detail.receiverPhone')} value={transfer.receiverPhone} mono />
          <Field label={t('detail.source')} value={transfer.source} />
          <Field label={t('detail.sheetsSynced')} value={transfer.sheetsSynced ? t('detail.syncedRow', { row: transfer.sheetsRowIndex }) : t('detail.notSynced')} />
        </div>

        <div>
          <div className="card" style={{ marginBottom: '12px' }}>
            <div className="section-title">{t('detail.aiValidation')}</div>
            <ValidationRow label={t('detail.duplicateHash')} passed={ai.duplicateHash} />
            <ValidationRow label={t('detail.duplicateTxn')} passed={ai.duplicateTransactionId} />
            <ValidationRow label={t('detail.amountValid')} passed={ai.amountValid} />
            <ValidationRow label={t('detail.phoneValid')} passed={ai.phoneValid} />
            <ValidationRow label={t('detail.tampering')} passed={!ai.tamperingDetected} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text2)' }}>{t('detail.overallConfidence')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '100px', height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${ai.overallScore || 0}%`, height: '100%', background: ai.overallScore > 70 ? 'var(--green)' : 'var(--amber)', borderRadius: '3px' }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: ai.overallScore > 70 ? 'var(--green)' : 'var(--amber)' }}>{ai.overallScore || 0}%</span>
              </div>
            </div>
            <ValidationRow label={t('detail.ocrConfidence')} passed={transfer.ocrConfidence > 60} value={`${transfer.ocrConfidence || 0}%`} />
          </div>

          <div className="card">
            <div className="section-title">{t('detail.auditTrail')}</div>
            <TL icon="◈" time={timeFmt(created)} text={t('detail.received')} />
            <TL icon="⌕" time={timeFmt(created)} text={t('detail.ocrDone', { pct: transfer.ocrConfidence || 0 })} />
            <TL icon="⚡" time={timeFmt(created)} text={t('detail.aiDone')} />
            <TL icon="⬡" time={timeFmt(created)} text={`${t('detail.savedMongo')}${transfer.sheetsSynced ? t('detail.savedSheets') : ''}`} />
            {transfer.verifiedAt && (
              <TL icon="✓" time={timeFmt(new Date(transfer.verifiedAt))} text={t('detail.verifiedByAdmin')} />
            )}
          </div>
        </div>
      </div>

      {transfer.ocrRawText && (
        <div className="card">
          <div className="section-title">{t('detail.rawOcr')}</div>
          <pre style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: '1.8', background: 'var(--bg3)', padding: '12px', borderRadius: '6px', margin: 0 }}>
            {transfer.ocrRawText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TransferDetail;
