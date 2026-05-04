'use client';

export function SkeletonBlock({
  width = '100%',
  height = 20,
  rounded = 8,
  className = '',
}: {
  width?: string | number;
  height?: number;
  rounded?: number;
  className?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded,
        flexShrink: 0,
      }}
    />
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`p-5 rounded-xl ${className}`}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBlock width={32} height={32} rounded={8} />
        <SkeletonBlock width={120} height={14} />
      </div>
      <SkeletonBlock width="60%" height={36} className="mb-3" />
      <SkeletonBlock width="100%" height={8} rounded={999} className="mb-2" />
      <SkeletonBlock width="80%" height={14} />
    </div>
  );
}

export default function AuditSkeletonLoader() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div
        className="flex items-center justify-between p-6 rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <SkeletonBlock width={64} height={64} rounded={50} />
          <div className="space-y-2">
            <SkeletonBlock width={160} height={20} />
            <SkeletonBlock width={120} height={14} />
            <SkeletonBlock width={100} height={12} />
          </div>
        </div>
        <SkeletonBlock width={120} height={120} rounded={60} />
      </div>

      {/* Progress steps */}
      <div
        className="p-6 rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <SkeletonBlock width={200} height={16} className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBlock width={20} height={20} rounded={50} />
              <SkeletonBlock width={`${60 + i * 8}%`} height={14} />
            </div>
          ))}
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="r-grid-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="r-grid-2">
        {[1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
