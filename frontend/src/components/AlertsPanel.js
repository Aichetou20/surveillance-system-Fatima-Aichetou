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

  // Verifie si une alerte depasse les seuils configures
  const getNiveau = (message) => {
    const cpuMatch  = message.match(/CPU=([\d.]+)/);
    const ramMatch  = message.match(/RAM=([\d.]+)/);
    const cpu = cpuMatch  ? parseFloat(cpuMatch[1])  : 0;
    const ram = ramMatch  ? parseFloat(ramMatch[1])  : 0;
    if (cpu > seuils.cpu + 15 || ram > seuils.ram + 15) return 'critique';
    return 'warning';
  };

  return (
    <div>
      {/* Header alertes */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Alertes récentes</h3>
        <button onClick={() => setShowConfig(!showConfig)}
          style={{
            background: '#334155', color: '#fff', border: 'none',
            borderRadius: 6, padding: '4px 8px',
            cursor: 'pointer', fontSize: 11
          }}>
          Seuils
        </button>
      </div>

      {/* Panel configuration des seuils */}
      {showConfig && (
        <div style={{
          background: '#0f172a', border: '1px solid #334155',
          borderRadius: 10, padding: 14, marginBottom: 12
        }}>
          <h4 style={{ margin: '0 0 12px', color: '#60a5fa', fontSize: 13 }}>
            Configurer les seuils d'alerte
          </h4>

          {/* CPU */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, marginBottom: 4 }}>
              <span>CPU</span>
              <span style={{ color: '#f87171' }}>{temp.cpu}%</span>
            </div>
            <input type="range" min="50" max="99" value={temp.cpu}
              onChange={e => setTemp({ ...temp, cpu: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#ef4444' }} />
          </div>

          {/* RAM */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, marginBottom: 4 }}>
              <span>RAM</span>
              <span style={{ color: '#60a5fa' }}>{temp.ram}%</span>
            </div>
            <input type="range" min="50" max="99" value={temp.ram}
              onChange={e => setTemp({ ...temp, ram: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#3b82f6' }} />
          </div>

          {/* Disk */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, marginBottom: 4 }}>
              <span>Disque</span>
              <span style={{ color: '#34d399' }}>{temp.disk}%</span>
            </div>
            <input type="range" min="50" max="99" value={temp.disk}
              onChange={e => setTemp({ ...temp, disk: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#10b981' }} />
          </div>

          {/* Seuils actuels resume */}
          <div style={{
            background: '#1e293b', borderRadius: 6, padding: '6px 10px',
            fontSize: 11, color: '#94a3b8', marginBottom: 10
          }}>
            Alertes déclenchées si : CPU &gt; {temp.cpu}% | RAM &gt; {temp.ram}% | Disk &gt; {temp.disk}%
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave}
              style={{
                flex: 1, background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: 6, padding: '6px 0',
                cursor: 'pointer', fontSize: 12
              }}>
              Sauvegarder
            </button>
            <button onClick={() => { setTemp(seuils); setShowConfig(false); }}
              style={{
                flex: 1, background: '#334155', color: '#fff',
                border: 'none', borderRadius: 6, padding: '6px 0',
                cursor: 'pointer', fontSize: 12
              }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Seuils actuels affichés */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap'
      }}>
        <span style={{ background: '#450a0a', color: '#fca5a5',
                       borderRadius: 20, padding: '2px 7px', fontSize: 10 }}>
          CPU &gt; {seuils.cpu}%
        </span>
        <span style={{ background: '#172554', color: '#93c5fd',
                       borderRadius: 20, padding: '2px 7px', fontSize: 10 }}>
          RAM &gt; {seuils.ram}%
        </span>
        <span style={{ background: '#14532d', color: '#86efac',
                       borderRadius: 20, padding: '2px 7px', fontSize: 10 }}>
          Disk &gt; {seuils.disk}%
        </span>
      </div>

      {/* Liste des alertes */}
      {alertes.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Aucune alerte</p>
      ) : (
        alertes.map((a, i) => {
          const niveau = getNiveau(a.message);
          return (
            <div key={i} style={{
              background: niveau === 'critique' ? '#450a0a' : '#431407',
              color: niveau === 'critique' ? '#fca5a5' : '#fed7aa',
              padding: '8px 12px', borderRadius: 6,
              marginBottom: 6, fontSize: 12,
              borderLeft: `3px solid ${niveau === 'critique' ? '#ef4444' : '#f97316'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{a.agent_id}</strong>
                <span style={{
                  fontSize: 10, background: niveau === 'critique' ? '#ef4444' : '#f97316',
                  color: '#fff', borderRadius: 4, padding: '1px 5px'
                }}>
                  {niveau === 'critique' ? 'CRITIQUE' : 'WARNING'}
                </span>
              </div>
              <div style={{ marginTop: 3, opacity: 0.85 }}>{a.message}</div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                {new Date(a.timestamp).toLocaleString()}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}