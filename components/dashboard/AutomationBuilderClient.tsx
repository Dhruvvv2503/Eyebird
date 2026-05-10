'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AutomationFormState, InstagramPost } from '@/types/automations';

interface Props {
  igAccount: {
    id: string;
    ig_user_id: string;
    username: string;
    profile_picture_url: string | null;
    followers_count: number;
    biography: string | null;
  } | null;
  niche: string;
  existingAutomation: Record<string, unknown> | null;
}

const SUGGESTED_KEYWORDS = ['LINK', 'INFO', 'PRICE', 'JOIN', 'SEND', 'DM', 'DETAILS', 'SHOP', 'BUY', 'FREE', 'GUIDE', 'PLAN'];

const DEFAULT_FORM: AutomationFormState = {
  name: '',
  trigger_post_id: null,
  trigger_post_url: null,
  trigger_post_thumbnail: null,
  trigger_keywords: [],
  trigger_any_word: false,
  reply_to_comment_publicly: false,
  opening_dm_enabled: false,
  opening_dm_text: '',
  follow_gate_enabled: false,
  main_dm_text: '',
  main_dm_link_text: '',
  main_dm_link_url: '',
  test_mode: true,
};

function getInitialForm(existing: Record<string, unknown> | null): AutomationFormState {
  if (!existing) return DEFAULT_FORM;
  return {
    name: (existing.name as string) || '',
    trigger_post_id: (existing.trigger_post_id as string | null) || null,
    trigger_post_url: (existing.trigger_post_url as string | null) || null,
    trigger_post_thumbnail: (existing.trigger_post_thumbnail as string | null) || null,
    trigger_keywords: (existing.trigger_keywords as string[]) || [],
    trigger_any_word: (existing.trigger_any_word as boolean) || false,
    reply_to_comment_publicly: (existing.reply_to_comment_publicly as boolean) || false,
    opening_dm_enabled: (existing.opening_dm_enabled as boolean) || false,
    opening_dm_text: (existing.opening_dm_text as string) || '',
    follow_gate_enabled: (existing.follow_gate_enabled as boolean) || false,
    main_dm_text: (existing.main_dm_text as string) || '',
    main_dm_link_text: (existing.main_dm_link_text as string) || '',
    main_dm_link_url: (existing.main_dm_link_url as string) || '',
    test_mode: (existing.test_mode as boolean) ?? true,
  };
}

export default function AutomationBuilderClient({ igAccount, niche, existingAutomation }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AutomationFormState>(() => getInitialForm(existingAutomation));

  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [rewriting, setRewriting] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'post' | 'comments' | 'dm'>('dm');
  const [showPostPicker, setShowPostPicker] = useState(false);
  const [nameError, setNameError] = useState('');
  const [dmError, setDmError] = useState('');
  const [dmUsage, setDmUsage] = useState<{ used: number; limit: number } | null>(null);

  const loadPosts = useCallback(async (cursor?: string) => {
    setLoadingPosts(true);
    try {
      const url = cursor ? `/api/instagram/posts?cursor=${cursor}` : '/api/instagram/posts';
      const res = await fetch(url);
      const data = await res.json();
      if (cursor) {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      } else {
        setPosts(data.posts || []);
      }
      setNextCursor(data.nextCursor);
      setHasMorePosts(data.hasMore);
      setPostsLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/automations')
      .then(r => r.json())
      .then(data => {
        if (data.automations) {
          const used = (data.automations as { total_dms_sent?: number }[]).reduce(
            (sum, a) => sum + (a.total_dms_sent || 0), 0
          );
          setDmUsage({ used, limit: 5000 });
        }
      })
      .catch(() => {});
  }, []);

  function addKeyword(kw: string) {
    const cleaned = kw.trim().toUpperCase();
    if (!cleaned || form.trigger_keywords.includes(cleaned) || form.trigger_keywords.length >= 20) return;
    setForm(f => ({ ...f, trigger_keywords: [...f.trigger_keywords, cleaned] }));
    setKeywordInput('');
  }

  function removeKeyword(kw: string) {
    setForm(f => ({ ...f, trigger_keywords: f.trigger_keywords.filter(k => k !== kw) }));
  }

  async function handleAiRewrite() {
    if (!form.main_dm_text.trim() || rewriting) return;
    setRewriting(true);
    try {
      const res = await fetch('/api/automations/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dmText: form.main_dm_text,
          username: igAccount?.username || '',
          niche,
        }),
      });
      const data = await res.json();
      if (data.rewritten) {
        setForm(f => ({ ...f, main_dm_text: data.rewritten }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRewriting(false);
    }
  }

  function validate(): boolean {
    let valid = true;
    if (!form.name.trim()) { setNameError('Give your automation a name'); valid = false; }
    else setNameError('');
    if (!form.main_dm_text.trim()) { setDmError('Add your DM message'); valid = false; }
    else setDmError('');
    if (!form.trigger_any_word && form.trigger_keywords.length === 0) {
      alert('Add at least one keyword or enable "Any word"');
      valid = false;
    }
    return valid;
  }

  async function handleSave(status: 'draft' | 'active') {
    if (!validate()) return;
    setSaving(true);
    setSaveStatus('saving');
    try {
      const payload = {
        ...form,
        status,
        main_dm_link_text: form.main_dm_link_text || null,
        main_dm_link_url: form.main_dm_link_url || null,
        opening_dm_text: form.opening_dm_enabled ? form.opening_dm_text : null,
      };

      const url = existingAutomation
        ? `/api/automations/${existingAutomation.id}`
        : '/api/automations';
      const method = existingAutomation ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (status === 'active') {
        try {
          const webhookRes = await fetch('/api/automations/register-webhook', { method: 'POST' });
          const webhookData = await webhookRes.json();
          if (webhookData.success) {
            console.log('Webhook registered successfully');
          } else {
            console.log('Webhook registration note:', webhookData.note || webhookData.error);
          }
        } catch (webhookErr) {
          console.log('Webhook registration failed silently:', webhookErr);
        }
      }

      setSaveStatus('saved');
      setTimeout(() => router.push('/dashboard/automations'), 800);
    } catch (err: unknown) {
      setSaveStatus('error');
      const message = err instanceof Error ? err.message : 'Failed to save';
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  function getPreviewDmText() {
    let text = form.main_dm_text || 'Your DM message will appear here...';
    text = text.replace('{first_name}', igAccount?.username || 'there');
    return text;
  }

  // ── TOGGLE HELPER ──
  function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
      <div
        onClick={onChange}
        style={{
          width: 44, height: 24, borderRadius: 100, cursor: 'pointer',
          background: value ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'rgba(255,255,255,0.1)',
          position: 'relative', transition: 'all 0.3s', flexShrink: 0,
          boxShadow: value ? '0 0 12px rgba(139,92,246,0.4)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: '#fff', transition: 'left 0.3s',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: '#07060F',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* TOP BAR */}
      <div style={{
        height: 58,
        background: 'rgba(13,12,30,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 14,
        flexShrink: 0,
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={() => router.push('/dashboard/automations')}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
        >←</button>

        <input
          value={form.name}
          onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setNameError(''); }}
          placeholder="Name your automation..."
          style={{
            flex: 1,
            background: 'transparent',
            border: nameError ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent',
            borderRadius: 8,
            padding: '6px 10px',
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 700,
            color: '#fff',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { if (!nameError) e.target.style.borderColor = 'rgba(139,92,246,0.4)'; }}
          onBlur={e => { if (!nameError) e.target.style.borderColor = 'transparent'; }}
        />

        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          style={{
            padding: '8px 18px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, fontFamily: 'var(--font-body)',
            fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            cursor: saving ? 'wait' : 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
        >
          {saveStatus === 'saved' ? '✓ Saved' : 'Save Draft'}
        </button>

        <button
          onClick={() => handleSave('active')}
          disabled={saving}
          style={{
            padding: '8px 20px',
            background: saving ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            border: 'none', borderRadius: 10,
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
            color: '#fff', cursor: saving ? 'wait' : 'pointer',
            boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { if (!saving) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          {saving ? 'Saving...' : '⚡ Activate Automation'}
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: PHONE PREVIEW */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(145deg, #08071A, #07060F)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Live Preview
            </div>

            {/* iPhone frame */}
            <div style={{
              width: 270,
              background: '#000',
              borderRadius: 44,
              border: '8px solid #1a1a1a',
              boxShadow: '0 0 0 1px #333, 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.15)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Phone top bar */}
              <div style={{ background: '#000', padding: '14px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>9:41</div>
                <div style={{ width: 80, height: 18, background: '#1a1a1a', borderRadius: 100 }} />
                <div style={{ fontSize: 10, color: '#fff', display: 'flex', gap: 3 }}>●●●</div>
              </div>

              {activePreviewTab === 'dm' ? (
                <>
                  {/* DM Header */}
                  <div style={{ background: '#000', padding: '8px 14px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #222' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
                      {igAccount?.profile_picture_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={igAccount.profile_picture_url} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>@{igAccount?.username || 'your_account'}</div>
                      <div style={{ fontSize: 10, color: '#666' }}>Instagram · Just now</div>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div style={{ background: '#000', minHeight: 320, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {form.opening_dm_enabled && form.opening_dm_text && (
                      <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                        <div style={{ background: '#1a1a1a', borderRadius: '18px 18px 18px 4px', padding: '10px 14px', fontSize: 12, color: '#fff', lineHeight: 1.5 }}>
                          {form.opening_dm_text.replace('{first_name}', 'there')}
                        </div>
                      </div>
                    )}
                    {form.main_dm_text ? (
                      <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                        <div style={{ background: '#1a1a1a', borderRadius: '18px 18px 18px 4px', padding: '10px 14px', fontSize: 12, color: '#fff', lineHeight: 1.5 }}>
                          {getPreviewDmText()}
                        </div>
                        {form.main_dm_link_text && form.main_dm_link_url && (
                          <div style={{ background: '#1C1C1E', border: '1px solid #333', borderRadius: 12, padding: '10px 14px', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{form.main_dm_link_text}</div>
                              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{form.main_dm_link_url}</div>
                            </div>
                            <div style={{ fontSize: 16 }}>→</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 60 }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                        <div style={{ fontSize: 11, color: '#444', textAlign: 'center' }}>Your DM will<br />appear here</div>
                      </div>
                    )}
                  </div>

                  {/* Input bar */}
                  <div style={{ background: '#000', padding: '10px 14px 20px', borderTop: '1px solid #222', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 20, padding: '8px 14px', fontSize: 11, color: '#555' }}>Message...</div>
                  </div>
                </>
              ) : activePreviewTab === 'post' ? (
                <>
                  {/* Post header */}
                  <div style={{ background: '#000', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #111' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
                        {igAccount?.profile_picture_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={igAccount.profile_picture_url} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>@{igAccount?.username || 'your_account'}</span>
                    </div>
                    <span style={{ fontSize: 14, color: '#666', letterSpacing: 2 }}>···</span>
                  </div>
                  {/* Post image */}
                  <div style={{ width: '100%', aspectRatio: '1', background: '#111', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.trigger_post_thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.trigger_post_thumbnail} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#333' }}>
                        <div style={{ fontSize: 28 }}>🖼</div>
                        <div style={{ fontSize: 10, marginTop: 6, color: '#444' }}>Select a post above</div>
                      </div>
                    )}
                  </div>
                  {/* Post actions */}
                  <div style={{ background: '#000', padding: '10px 14px 16px' }}>
                    <div style={{ display: 'flex', gap: 14, marginBottom: 8, fontSize: 18 }}>
                      <span>♡</span><span style={{ fontSize: 16 }}>💬</span><span style={{ fontSize: 16 }}>↗</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 4 }}>1,234 likes</div>
                    <div style={{ fontSize: 11, color: '#555' }}>View all 56 comments</div>
                  </div>
                </>
              ) : (
                <>
                  {/* Comments header */}
                  <div style={{ background: '#000', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #111' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
                      {igAccount?.profile_picture_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={igAccount.profile_picture_url} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Comments</span>
                  </div>
                  {/* Comments list */}
                  <div style={{ background: '#000', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 300 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2a2a2a', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>user123 </span>
                        <span style={{ fontSize: 11, color: '#999' }}>Love this! ❤️</span>
                        <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>2 min ago</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2a2a2a', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>rahul_k </span>
                        <span style={{ fontSize: 11, color: '#999' }}>Send me the </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', background: 'rgba(139,92,246,0.15)', borderRadius: 4, padding: '1px 4px' }}>
                          {form.trigger_keywords[0] || 'LINK'}
                        </span>
                        <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>Just now</div>
                      </div>
                    </div>
                    {form.reply_to_comment_publicly && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
                          {igAccount?.profile_picture_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={igAccount.profile_picture_url} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>@{igAccount?.username || 'you'} </span>
                          <span style={{ fontSize: 11, color: '#999' }}>Sent you a DM! 📩</span>
                          <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>Just now · <span style={{ color: '#8B5CF6' }}>Automated</span></div>
                        </div>
                      </div>
                    )}
                    <div style={{ padding: '10px 12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>📨</span>
                      <span style={{ fontSize: 11, color: '#c4b5fd' }}>DM sent automatically</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Preview tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['post', 'comments', 'dm'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActivePreviewTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: 'none',
                    background: activePreviewTab === tab ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    color: activePreviewTab === tab ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                    fontSize: 11, fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CONFIG PANEL */}
        <div style={{
          width: 420,
          flexShrink: 0,
          background: '#0C0B1A',
          overflowY: 'auto',
          padding: '24px 22px',
        }}>

          {/* DM USAGE BAR */}
          {dmUsage && (
            <div style={{ marginBottom: 22, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>DMs this month</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: dmUsage.used / dmUsage.limit > 0.8 ? '#f87171' : 'rgba(255,255,255,0.6)' }}>
                  {dmUsage.used.toLocaleString()} / {dmUsage.limit.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (dmUsage.used / dmUsage.limit) * 100)}%`,
                  background: dmUsage.used / dmUsage.limit > 0.8
                    ? 'linear-gradient(90deg, #f87171, #ef4444)'
                    : 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                  borderRadius: 100,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {/* STEP 1: TRIGGER POST */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>1</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff' }}>When someone comments on</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Any post option */}
              <div
                onClick={() => setForm(f => ({ ...f, trigger_post_id: null, trigger_post_url: null, trigger_post_thumbnail: null }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: !form.trigger_post_id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${!form.trigger_post_id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Any post or reel</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Automation fires on all posts</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${!form.trigger_post_id ? '#8B5CF6' : 'rgba(255,255,255,0.2)'}`, background: !form.trigger_post_id ? '#8B5CF6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {!form.trigger_post_id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </div>

              {/* Specific post option */}
              <div
                onClick={() => {
                  if (!postsLoaded) loadPosts();
                  setShowPostPicker(true);
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: form.trigger_post_id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${form.trigger_post_id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  {form.trigger_post_thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.trigger_post_thumbnail} alt="thumbnail" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                      {form.trigger_post_id ? 'Specific post selected' : 'A specific post or reel'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                      {form.trigger_post_id ? 'Tap to change' : 'Choose from your posts'}
                    </div>
                  </div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.trigger_post_id ? '#8B5CF6' : 'rgba(255,255,255,0.2)'}`, background: form.trigger_post_id ? '#8B5CF6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.trigger_post_id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </div>
            </div>

            {/* POST PICKER GRID */}
            {showPostPicker && (
              <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 12 }}>
                {loadingPosts && posts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Loading your posts...</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {posts.map(post => (
                        <div
                          key={post.id}
                          onClick={() => {
                            setForm(f => ({
                              ...f,
                              trigger_post_id: post.id,
                              trigger_post_url: post.permalink,
                              trigger_post_thumbnail: post.thumbnail_url || post.media_url,
                            }));
                            setShowPostPicker(false);
                          }}
                          style={{
                            aspectRatio: '1',
                            borderRadius: 8, overflow: 'hidden',
                            cursor: 'pointer', position: 'relative',
                            border: form.trigger_post_id === post.id ? '2px solid #8B5CF6' : '2px solid transparent',
                            transition: 'all 0.15s',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.thumbnail_url || post.media_url}
                            alt="post"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          {post.media_type === 'VIDEO' && (
                            <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '2px 5px', fontSize: 9, color: '#fff' }}>▶</div>
                          )}
                        </div>
                      ))}
                    </div>
                    {hasMorePosts && (
                      <button
                        onClick={() => loadPosts(nextCursor || undefined)}
                        disabled={loadingPosts}
                        style={{
                          width: '100%', marginTop: 10,
                          padding: '8px', borderRadius: 8,
                          background: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.2)',
                          color: '#c4b5fd', fontSize: 12, fontWeight: 600,
                          cursor: loadingPosts ? 'wait' : 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {loadingPosts ? 'Loading...' : 'Load more posts'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -22px 28px' }} />

          {/* STEP 2: KEYWORD TRIGGER */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>2</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff' }}>And their comment has</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Any word</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Fires on every comment</div>
              </div>
              <Toggle value={form.trigger_any_word} onChange={() => setForm(f => ({ ...f, trigger_any_word: !f.trigger_any_word }))} />
            </div>

            {!form.trigger_any_word && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(keywordInput); } }}
                    placeholder="Type keyword and press Enter"
                    maxLength={30}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 9, padding: '9px 12px',
                      fontFamily: 'var(--font-body)', fontSize: 13,
                      color: '#fff', outline: 'none',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.4)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                  <button
                    onClick={() => addKeyword(keywordInput)}
                    style={{
                      padding: '9px 14px',
                      background: 'rgba(139,92,246,0.15)',
                      border: '1px solid rgba(139,92,246,0.25)',
                      borderRadius: 9, color: '#c4b5fd',
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >Add</button>
                </div>

                {form.trigger_keywords.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {form.trigger_keywords.map(kw => (
                      <div key={kw} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 100, padding: '4px 12px',
                        fontSize: 12, fontWeight: 700, color: '#c4b5fd',
                      }}>
                        {kw}
                        <span onClick={() => removeKeyword(kw)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 14, lineHeight: 1 }}>×</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Suggested</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SUGGESTED_KEYWORDS.filter(k => !form.trigger_keywords.includes(k)).map(kw => (
                      <div
                        key={kw}
                        onClick={() => addKeyword(kw)}
                        style={{
                          fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 100, padding: '4px 10px',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(139,92,246,0.1)'; el.style.color = '#c4b5fd'; el.style.borderColor = 'rgba(139,92,246,0.2)'; }}
                        onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.04)'; el.style.color = 'rgba(255,255,255,0.4)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      >{kw}</div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 6 }}>
                  {form.trigger_keywords.length}/20 keywords
                </div>
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Reply to comment publicly</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Optional: reply on post before DMing</div>
              </div>
              <Toggle value={form.reply_to_comment_publicly} onChange={() => setForm(f => ({ ...f, reply_to_comment_publicly: !f.reply_to_comment_publicly }))} />
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -22px 28px' }} />

          {/* STEP 3: OPTIONAL STEPS */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>3</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff' }}>They will optionally get</span>
            </div>

            {/* Opening DM */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, marginBottom: form.opening_dm_enabled ? 8 : 0 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>An opening DM</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Warm message before the main content</div>
                </div>
                <Toggle value={form.opening_dm_enabled} onChange={() => setForm(f => ({ ...f, opening_dm_enabled: !f.opening_dm_enabled }))} />
              </div>
              {form.opening_dm_enabled && (
                <textarea
                  value={form.opening_dm_text}
                  onChange={e => setForm(f => ({ ...f, opening_dm_text: e.target.value }))}
                  placeholder="Hey {first_name}! Thanks for your comment 👋"
                  rows={2}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 9, padding: '10px 12px',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: '#fff', outline: 'none', resize: 'none',
                    transition: 'border-color 0.15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.4)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              )}
            </div>

            {/* Follow gate */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Follow gate</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Must follow to receive the DM</div>
              </div>
              <Toggle value={form.follow_gate_enabled} onChange={() => setForm(f => ({ ...f, follow_gate_enabled: !f.follow_gate_enabled }))} />
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -22px 28px' }} />

          {/* STEP 4: MAIN DM */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>4</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff' }}>And they will get a DM with</span>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              <span
                onClick={() => setForm(f => ({ ...f, main_dm_text: f.main_dm_text + '{first_name}' }))}
                style={{
                  fontSize: 11, fontWeight: 600, color: '#a78bfa',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 6, padding: '3px 8px',
                  cursor: 'pointer',
                }}
              >{'{first_name}'}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>Click to insert</span>
            </div>

            <textarea
              value={form.main_dm_text}
              onChange={e => { setForm(f => ({ ...f, main_dm_text: e.target.value })); setDmError(''); }}
              placeholder={`Hey {first_name}! 👋\n\nHere's the link you asked for:\n\nLet me know if you have any questions!`}
              rows={5}
              maxLength={1000}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${dmError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, padding: '12px 14px',
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: '#fff', outline: 'none', resize: 'vertical',
                lineHeight: 1.6, transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { if (!dmError) e.target.style.borderColor = 'rgba(139,92,246,0.4)'; }}
              onBlur={e => { if (!dmError) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              {dmError ? (
                <span style={{ fontSize: 11, color: '#f87171' }}>{dmError}</span>
              ) : (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{form.main_dm_text.length}/1000 characters</span>
              )}
              <button
                onClick={handleAiRewrite}
                disabled={rewriting || !form.main_dm_text.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px',
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: 8, color: rewriting ? 'rgba(196,181,253,0.5)' : '#c4b5fd',
                  fontSize: 11, fontWeight: 600,
                  cursor: rewriting || !form.main_dm_text.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                  opacity: !form.main_dm_text.trim() ? 0.5 : 1,
                }}
              >
                {rewriting ? '✨ Rewriting...' : '✨ AI Rewrite'}
              </button>
            </div>

            {/* Link button */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Add a link button (optional)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={form.main_dm_link_text}
                  onChange={e => setForm(f => ({ ...f, main_dm_link_text: e.target.value }))}
                  placeholder="Button text (e.g. Shop now)"
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 9, padding: '9px 12px',
                    fontFamily: 'var(--font-body)', fontSize: 12,
                    color: '#fff', outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.4)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <input
                  value={form.main_dm_link_url}
                  onChange={e => setForm(f => ({ ...f, main_dm_link_url: e.target.value }))}
                  placeholder="https://..."
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 9, padding: '9px 12px',
                    fontFamily: 'var(--font-body)', fontSize: 12,
                    color: '#fff', outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.4)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>
            </div>
          </div>

          {/* BOTTOM SAVE BUTTONS */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              style={{
                flex: 1, padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, fontFamily: 'var(--font-display)',
                fontSize: 13, fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                cursor: saving ? 'wait' : 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
            >Save as Draft</button>
            <button
              onClick={() => handleSave('active')}
              disabled={saving}
              style={{
                flex: 1, padding: '12px',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                border: 'none', borderRadius: 12,
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                color: '#fff', cursor: saving ? 'wait' : 'pointer',
                boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              {saving ? 'Saving...' : '⚡ Activate Automation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
