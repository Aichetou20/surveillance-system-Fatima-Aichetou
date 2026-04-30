export default function StatsCard({ title, value, color, unit, subtitle }) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: 12,
      padding: '16px 20px', textAlign: 'center', flex: 1,
      border: `2px solid ${color}20`,
      boxShadow: `0 4px 12px ${color}20`
    }}>
      <div style={{ fontSize: 12, color: '#64748b',
                    marginBottom: 4, fontWeight: '500' }}>
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 'bold', color: color }}>
        {value}{unit}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}