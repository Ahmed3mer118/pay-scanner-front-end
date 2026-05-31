import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { transfersAPI } from '../services/api';
import { useI18n } from '../context/I18nContext';

const Upload = () => {
  const navigate = useNavigate();
  const { t, locale, isRtl } = useI18n();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast.error(t('upload.invalidFile'));
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      const { data } = await transfersAPI.upload(fd, setProgress);
      setProgress(100);

      const normalized = {
        ...data,
        transferId: data.transferId || data.duplicateOf,
      };
      setResult(normalized);

      if (data.status === 'duplicate') {
        toast(t('upload.duplicateSaved'), { icon: '🔁' });
      } else if (data.success) {
        toast.success(t('upload.success'));
      } else {
        toast.error(data.message || t('upload.failed'));
      }
    } catch (err) {
      const msg = err.code === 'ECONNABORTED'
        ? t('upload.timeout')
        : err.response?.data?.error
          || err.response?.data?.details?.join?.(', ')
          || err.message
          || t('upload.uploadFailed');
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setProgress(0); };

  const progressLabel = progress < 45 ? t('upload.uploading') : t('upload.analyzing');

  return (
    <div className="page" style={{ maxWidth: '700px' }}>
      <div className="page-header">
        <div>
          <div className="page-title">{t('upload.title')}</div>
          <div className="page-subtitle">{t('upload.subtitle')}</div>
        </div>
      </div>

      {!result ? (
        <>
          <div
            className="card"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && inputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragging ? 'var(--amber)' : preview ? 'var(--border)' : 'var(--border2)'}`,
              background: dragging ? 'rgba(245,166,35,0.04)' : 'var(--bg2)',
              cursor: preview ? 'default' : 'pointer',
              minHeight: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '16px',
              transition: 'border-color 0.15s',
            }}
          >
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
            {preview ? (
              <div style={{ textAlign: 'center' }}>
                <img src={preview} alt="Preview" style={{ maxHeight: '280px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{file?.name}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '36px', color: 'var(--text3)' }}>↑</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text2)' }}>{t('upload.dropHint')}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{t('upload.formats')}</div>
              </>
            )}
          </div>

          {uploading && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '6px' }}>
                <span>{progressLabel}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--amber)', borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={!file || uploading} style={{ flex: 1, justifyContent: 'center' }}>
              {uploading ? t('upload.processing') : t('upload.processBtn')}
            </button>
            {file && <button className="btn" onClick={reset}>{t('common.clear')}</button>}
          </div>
        </>
      ) : (
        <div className="card">
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            background: result.status === 'duplicate'
              ? 'rgba(245,166,35,0.08)'
              : result.success
                ? 'rgba(74,222,128,0.08)'
                : 'rgba(248,113,113,0.08)',
            border: `1px solid ${result.status === 'duplicate'
              ? 'rgba(245,166,35,0.2)'
              : result.success
                ? 'rgba(74,222,128,0.2)'
                : 'rgba(248,113,113,0.2)'}`,
          }}>
            <div style={{
              fontSize: '15px',
              fontWeight: 600,
              color: result.status === 'duplicate'
                ? 'var(--amber)'
                : result.success
                  ? 'var(--green)'
                  : 'var(--red)',
              marginBottom: '4px',
            }}>
              {result.status === 'duplicate'
                ? t('upload.duplicateTitle')
                : result.success
                  ? t('upload.successTitle')
                  : `✗ ${result.status?.replace('_', ' ')}`}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{result.message}</div>
          </div>

          {result.transfer && (
            <div>
              {[
                [t('upload.sender'), result.transfer.senderName],
                [t('upload.phone'), result.transfer.senderPhone],
                [t('upload.amount'), `${t('common.egp')} ${(result.transfer.amount || 0).toLocaleString(locale)}`],
                [t('upload.method'), result.transfer.paymentMethod],
                [t('upload.transactionId'), result.transfer.transactionId],
                [t('transfers.status'), result.transfer.status],
                [t('upload.ocrConfidence'), `${result.transfer.ocrConfidence}%`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value || '—'}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {result.transferId && (
              <button className="btn btn-primary" onClick={() => navigate(`/transfers/${result.transferId}`)}>
                {t('common.viewDetails')} {isRtl ? '←' : '→'}
              </button>
            )}
            <button className="btn" onClick={reset}>{t('common.uploadAnother')}</button>
            <button className="btn" onClick={() => navigate('/transfers')}>{t('common.allTransfers')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
