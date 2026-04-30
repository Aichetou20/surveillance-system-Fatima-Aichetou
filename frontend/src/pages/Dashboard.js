import { useState, useEffect } from 'react';
import { getAgents, getMetrics, getAlertes, getStats,
         exportCsv, exportJson, exportHtml,
         logout, isAdmin } from '../api/api';
import AgentList    from '../components/AgentList';
import MetricsChart from '../components/MetricsChart';
import AlertsPanel  from '../components/AlertsPanel';
import StatsCard    from '../components/StatsCard';

export default function Dashboard({ user, onLogout }) {
  const [agents,      setAgents]      = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [metrics,     setMetrics]     = useState([]);
  const [alertes,     setAlertes]     = useState([]);
  const [stats,       setStats]       = useState({});
  const [showExport,  setShowExport]  = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      const res = await getAgents();
      setAgents(res.data);
      setSelected(prev => prev ?? (res.data.length > 0 ? res.data[0].id : null));
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const fetchData = async () => {
      const [m, s] = await Promise.all([
        getMetrics(selected),
        getStats(selected)
      ]);
      setMetrics(m.data);
      setStats(s.data);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    const fetchAlertes = async () => {
      const res = await getAlertes();
      setAlertes(res.data);
    };
    fetchAlertes();
    const interval = setInterval(fetchAlertes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); onLogout(); };
  const latest = metrics[0] || {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh',
                  background: '#ddd6fe', color: '#1e293b',
                  fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: 260, background: '#ede9fe',
                    padding: 20, overflowY: 'auto',
                    borderRight: '1px solid #e2e8f0',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}>

        {/* Logo + user */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: '#2563eb', margin: '0 0 12px',
                       fontSize: 20, fontWeight: 'bold' }}>
            Surveillance
          </h2>
          <div style={{
            background: '#f8fafc', borderRadius: 8,
            padding: '10px 12px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold',
                            color: '#1e293b' }}>
                {user?.nom}
              </div>
              <div style={{
                fontSize: 10, marginTop: 2,
                color: user?.role === 'admin' ? '#7c3aed' : '#0891b2'
              }}>
                {user?.role === 'admin' ? 'Administrateur' : 'Observateur'}
              </div>
            </div>
            <button onClick={handleLogout}
              style={{
                background: '#fee2e2', color: '#dc2626',
                border: '1px solid #fecaca', borderRadius: 6,
                padding: '4px 8px', cursor: 'pointer', fontSize: 11,
                fontWeight: 'bold'
              }}>
              Deconnexion
            </button>
          </div>
        </div>

        <AgentList agents={agents} selected={selected}
                   onSelect={setSelected} />
        <hr style={{ borderColor: '#e2e8f0', margin: '20px 0' }} />
        <AlertsPanel alertes={alertes} />
      </div>

      {/* Contenu principal */}
      <div style={{ flex: 1, padding: 30, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: 22 }}>
              Dashboard — {selected || 'Selectionnez un agent'}
            </h2>
            {stats.total && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {stats.total} mesures enregistrees
              </div>
            )}
          </div>

          {/* Boutons export */}
          {selected && isAdmin() ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowExport(!showExport)}
                style={{
                  background: '#2563eb', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 14, fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
                }}>
                Exporter ▾
              </button>

              {showExport && (
                <div style={{
                  position: 'absolute', right: 0, top: 42,
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: 8, zIndex: 100,
                  minWidth: 180, boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
                }}>
                  {[
                    { label: 'CSV',  desc: 'Donnees brutes',   fn: () => { exportCsv(selected);                 setShowExport(false); } },
                    { label: 'JSON', desc: 'Format structure', fn: () => { exportJson(selected, metrics, stats); setShowExport(false); } },
                    { label: 'HTML', desc: 'Rapport complet',  fn: () => { exportHtml(selected, metrics, stats); setShowExport(false); } },
                  ].map((opt, i) => (
                    <div key={i} onClick={opt.fn}
                      style={{
                        padding: '10px 12px', borderRadius: 8,
                        cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        color: '#1e293b'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#ddd6fe'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontWeight: 'bold', fontSize: 13 }}>
                        {opt.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {opt.desc}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selected && (
            <div style={{
              background: '#f1f5f9', color: '#94a3b8',
              border: '1px solid #e2e8f0', padding: '8px 16px',
              borderRadius: 8, fontSize: 13
            }}>
              Export reserve a l'admin
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <StatsCard title="CPU actuel"
            value={latest.cpu?.toFixed(1) ?? '--'} unit="%"
            color="#ef4444"
            subtitle={`Max: ${stats.maxCpu ?? '--'}%`} />
          <StatsCard title="RAM actuelle"
            value={latest.ram?.toFixed(1) ?? '--'} unit="%"
            color="#3b82f6"
            subtitle={`Max: ${stats.maxRam ?? '--'}%`} />
          <StatsCard title="Disque"
            value={latest.disk?.toFixed(1) ?? '--'} unit="%"
            color="#10b981"
            subtitle={`Moy: ${stats.avgDisk ?? '--'}%`} />
          <StatsCard title="Moy. CPU"
            value={stats.avgCpu ?? '--'} unit="%"
            color="#8b5cf6"
            subtitle={`Sur ${stats.total ?? 0} mesures`} />
        </div>

        {/* Graphique */}
        <div style={{ background: '#ffffff', borderRadius: 12,
                      padding: 24, border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>
            Metriques & Historique
          </h3>
          {metrics.length > 0
            ? <MetricsChart data={metrics} stats={stats} />
            : <p style={{ color: '#94a3b8' }}>En attente de donnees...</p>}
        </div>
      </div>
    </div>
  );
}