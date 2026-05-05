'use client';
import { useState, useEffect, useCallback } from 'react';

const ADMIN_KEY = 'eb_admin_token';

function api(path: string, token: string, opts: RequestInit = {}) {
  return fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', 'x-admin-token': token, ...(opts.headers || {}) } });
}

function StatCard({ label, value, sub, color = '#A855F7' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ borderRadius: 16, padding: '20px 22px', background: '#111118', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
      <div style={{ height: 2, background: color, borderRadius: 99, marginBottom: 14, width: 32 }} />
      <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div style={{ borderRadius: 18, background: '#111118', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 20 }}>
      {title && <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</div>}
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  );
}

function Badge({ children, color = '#A855F7' }: { children: React.ReactNode; color?: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${color}18`, color, border: `1px solid ${color}30`, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{children}</span>;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'dashboard' | 'promos'>('dashboard');
  const [promoForm, setPromoForm] = useState({ code: '', discount_type: 'percent', discount_percent: 0, flat_discount_amount: 0, max_uses: '', expires_at: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editDiscount, setEditDiscount] = useState<number>(0);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY);
    if (saved) { setToken(saved); setAuthed(true); }
  }, []);

  const load = useCallback(async (t: string) => {
    setLoading(true);
    const res = await api('/api/admin/stats', t);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { if (authed && token) load(token); }, [authed, token, load]);

  const login = () => {
    setToken(input);
    sessionStorage.setItem(ADMIN_KEY, input);
    setAuthed(true);
  };

  const createPromo = async () => {
    setSaving(true); setMsg('');
    const res = await api('/api/admin/promos', token, { method: 'POST', body: JSON.stringify({ ...promoForm, max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null, expires_at: promoForm.expires_at || null }) });
    setSaving(false);
    if (res.ok) { setMsg('✅ Promo created!'); load(token); setPromoForm({ code: '', discount_type: 'percent', discount_percent: 0, flat_discount_amount: 0, max_uses: '', expires_at: '' }); }
    else { const e = await res.json(); setMsg('❌ ' + e.error); }
  };

  const togglePromo = async (id: string, is_active: boolean) => {
    await api('/api/admin/promos', token, { method: 'PATCH', body: JSON.stringify({ id, is_active: !is_active }) });
    load(token);
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    await api('/api/admin/promos', token, { method: 'DELETE', body: JSON.stringify({ id }) });
    load(token);
  };

  const saveDiscount = async (id: string) => {
    await api('/api/admin/promos', token, { method: 'PATCH', body: JSON.stringify({ id, discount_percent: editDiscount }) });
    setEditId(null); load(token);
  };

  const base: React.CSSProperties = { minHeight: '100vh', background: '#0a0a10', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: 'white', padding: '0 0 60px' };
  const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const };
  const btn: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#A855F7,#7C3AED)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' };

  if (!authed) {
    return (
      <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 340, background: '#111118', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 32 }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,#FF3E80,#A855F7)', marginBottom: 24, borderRadius: 99 }} />
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>Eyebird Admin</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Restricted access. Enter your admin password.</div>
          <input type="password" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Admin password" style={{ ...inp, marginBottom: 12 }} />
          <button onClick={login} style={{ ...btn, width: '100%' }}>Enter Admin Panel →</button>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading dashboard…</div>
    </div>;
  }

  const { stats, daily, recent, promos, recentPurchases } = data;

  return (
    <div style={base}>
      {/* Topbar */}
      <div style={{ background: 'rgba(10,10,16,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#FF3E80,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>EB</div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Eyebird Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['dashboard', 'promos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: tab === t ? 'rgba(168,85,247,0.15)' : 'transparent', color: tab === t ? '#A855F7' : 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
          ))}
          <button onClick={() => { sessionStorage.removeItem(ADMIN_KEY); setAuthed(false); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', marginLeft: 8 }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '32px auto', padding: '0 28px' }}>

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && <>
          {/* Stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard label="Total Audits" value={stats.total} sub="all time" color="#A855F7" />
            <StatCard label="Unlocked" value={stats.paid} sub={`${stats.conversionRate}% conversion`} color="#22C55E" />
            <StatCard label="This Week" value={stats.thisWeek} sub="new audits" color="#3B82F6" />
            <StatCard label="This Month" value={stats.thisMonth} sub="new audits" color="#F59E0B" />
            <StatCard label="Avg Score" value={`${stats.avgScore}/100`} sub="account health" color="#FF3E80" />
            <StatCard label="Emails Collected" value={stats.totalEmails} sub="unique" color="#22D3EE" />
          </div>

          {/* Daily chart — simple bar viz */}
          <Card title="Audits — Last 14 Days">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {daily.map((d: any) => {
                const maxV = Math.max(...daily.map((x: any) => x.audits), 1);
                const h = Math.max(4, (d.audits / maxV) * 72);
                const hu = Math.max(0, (d.unlocks / maxV) * 72);
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }} title={`${d.date}: ${d.audits} audits, ${d.unlocks} unlocks`}>
                    <div style={{ position: 'relative', width: '100%', height: 72, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', bottom: 0, width: '60%', height: h, background: 'rgba(168,85,247,0.25)', borderRadius: '3px 3px 0 0' }} />
                      {hu > 0 && <div style={{ position: 'absolute', bottom: 0, width: '60%', height: hu, background: '#22C55E', borderRadius: '3px 3px 0 0' }} />}
                    </div>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{d.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(168,85,247,0.4)' }} /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Audits</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#22C55E' }} /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Unlocks</span></div>
            </div>
          </Card>

          {/* Recent audits */}
          <Card title="Recent Audits">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Username', 'Score', 'Followers', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r: any) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'white' }}>@{r.username}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: r.score >= 70 ? '#22C55E' : r.score >= 50 ? '#F59E0B' : '#EF4444' }}>{r.score}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{(r.followers || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 12px' }}><Badge color={r.is_paid ? '#22C55E' : '#F59E0B'}>{r.is_paid ? 'Unlocked' : 'Free'}</Badge></td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent purchases / email list */}
          <Card title="Recent Unlocks & Emails">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Email', 'IG User', 'Amount', 'Promo Used', 'Date'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#22D3EE' }}>{p.email}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.ig_user_id}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: p.amount_paid > 0 ? '#22C55E' : 'rgba(255,255,255,0.35)' }}>{p.amount_paid > 0 ? `₹${p.amount_paid / 100}` : 'Free'}</td>
                      <td style={{ padding: '10px 12px' }}>{p.promo_code ? <Badge color="#A855F7">{p.promo_code}</Badge> : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</span>}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{new Date(p.paid_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>}

        {/* ── PROMOS TAB ── */}
        {tab === 'promos' && <>
          {/* Create form */}
          <Card title="Create New Promo Code">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CODE</label>
                <input value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. BETA50" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TYPE</label>
                <select value={promoForm.discount_type} onChange={e => setPromoForm(f => ({ ...f, discount_type: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="percent">% Discount</option>
                  <option value="flat">Flat ₹ Off</option>
                  <option value="free">100% Free</option>
                </select>
              </div>
              {promoForm.discount_type === 'percent' && (
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 6 }}>DISCOUNT %</label>
                  <input type="number" min={1} max={100} value={promoForm.discount_percent} onChange={e => setPromoForm(f => ({ ...f, discount_percent: parseInt(e.target.value) || 0 }))} style={inp} />
                </div>
              )}
              {promoForm.discount_type === 'flat' && (
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 6 }}>FLAT OFF (₹)</label>
                  <input type="number" min={1} value={promoForm.flat_discount_amount} onChange={e => setPromoForm(f => ({ ...f, flat_discount_amount: parseInt(e.target.value) || 0 }))} style={inp} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 6 }}>MAX USES</label>
                <input type="number" value={promoForm.max_uses} onChange={e => setPromoForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="unlimited" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 6 }}>EXPIRES (optional)</label>
                <input type="date" value={promoForm.expires_at} onChange={e => setPromoForm(f => ({ ...f, expires_at: e.target.value }))} style={inp} />
              </div>
            </div>
            {msg && <div style={{ fontSize: 13, color: msg.startsWith('✅') ? '#22C55E' : '#EF4444', marginBottom: 12 }}>{msg}</div>}
            <button onClick={createPromo} disabled={saving || !promoForm.code} style={{ ...btn, opacity: saving || !promoForm.code ? 0.5 : 1 }}>
              {saving ? 'Creating…' : '+ Create Promo Code'}
            </button>
          </Card>

          {/* Promo list */}
          <Card title={`All Promo Codes (${promos.length})`}>
            {promos.length === 0 ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No promo codes yet.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Code', 'Type', 'Discount', 'Uses', 'Limit', 'Expires', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {promos.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: p.is_active ? '#A855F7' : 'rgba(255,255,255,0.3)' }}>{p.code}</span>
                        </td>
                        <td style={{ padding: '12px 12px' }}><Badge color="#3B82F6">{p.discount_type}</Badge></td>
                        <td style={{ padding: '12px 12px' }}>
                          {editId === p.id ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="number" value={editDiscount} onChange={e => setEditDiscount(parseInt(e.target.value) || 0)} style={{ ...inp, width: 64, padding: '4px 8px' }} />
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>%</span>
                              <button onClick={() => saveDiscount(p.id)} style={{ ...btn, padding: '4px 10px', fontSize: 11 }}>Save</button>
                              <button onClick={() => setEditId(null)} style={{ ...btn, padding: '4px 8px', fontSize: 11, background: 'rgba(255,255,255,0.08)' }}>✕</button>
                            </div>
                          ) : (
                            <span
                              onClick={() => { setEditId(p.id); setEditDiscount(p.discount_percent || 0); }}
                              style={{ fontSize: 14, fontWeight: 800, color: '#22C55E', cursor: 'pointer', textDecoration: 'underline dotted' }}
                              title="Click to edit"
                            >
                              {p.discount_type === 'free' ? '100%' : p.discount_type === 'percent' ? `${p.discount_percent}%` : `₹${(p.flat_discount_amount / 100).toFixed(0)} off`}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 14, fontWeight: 700, color: 'white' }}>{p.current_uses}</td>
                        <td style={{ padding: '12px 12px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.max_uses ?? '∞'}</td>
                        <td style={{ padding: '12px 12px', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{p.expires_at ? new Date(p.expires_at).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <button onClick={() => togglePromo(p.id, p.is_active)} style={{ padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: p.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: p.is_active ? '#22C55E' : '#EF4444' }}>
                            {p.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <button onClick={() => deletePromo(p.id)} style={{ padding: '4px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>}
      </div>
    </div>
  );
}
