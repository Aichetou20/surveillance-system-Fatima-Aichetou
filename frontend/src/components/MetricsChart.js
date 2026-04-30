import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function MetricsChart({ data, stats }) {
  const [vue, setVue] = useState('temps-reel');

  const formatted = [...data].reverse().map((m) => ({
    name: new Date(m.timestamp).toLocaleTimeString(),
    CPU:  parseFloat(m.cpu.toFixed(1)),
    RAM:  parseFloat(m.ram.toFixed(1)),
    Disk: parseFloat(m.disk.toFixed(1)),
  }));

  const statsData = stats ? [
    { name: 'CPU',    Moyenne: parseFloat(stats.avgCpu),  Maximum: parseFloat(stats.maxCpu) },
    { name: 'RAM',    Moyenne: parseFloat(stats.avgRam),  Maximum: parseFloat(stats.maxRam) },
    { name: 'Disque', Moyenne: parseFloat(stats.avgDisk), Maximum: 0 },
  ] : [];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'temps-reel', label: ' Temps réel'   },
          { id: 'barres',     label: ' Statistiques' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setVue(tab.id)}
            style={{
              padding: '6px 14px', borderRadius: 8,
              border: vue === tab.id ? '2px solid #2563eb' : '2px solid #e2e8f0',
              cursor: 'pointer', fontSize: 12,
              background: vue === tab.id ? '#2563eb' : '#f8fafc',
              color: vue === tab.id ? '#fff' : '#64748b',
              fontWeight: vue === tab.id ? 'bold' : 'normal'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vue Temps réel */}
      {vue === 'temps-reel' && (
        <>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
             {data.length} mesures — mise à jour toutes les 5 secondes
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={formatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} unit="%"
                tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8, fontSize: 12,
                  color: '#1e293b',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="CPU"
                stroke="#ef4444" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="RAM"
                stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Disk"
                stroke="#10b981" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* Vue Statistiques */}
      {vue === 'barres' && (
        <>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
            Basé sur {stats?.total ?? 0} mesures enregistrées
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} unit="%"
                tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8, fontSize: 12,
                  color: '#1e293b',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="Moyenne" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Maximum" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Tableau récapitulatif */}
          <div style={{
            marginTop: 16, background: '#f8fafc',
            borderRadius: 8, overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            <table style={{ width: '100%',
                            borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#eff6ff' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left',
                               color: '#2563eb', fontWeight: 'bold' }}>
                    Métrique
                  </th>
                  <th style={{ padding: '8px 12px', textAlign: 'center',
                               color: '#2563eb', fontWeight: 'bold' }}>
                    Moyenne
                  </th>
                  <th style={{ padding: '8px 12px', textAlign: 'center',
                               color: '#2563eb', fontWeight: 'bold' }}>
                    Maximum
                  </th>
                  <th style={{ padding: '8px 12px', textAlign: 'center',
                               color: '#2563eb', fontWeight: 'bold' }}>
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: ' CPU',    avg: stats?.avgCpu,  max: stats?.maxCpu, seuil: 80 },
                  { label: ' RAM',    avg: stats?.avgRam,  max: stats?.maxRam, seuil: 85 },
                  { label: ' Disque', avg: stats?.avgDisk, max: null,          seuil: 90 },
                ].map((row, i) => (
                  <tr key={i} style={{
                    borderTop: '1px solid #e2e8f0',
                    background: i % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}>
                    <td style={{ padding: '8px 12px',
                                 color: '#1e293b', fontWeight: '500' }}>
                      {row.label}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center',
                                 color: row.avg > row.seuil ? '#dc2626' : '#16a34a',
                                 fontWeight: 'bold' }}>
                      {row.avg ?? '--'}%
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center',
                                 color: row.max > row.seuil ? '#dc2626' : '#16a34a',
                                 fontWeight: 'bold' }}>
                      {row.max ? `${row.max}%` : '--'}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span style={{
                        background: row.avg > row.seuil ? '#fee2e2' : '#dcfce7',
                        color:      row.avg > row.seuil ? '#dc2626' : '#16a34a',
                        border: `1px solid ${row.avg > row.seuil ? '#fecaca' : '#bbf7d0'}`,
                        borderRadius: 20, padding: '2px 8px', fontSize: 11,
                        fontWeight: 'bold'
                      }}>
                        {row.avg > row.seuil ? 'Élevé' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}