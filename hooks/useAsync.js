import { useState, useCallback } from 'react';

// Replaces ad-hoc loading/error state in every component.
// Usage: const { loading, error, run } = useAsync();
//        run(async () => { await someCall(); })
export const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const run = useCallback(async (asyncFn) => {
    setLoading(true); setError(null);
    try { return await asyncFn(); }
    catch (err) { setError(err.message ?? 'Ocurrió un error inesperado'); return null; }
    finally { setLoading(false); }
  }, []);

  return { loading, error, run, clearError: () => setError(null) };
};
