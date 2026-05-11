export default function DashboardLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#07060F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 32, height: 32,
        borderRadius: '50%',
        border: '2px solid rgba(139,92,246,0.2)',
        borderTop: '2px solid #8B5CF6',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}
