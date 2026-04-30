import { useState } from 'react';
import { login } from '../api/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f3ff',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 16,
        padding: '40px', width: 360,
        boxShadow: '0 25px 50px rgba(109,40,217,0.15)',
        border: '1px solid #ddd6fe'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#7c3aed', margin: 0, fontSize: 24,
                       fontWeight: 'bold' }}>
            Surveillance
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 0' }}>
            Systeme de surveillance distribue
          </p>
        </div>

        {/* Champ username */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#6d28d9', fontSize: 12,
                          display: 'block', marginBottom: 6,
                          fontWeight: 'bold' }}>
            Nom d'utilisateur
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="fatima ou aichetou"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #ddd6fe', background: '#faf5ff',
              color: '#1e293b', fontSize: 14, boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        {/* Champ password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#6d28d9', fontSize: 12,
                          display: 'block', marginBottom: 6,
                          fontWeight: 'bold' }}>
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #ddd6fe', background: '#faf5ff',
              color: '#1e293b', fontSize: 14, boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: '#fee2e2', color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '8px 12px', borderRadius: 8,
            fontSize: 13, marginBottom: 16, textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Bouton login */}
        <button onClick={handleLogin} disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 8,
            border: 'none',
            background: loading ? '#ddd6fe' : '#7c3aed',
            color: '#fff', fontSize: 15, fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(124,58,237,0.3)'
          }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        {/* Comptes disponibles */}
        <div style={{
          marginTop: 24, background: '#faf5ff',
          borderRadius: 8, padding: 12,
          border: '1px solid #ddd6fe'
        }}>
          <div style={{ color: '#7c3aed', fontSize: 11,
                        marginBottom: 8, textAlign: 'center',
                        fontWeight: 'bold' }}>
            Cliquez sur un compte pour remplir automatiquement
          </div>
          {[
            { user: 'fatima',   pass: 'fatima123',   role: 'admin1', color: '#7c3aed' },
            { user: 'aichetou', pass: 'aichetou123', role: 'admin2', color: '#6d28d9' },
          ].map((c, i) => (
            <div key={i}
              onClick={() => { setUsername(c.user); setPassword(c.pass); }}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '6px 10px',
                borderRadius: 6, marginBottom: 4,
                cursor: 'pointer', background: '#ede9fe',
                border: '1px solid #ddd6fe'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ddd6fe'}
              onMouseLeave={e => e.currentTarget.style.background = '#ede9fe'}>
              <span style={{ fontSize: 12, color: '#1e293b', fontWeight: '500' }}>
                {c.user} / {c.pass}
              </span>
              <span style={{
                fontSize: 10, background: c.color,
                color: '#fff', borderRadius: 20, padding: '2px 8px',
                fontWeight: 'bold'
              }}>
                {c.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}