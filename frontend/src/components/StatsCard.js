export default function StatsCard({ title, value, color, unit, subtitle }) {
  return (
    <div style={{
      background: color, color: '#fff', borderRadius: 12,
      padding: '16px 20px', textAlign: 'center', flex: 1
    }}>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold' }}>
        {value}{unit}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}