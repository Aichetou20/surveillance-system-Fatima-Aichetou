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
                  background: '#0f172a', color: '#f1f5f9',
                  fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: 260, background: '#1e293b',
                    padding: 20, overflowY: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: '#60a5fa', margin: '0 0 12px' }}>
            Surveillance
          </h2>
          <div style={{
            background: '#0f172a', borderRadius: 8,
            padding: '10px 12px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold' }}>
                {user?.role === 'admin' ? '' : ''} {user?.nom}
              </div>
              <div style={{
                fontSize: 10, marginTop: 2,
                color: user?.role === 'admin' ? '#a78bfa' : '#38bdf8'
              }}>
                {user?.role === 'admin' ? 'Administrateur' : 'Observateur'}
              </div>
            </div>
            <button onClick={handleLogout}
              style={{
                background: '#450a0a', color: '#fca5a5',
                border: 'none', borderRadius: 6,
                padding: '4px 8px', cursor: 'pointer', fontSize: 11
              }}>
              Deconnexion
            </button>
          </div>
        </div>

        <AgentList agents={agents} selected={selected}
                   onSelect={setSelected} />
        <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
        <AlertsPanel alertes={alertes} />
      </div>

      {/* Contenu principal */}
      <div style={{ flex: 1, padding: 30, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0 }}>
              Dashboard — {selected || 'Sélectionnez un agent'}
            </h2>
            {stats.total && (
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                 {stats.total} mesures enregistrées
              </div>
            )}
          </div>

          {/* Boutons export — admin seulement */}
          {selected && isAdmin() ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowExport(!showExport)}
                style={{
                  background: '#3b82f6', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 14
                }}>
                 Exporter ▾
              </button>

              {/* Dropdown export */}
              {showExport && (
                <div style={{
                  position: 'absolute', right: 0, top: 42,
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: 10, padding: 8, zIndex: 100,
                  minWidth: 180, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                }}>
                  {[
                    { label: ' CSV',  desc: 'Données brutes',     fn: () => { exportCsv(selected);                        setShowExport(false); } },
                    { label: ' JSON', desc: 'Format structuré',   fn: () => { exportJson(selected, metrics, stats);        setShowExport(false); } },
                    { label: 'HTML', desc: 'Rapport complet',    fn: () => { exportHtml(selected, metrics, stats);        setShowExport(false); } },
                  ].map((opt, i) => (
                    <div key={i} onClick={opt.fn}
                      style={{
                        padding: '10px 12px', borderRadius: 8,
                        cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#334155'}
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
              background: '#1e293b', color: '#64748b',
              border: '1px solid #334155', padding: '8px 16px',
              borderRadius: 8, fontSize: 13
            }}>
               Export réservé à l'admin
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <StatsCard title="CPU actuel"
            value={latest.cpu?.toFixed(1) ?? '--'} unit="%"
            color="#dc2626"
            subtitle={`Max: ${stats.maxCpu ?? '--'}%`} />
          <StatsCard title="RAM actuelle"
            value={latest.ram?.toFixed(1) ?? '--'} unit="%"
            color="#2563eb"
            subtitle={`Max: ${stats.maxRam ?? '--'}%`} />
          <StatsCard title="Disque"
            value={latest.disk?.toFixed(1) ?? '--'} unit="%"
            color="#059669"
            subtitle={`Moy: ${stats.avgDisk ?? '--'}%`} />
          <StatsCard title="Moy. CPU"
            value={stats.avgCpu ?? '--'} unit="%"
            color="#7c3aed"
            subtitle={`Sur ${stats.total ?? 0} mesures`} />
        </div>

        {/* Graphique */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px' }}> Métriques & Historique</h3>
          {metrics.length > 0
            ? <MetricsChart data={metrics} stats={stats} />
            : <p style={{ color: '#94a3b8' }}>En attente de données...</p>}
        </div>
      </div>
    </div>
  );
}