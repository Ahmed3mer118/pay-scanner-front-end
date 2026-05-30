import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTransfer } from '../hooks/useData';
import { transfersAPI } from '../services/api';

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
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      await transfersAPI.updateStatus(id, { status });
      toast.success(`Status updated to ${status}`);
      window.location.reload();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!transfer) return <div className="page"><div className="page-title">Transfer not found</div></div>;

  const ai = transfer.aiValidation || {};
  const created = new Date(transfer.createdAt);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="btn btn-sm" onClick={() => navigate('/transfers')} style={{ marginBottom: '8px' }}>
            ← Back
          </button>
          <div className="page-title">/ {transfer.transactionId || transfer._id?.slice(-8)}</div>
          <div className="page-subtitle">{transfer.paymentMethod} · {created.toLocaleString('en-EG')}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {transfer.status !== 'verified' && (
            <button className="btn btn-success" disabled={updating} onClick={() => handleStatus('verified')}>✓ Verify</button>
          )}
          {transfer.status !== 'suspicious' && (
            <button className="btn btn-danger" disabled={updating} onClick={() => handleStatus('suspicious')}>! Flag</button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Transfer Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(245,166,35,0.1)', border: '1px solid var(--amber-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700, color: 'var(--amber)' }}>
              {transfer.senderName?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{transfer.senderName || 'Unknown'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{transfer.senderPhone || ''}</div>
            </div>
            <span className={`badge ${transfer.status}`} style={{ marginLeft: 'auto' }}>{transfer.status?.replace('_', ' ')}</span>
          </div>
          <Field label="Amount" value={`EGP ${(transfer.amount || 0).toLocaleString()}`} />
          <Field label="Payment method" value={transfer.paymentMethod} />
          <Field label="Transaction ID" value={transfer.transactionId} mono />
          <Field label="Transfer date" value={transfer.transferDate ? new Date(transfer.transferDate).toLocaleString('en-EG') : '—'} />
          <Field label="Sender phone" value={transfer.senderPhone} mono />
          <Field label="Receiver name" value={transfer.receiverName} />
          <Field label="Receiver phone" value={transfer.receiverPhone} mono />
          <Field label="Source" value={transfer.source} />
          <Field label="Google Sheets synced" value={transfer.sheetsSynced ? `✓ Row ${transfer.sheetsRowIndex}` : 'Not synced'} />
        </div>

        {/* AI Validation */}
        <div>
          <div className="card" style={{ marginBottom: '12px' }}>
            <div className="section-title">AI validation</div>
            <ValidationRow label="Duplicate image hash" passed={ai.duplicateHash} />
            <ValidationRow label="Duplicate transaction ID" passed={ai.duplicateTransactionId} />
            <ValidationRow label="Amount valid" passed={ai.amountValid} />
            <ValidationRow label="Phone number format" passed={ai.phoneValid} />
            <ValidationRow label="Tampering detected" passed={!ai.tamperingDetected} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text2)' }}>Overall confidence</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '100px', height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${ai.overallScore || 0}%`, height: '100%', background: ai.overallScore > 70 ? 'var(--green)' : 'var(--amber)', borderRadius: '3px' }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: ai.overallScore > 70 ? 'var(--green)' : 'var(--amber)' }}>{ai.overallScore || 0}%</span>
              </div>
            </div>
            <ValidationRow label="OCR confidence" passed={transfer.ocrConfidence > 60} value={`${transfer.ocrConfidence || 0}%`} />
          </div>

          {/* Audit trail */}
          <div className="card">
            <div className="section-title">audit trail</div>
            <TL icon="◈" time={created.toLocaleTimeString('en-EG')} text="Screenshot received & saved" />
            <TL icon="⌕" time={created.toLocaleTimeString('en-EG')} text={`OCR completed — ${transfer.ocrConfidence}% confidence`} />
            <TL icon="⚡" time={created.toLocaleTimeString('en-EG')} text="AI parsing & validation complete" />
            <TL icon="⬡" time={created.toLocaleTimeString('en-EG')} text={`Saved to MongoDB${transfer.sheetsSynced ? ' + Google Sheets' : ''}`} />
            {transfer.verifiedAt && (
              <TL icon="✓" time={new Date(transfer.verifiedAt).toLocaleTimeString('en-EG')} text="Marked as verified by admin" />
            )}
          </div>
        </div>
      </div>

      {/* OCR Raw Text */}
      {transfer.ocrRawText && (
        <div className="card">
          <div className="section-title">raw OCR output</div>
          <pre style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: '1.8', background: 'var(--bg3)', padding: '12px', borderRadius: '6px', margin: 0 }}>
            {transfer.ocrRawText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TransferDetail;
