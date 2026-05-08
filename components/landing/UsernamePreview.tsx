'use client';

import { useState } from 'react';
import { TeaserCard } from './TeaserCard';

export function UsernamePreview() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/preview-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.replace('@', '').trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong. Try again.'); return; }
      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="@yourhandle"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: 200, height: 44, padding: '0 16px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, color: 'white', fontSize: 14, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
        />
        <button
          type="submit"
          disabled={loading || !username.trim()}
          style={{
            height: 44, padding: '0 20px',
            background: loading || !username.trim() ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.3)',
            border: '1px solid rgba(139,92,246,0.4)', borderRadius: 10,
            color: loading || !username.trim() ? 'rgba(255,255,255,0.3)' : 'white',
            fontSize: 14, fontWeight: 600,
            cursor: loading || !username.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
              Analysing...
            </span>
          ) : 'Analyse free →'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {result && <TeaserCard {...result} />}
    </div>
  );
}
