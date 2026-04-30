import { useState } from 'react';
import { getSeuils, saveSeuils } from '../api/api';

export default function AlertsPanel({ alertes }) {
  const [showConfig, setShowConfig] = useState(false);
  const [seuils, setSeuils]         = useState(getSeuils());
  const [temp, setTemp]             = useState(getSeuils());

  const handleSave = () => {
    saveSeuils(temp);
    setSeuils(temp);
    setShowConfig(false);
  };

  const getNiveau = (message) => {
    const cpuMatch = message.match(/CPU=([\d.]+)/);
    const ramMatch = message.match(/RAM=([\d.]+)/);
    const cpu = cpuMatch ? parseFloat(cpuMatch[1]) : 0;
    const ram = ramMatch ? parseFloat(ramMatch[1]) : 0;
    if (cpu > seuils.cpu + 15 || ram > seuils.ram + 15) return 'critique';
    return 'warning';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: '#1e293b', fontSize: 15 }}>
          Alertes récentes
        </h3>
        <button onClick={() => setShowConfig(!showConfig)}
          style={{
            background: '#f1f5f9', color: '#475569',
            border: '1px solid #cbd5e1', borderRadius: 6,
            padding: '4px 8px', cursor: 'pointer', fontSize: 11,
            fontWeight: 'bold'
          }}>
          ⚙️ Seuils
        </button>
      </div>

      {/* Panel configuration */}
      {showConfig && (
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: 14, marginBottom: 12
        }}>
          <h4 style={{ margin: '0 0 12px', color: '#2563eb', fontSize: 13 }}>
            ⚙️ Configurer les seuils
          </h4>

          {/* CPU */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#1e293b', fontWeight: 'bold' }}>🔴 CPU</span>
              <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{temp.cpu}%</span>
            </div>
            <input type="range" min="50" max="99" value={temp.cpu}
              onChange={e => setTemp({ ...temp, cpu: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#ef4444' }} />
          </div>

          {/* RAM */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#1e293b', fontWeight: 'bold' }}>🔵 RAM</span>
              <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{temp.ram}%</span>
            </div>
            <input type="range" min="50" max="99" value={temp.ram}
              onChange={e => setTemp({ ...temp, ram: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#3b82f6' }} />
          </div>

          {/* Disk */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#1e293b', fontWeight: 'bold' }}>🟢 Disque</span>
              <span style={{ color: '#059669', fontWeight: 'bold' }}>{temp.disk}%</span>
            </div>
            <input type="range" min="50" max="99" value={temp.disk}
              onChange={e => setTemp({ ...temp, disk: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#10b981' }} />
          </div>

          {/* Resume */}
          <div style={{
            background: '#eff6ff', borderRadius: 6, padding: '6px 10px',
            fontSize: 11, color: '#3b82f6', marginBottom: 10,
            border: '1px solid #bfdbfe'
          }}>
            Alertes si : CPU &gt; {temp.cpu}% | RAM &gt; {temp.ram}% | Disk &gt; {temp.disk}%
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave}
              style={{
                flex: 1, background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: 6, padding: '6px 0',
                cursor: 'pointer', fontSize: 12, fontWeight: 'bold'
              }}>
              ✅ Sauvegarder
            </button>
            <button onClick={() => { setTemp(seuils); setShowConfig(false); }}
              style={{
                flex: 1, background: '#f1f5f9', color: '#475569',
                border: '1px solid #cbd5e1', borderRadius: 6,
                padding: '6px 0', cursor: 'pointer', fontSize: 12
              }}>
              ❌ Annuler
            </button>
          </div>
        </div>
      )}

      {/* Badges seuils */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ background: '#fee2e2', color: '#dc2626',
                       borderRadius: 20, padding: '2px 7px', fontSize: 10,
                       border: '1px solid #fecaca', fontWeight: 'bold' }}>
          CPU &gt; {seuils.cpu}%
        </span>
        <span style={{ background: '#dbeafe', color: '#2563eb',
                       borderRadius: 20, padding: '2px 7px', fontSize: 10,
                       border: '1px solid #bfdbfe', fontWeight: 'bold' }}>
          RAM &gt; {seuils.ram}%
        </span>
        <span style={{ background: '#dcfce7', color: '#16a34a',
                       borderRadius: 20, padding: '2px 7px', fontSize: 10,
                       border: '1px solid #bbf7d0', fontWeight: 'bold' }}>
          Disk &gt; {seuils.disk}%
        </span>
      </div>

      {/* Liste alertes */}
      {alertes.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Aucune alerte</p>
      ) : (
        alertes.map((a, i) => {
          const niveau = getNiveau(a.message);
          return (
            <div key={i} style={{
              background: niveau === 'critique' ? '#fff1f2' : '#fff7ed',
              color: '#1e293b',
              padding: '8px 12px', borderRadius: 6,
              marginBottom: 6, fontSize: 12,
              border: `1px solid ${niveau === 'critique' ? '#fecaca' : '#fed7aa'}`,
              borderLeft: `3px solid ${niveau === 'critique' ? '#ef4444' : '#f97316'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: niveau === 'critique' ? '#dc2626' : '#ea580c' }}>
                  {a.agent_id}
                </strong>
                <span style={{
                  fontSize: 10,
                  background: niveau === 'critique' ? '#ef4444' : '#f97316',
                  color: '#fff', borderRadius: 4, padding: '1px 5px',
                  fontWeight: 'bold'
                }}>
                  {niveau === 'critique' ? '🔴 CRITIQUE' : '🟠 WARNING'}
                </span>
              </div>
              <div style={{ marginTop: 3, color: '#475569' }}>{a.message}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                {new Date(a.timestamp).toLocaleString()}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}