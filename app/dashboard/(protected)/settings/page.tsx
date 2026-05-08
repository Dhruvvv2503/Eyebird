'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Instagram, CreditCard, Bell, Trash2, ExternalLink } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

type Tab = 'account' | 'instagram' | 'billing' | 'notifications';

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'account',       label: 'Account',       icon: Camera      },
    { key: 'instagram',     label: 'Instagram',     icon: Instagram   },
    { key: 'billing',       label: 'Billing',       icon: CreditCard  },
    { key: 'notifications', label: 'Notifications', icon: Bell        },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap' }}>
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 9, border: 'none',
            background: active === key ? 'rgba(168,85,247,0.12)' : 'transparent',
            color: active === key ? '#A855F7' : 'rgba(255,255,255,0.45)',
            fontSize: 13, fontWeight: active === key ? 700 : 500,
            cursor: 'pointer', transition: 'all 0.15s ease',
            borderBottom: active === key ? '2px solid #A855F7' : '2px solid transparent',
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px', borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA', marginBottom: 20, letterSpacing: '-0.02em' }}>{title}</h3>
      {children}
    </div>
  );
}

function InputRow({ label, value, onChange, type = 'text', disabled = false, placeholder = '' }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="input"
        style={{ height: 44, fontSize: 14, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState('');
  const [notifications, setNotifications] = useState({
    weekly_report: true,
    audit_completed: true,
    smart_reply_digest: true,
    marketing: false,
  });

  useEffect(() => {
    fetch('/api/dashboard/data')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setFullName(d.profile?.full_name || d.user?.full_name || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_profiles').update({ full_name: fullName }).eq('id', user.id);
      await supabase.auth.updateUser({ data: { full_name: fullName } });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Are you sure? This will permanently delete your Eyebird account and all audit data. This cannot be undone.');
    if (confirmed) {
      alert('To delete your account, please email support@eyebird.in with subject "Delete my account".');
    }
  };

  const isGoogleAuth = data?.user?.email && !data?.user?.has_password;
  const plan = data?.profile?.plan || 'free';
  const planNames: Record<string, string> = { free: 'Free Plan', creator: 'Creator — ₹799/month', pro: 'Pro — ₹1,999/month', agency: 'Agency — ₹7,999/month' };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #A855F7', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: 640, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Manage your account and preferences.</p>

        <TabBar active={tab} onChange={setTab} />

        {/* ── Account Tab ── */}
        {tab === 'account' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <SectionCard title="Profile">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#FF3E80,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>{fullName[0]?.toUpperCase() || '?'}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FAFAFA' }}>{fullName || 'Your name'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{data?.user?.email}</div>
                </div>
              </div>
              <InputRow label="Full name" value={fullName} onChange={setFullName} placeholder="Your full name" />
              <InputRow label="Email" value={data?.user?.email || ''} disabled type="email" />
              {data?.user?.email && (
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: -8, marginBottom: 16 }}>
                  {isGoogleAuth ? 'Email is managed by Google and cannot be changed here.' : ''}
                </p>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-primary"
                style={{ height: 44, padding: '0 24px', fontSize: 14, fontWeight: 700, borderRadius: 10 }}
              >
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
              </button>
            </SectionCard>

            {/* Change password — only email auth */}
            {!isGoogleAuth && (
              <SectionCard title="Change Password">
                <InputRow label="Current password" value="" type="password" placeholder="••••••••" />
                <InputRow label="New password" value="" type="password" placeholder="Min 8 characters" />
                <InputRow label="Confirm new password" value="" type="password" placeholder="••••••••" />
                <button className="btn btn-secondary" style={{ height: 44, padding: '0 24px', fontSize: 14, fontWeight: 600, borderRadius: 10 }}>
                  Update password
                </button>
              </SectionCard>
            )}

            {/* Danger zone */}
            <div style={{ padding: '20px', borderRadius: 14, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>Danger Zone</h3>
              <p style={{ fontSize: 13, color: 'rgba(239,68,68,0.7)', marginBottom: 14, lineHeight: 1.5 }}>
                Permanently deletes your account and all associated data. This cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: 'transparent', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(239,68,68,0.1)'); }}
                onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); }}
              >
                <Trash2 size={14} /> Delete my account
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Instagram Tab ── */}
        {tab === 'instagram' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <SectionCard title="Connected Accounts">
              {data?.igAccount ? (
                <div style={{ padding: '16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#FAFAFA', marginBottom: 3 }}>@{data.igAccount.username}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                      {(data.igAccount.followers_count || 0).toLocaleString('en-IN')} followers · Connected account
                    </div>
                    {data.igAccount.token_expires_at && (
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Token expires: {new Date(data.igAccount.token_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => alert('To disconnect Instagram, please reconnect with a different account or contact support.')}
                  >
                    <ExternalLink size={12} /> Disconnect
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 16 }}>No Instagram account connected yet.</p>
                  <a href="/api/instagram/auth?intent=get_started" className="btn btn-primary" style={{ height: 44, padding: '0 24px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'inline-flex', textDecoration: 'none' }}>
                    <Instagram size={15} /> Connect Instagram
                  </a>
                </div>
              )}
            </SectionCard>
            {plan !== 'free' && plan !== 'creator' && (
              <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', fontSize: 13, color: 'var(--text-secondary)' }}>
                <a href="/api/instagram/auth?intent=get_started" style={{ color: '#A855F7', fontWeight: 600, textDecoration: 'none' }}>+ Connect another account</a>
                {' '}(Pro / Agency feature)
              </div>
            )}
          </motion.div>
        )}

        {/* ── Billing Tab ── */}
        {tab === 'billing' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <SectionCard title="Current Plan">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: plan !== 'free' ? 16 : 0 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#FAFAFA', marginBottom: 3 }}>{planNames[plan]}</div>
                  {data?.profile?.plan_expires_at && (
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                      Next billing: {new Date(data.profile.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {plan === 'free' && (
                    <a href="/#pricing" className="btn btn-primary" style={{ height: 40, padding: '0 18px', fontSize: 13, fontWeight: 700, borderRadius: 9, display: 'inline-flex', textDecoration: 'none' }}>
                      Upgrade to Creator →
                    </a>
                  )}
                  {plan !== 'free' && (
                    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 16px', borderRadius: 9, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                      Cancel subscription
                    </button>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Payment History">
              {plan === 'free' ? (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>No payments yet. Upgrade to Creator to unlock all features.</p>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginBottom: 8 }}>
                    {['Date', 'Amount', 'Status'].map(h => (
                      <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>{h}</div>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '12px 0' }}>Payment history will appear here.</p>
                </div>
              )}
            </SectionCard>
          </motion.div>
        )}

        {/* ── Notifications Tab ── */}
        {tab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <SectionCard title="Email Notifications">
              {[
                { key: 'weekly_report',       label: 'Weekly account health report', desc: 'Every Monday morning' },
                { key: 'audit_completed',      label: 'New audit completed',          desc: 'When your audit finishes' },
                { key: 'smart_reply_digest',   label: 'Smart reply pending',          desc: 'Daily digest' },
                { key: 'marketing',            label: 'Marketing emails and product updates', desc: 'Occasional updates' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    style={{
                      width: 40, height: 22, borderRadius: 11, flexShrink: 0,
                      background: notifications[key as keyof typeof notifications] ? '#A855F7' : 'rgba(255,255,255,0.1)',
                      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 3, left: notifications[key as keyof typeof notifications] ? 21 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s ease', display: 'block',
                    }} />
                  </button>
                </div>
              ))}
              <button className="btn btn-primary" style={{ marginTop: 20, height: 44, padding: '0 24px', fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
                Save preferences
              </button>
            </SectionCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
