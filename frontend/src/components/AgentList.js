import { useState } from 'react';

export default function AgentList({ agents, selected, onSelect }) {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('tous'); // tous | online | offline
  const [sortBy,  setSortBy]  = useState('nom');  // nom | activite

  const isOnline = (ts) => Date.now() - ts < 15000;

  // 1. Filtrage par statut
  const filtered = agents
    .filter(a => {
      if (filter === 'online')  return  isOnline(a.derniere_activite);
      if (filter === 'offline') return !isOnline(a.derniere_activite);
      return true;
    })
    // 2. Recherche par nom
    .filter(a => a.id.toLowerCase().includes(search.toLowerCase()))
    // 3. Tri
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
      <h3 style={{ marginBottom: 10 }}>Agents ({agents.length})</h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span style={{ background: '#14532d', color: '#86efac',
                       borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>
          ● {onlineCount} en ligne
        </span>
        <span style={{ background: '#450a0a', color: '#fca5a5',
                       borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>
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
          border: '1px solid #334155', background: '#0f172a',
          color: '#f1f5f9', fontSize: 13, marginBottom: 8,
          boxSizing: 'border-box'
        }}
      />

      {/* Filtre statut */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {['tous', 'online', 'offline'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '4px 0', borderRadius: 6,
              border: 'none', cursor: 'pointer', fontSize: 11,
              background: filter === f ? '#3b82f6' : '#334155',
              color: '#fff'
            }}>
            {f === 'tous' ? 'Tous' : f === 'online' ? ' En ligne' : ' Hors ligne'}
          </button>
        ))}
      </div>

      {/* Tri */}
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        style={{
          width: '100%', padding: '6px 10px', borderRadius: 8,
          border: '1px solid #334155', background: '#0f172a',
          color: '#f1f5f9', fontSize: 12, marginBottom: 12
        }}>
        <option value="nom">Trier par nom</option>
        <option value="activite">Trier par activite recente</option>
      </select>

      {/* Liste des agents filtrés */}
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
              background: selected === agent.id ? '#1d4ed8' : '#0f172a',
              color: '#fff', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
              border: selected === agent.id
                ? '2px solid #60a5fa' : '2px solid #334155'
            }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold' }}>{agent.id}</div>
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