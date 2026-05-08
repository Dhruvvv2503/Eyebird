'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DashboardAuditClient } from '@/components/dashboard/DashboardAuditClient';

function DashboardAuditInner() {
  const searchParams = useSearchParams();
  const autoStart = searchParams.get('new_connection') === 'true';

  const [igAccount, setIgAccount] = useState<any>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/data')
      .then(r => r.json())
      .then(d => {
        setIgAccount(d.igAccount || null);
        setAudits(d.audits || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #A855F7', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <DashboardAuditClient
      igAccount={igAccount}
      audits={audits}
      autoStart={autoStart}
    />
  );
}

export default function DashboardAuditPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #A855F7', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <DashboardAuditInner />
    </Suspense>
  );
}
