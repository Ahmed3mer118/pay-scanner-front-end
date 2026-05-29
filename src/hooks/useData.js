import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI, transfersAPI } from '../services/api';

export const useStats = (refreshInterval = 30000) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, refreshInterval);
    return () => clearInterval(interval);
  }, [fetch, refreshInterval]);

  return { stats, loading, error, refetch: fetch };
};

export const useTransfers = (params) => {
  const [transfers, setTransfers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await transfersAPI.getAll(params);
      setTransfers(data.transfers);
      setPagination(data.pagination);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { transfers, pagination, loading, error, refetch: fetch };
};

export const useTransfer = (id) => {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    transfersAPI.getOne(id)
      .then(({ data }) => setTransfer(data.transfer))
      .finally(() => setLoading(false));
  }, [id]);

  return { transfer, loading };
};
