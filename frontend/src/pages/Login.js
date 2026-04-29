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
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 16,
        padding: '40px', width: 360,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#60a5fa', margin: 0, fontSize: 22 }}>
            Surveillance
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 0' }}>
            Systeme de surveillance distribue
          </p>
        </div>

        {/* Champ username */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#94a3b8', fontSize: 12,
                          display: 'block', marginBottom: 6 }}>
             Nom d'utilisateur
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="admin1 ou admin2"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #334155', background: '#0f172a',
              color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Champ password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#94a3b8', fontSize: 12,
                          display: 'block', marginBottom: 6 }}>
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
              border: '1px solid #334155', background: '#0f172a',
              color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: '#450a0a', color: '#fca5a5',
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
            border: 'none', background: loading ? '#334155' : '#3b82f6',
            color: '#fff', fontSize: 15, fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'Connexion...' : ' Se connecter'}
        </button>

        {/* Comptes disponibles */}
        <div style={{
          marginTop: 24, background: '#0f172a',
          borderRadius: 8, padding: 12
        }}>
          <div style={{ color: '#64748b', fontSize: 11,
                        marginBottom: 8, textAlign: 'center' }}>
             Cliquez sur un compte pour remplir automatiquement
          </div>
          {[
            { user: 'fatima',  pass: 'fatima123',  role: ' admin1',   color: '#7c3aed' },
            { user: 'aichetou', pass: 'aichetou123', role: ' admin2',  color: '#0891b2' },
          ].map((c, i) => (
            <div key={i}
              onClick={() => { setUsername(c.user); setPassword(c.pass); }}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '6px 10px',
                borderRadius: 6, marginBottom: 4,
                cursor: 'pointer', background: '#1e293b',
                border: '1px solid #334155'
              }}>
              <span style={{ fontSize: 12, color: '#f1f5f9' }}>
                {c.user} / {c.pass}
              </span>
              <span style={{
                fontSize: 10, background: c.color,
                color: '#fff', borderRadius: 20, padding: '2px 8px'
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