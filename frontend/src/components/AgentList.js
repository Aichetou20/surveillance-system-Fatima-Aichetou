import { useState } from 'react';

export default function AgentList({ agents, selected, onSelect }) {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('tous');
  const [sortBy,  setSortBy]  = useState('nom');

  const isOnline = (ts) => Date.now() - ts < 15000;

  const filtered = agents
    .filter(a => {
      if (filter === 'online')  return  isOnline(a.derniere_activite);
      if (filter === 'offline') return !isOnline(a.derniere_activite);
      return true;
    })
    .filter(a => a.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'nom')      return a.id.localeCompare(b.id);
      if (sortBy === 'activite') return b.derniere_activite - a.derniere_activite;
      return 0;
    });

  const onlineCount  = agents.filter(a =>  isOnline(a.derniere_activite)).length;
  const offlineCount = agents.filter(a => !isOnline(a.derniere_activite)).length;

  return (
    <div>
      {/* Titre + compteurs */}
      <h3 style={{ marginBottom: 10, color: '#1e293b', fontSize: 15 }}>
        Agents ({agents.length})
      </h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span style={{ background: '#dcfce7', color: '#16a34a',
                       borderRadius: 20, padding: '2px 8px', fontSize: 11,
                       fontWeight: 'bold', border: '1px solid #bbf7d0' }}>
          ● {onlineCount} en ligne
        </span>
        <span style={{ background: '#fee2e2', color: '#dc2626',
                       borderRadius: 20, padding: '2px 8px', fontSize: 11,
                       fontWeight: 'bold', border: '1px solid #fecaca' }}>
          ● {offlineCount} hors ligne
        </span>
      </div>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un agent..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: 8,
          border: '1px solid #cbd5e1', background: '#f8fafc',
          color: '#1e293b', fontSize: 13, marginBottom: 8,
          boxSizing: 'border-box', outline: 'none'
        }}
      />

      {/* Filtre statut */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {['tous', 'online', 'offline'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '4px 0', borderRadius: 6,
              border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 11,
              background: filter === f ? '#2563eb' : '#f1f5f9',
              color: filter === f ? '#fff' : '#64748b',
              fontWeight: filter === f ? 'bold' : 'normal'
            }}>
            {f === 'tous' ? 'Tous' : f === 'online' ? '🟢 En ligne' : '🔴 Hors ligne'}
          </button>
        ))}
      </div>

      {/* Tri */}
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        style={{
          width: '100%', padding: '6px 10px', borderRadius: 8,
          border: '1px solid #cbd5e1', background: '#f8fafc',
          color: '#1e293b', fontSize: 12, marginBottom: 12,
          outline: 'none'
        }}>
        <option value="nom">Trier par nom</option>
        <option value="activite">Trier par activite recente</option>
      </select>

      {/* Liste agents */}
      {filtered.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
          Aucun agent trouve
        </p>
      ) : (
        filtered.map(agent => (
          <div key={agent.id}
            onClick={() => onSelect(agent.id)}
            style={{
              padding: '10px 15px', marginBottom: 8,
              borderRadius: 8, cursor: 'pointer',
              background: selected === agent.id ? '#eff6ff' : '#f8fafc',
              color: '#1e293b', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
              border: selected === agent.id
                ? '2px solid #2563eb' : '2px solid #e2e8f0',
              boxShadow: selected === agent.id
                ? '0 2px 8px rgba(37,99,235,0.15)' : 'none'
            }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold',
                            color: selected === agent.id ? '#2563eb' : '#1e293b' }}>
                {agent.id}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {new Date(agent.derniere_activite).toLocaleTimeString()}
              </div>
            </div>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: isOnline(agent.derniere_activite) ? '#22c55e' : '#ef4444',
              display: 'inline-block', flexShrink: 0
            }} />
          </div>
        ))
      )}
    </div>
  );
}