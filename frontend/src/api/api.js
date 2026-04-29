import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

axios.defaults.headers.common['Content-Type'] = 'application/json';

export const getAgents = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/agents`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    throw error;
  }
};

export const getMetrics = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/metrics/${id}`);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la recuperation des metriques pour ${id}:`, error);
    throw error;
  }
};

export const getAlertes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/alertes`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la recuperation des alertes:', error);
    throw error;
  }
};

export const getStats = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/stats/${id}`);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la recuperation des stats pour ${id}:`, error);
    throw error;
  }
};


// Export CSV via le serveur Java
export const exportCsv = (id) => {
  window.open(`${BASE_URL}/export/${id}`, '_blank');
};

// Export JSON depuis les donnees en memoire
export const exportJson = (agentId, metrics, stats) => {
  const data = {
    agent: agentId,
    exportDate: new Date().toISOString(),
    stats,
    metrics
  };
  const blob = new Blob([JSON.stringify(data, null, 2)],
                        { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `metrics_${agentId}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export rapport HTML
export const exportHtml = (agentId, metrics, stats) => {
  const rows = metrics.map(m => `
    <tr>
      <td>${new Date(m.timestamp).toLocaleString()}</td>
      <td style="color:${m.cpu > 80 ? '#ef4444' : '#22c55e'}">${m.cpu.toFixed(1)}%</td>
      <td style="color:${m.ram > 85 ? '#ef4444' : '#22c55e'}">${m.ram.toFixed(1)}%</td>
      <td>${m.disk.toFixed(1)}%</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport — ${agentId}</title>
  <style>
    body { font-family: sans-serif; background: #0f172a;
           color: #f1f5f9; padding: 30px; }
    h1   { color: #60a5fa; }
    .cards { display: flex; gap: 16px; margin: 20px 0; }
    .card  { background: #1e293b; border-radius: 10px;
             padding: 16px; flex: 1; text-align: center; }
    .card .val { font-size: 28px; font-weight: bold; color: #60a5fa; }
    .card .lbl { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #1e3a5f; color: #93c5fd; padding: 10px; text-align: left; }
    td { padding: 8px 10px; border-bottom: 1px solid #1e293b; }
    tr:hover { background: #1e293b; }
    .footer { margin-top: 20px; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Rapport de surveillance</h1>
  <p>Agent : <strong>${agentId}</strong> — 
     Généré le : <strong>${new Date().toLocaleString()}</strong></p>

  <div class="cards">
    <div class="card">
      <div class="val">${stats.avgCpu ?? '--'}%</div>
      <div class="lbl">Moyenne CPU</div>
    </div>
    <div class="card">
      <div class="val">${stats.avgRam ?? '--'}%</div>
      <div class="lbl">Moyenne RAM</div>
    </div>
    <div class="card">
      <div class="val">${stats.maxCpu ?? '--'}%</div>
      <div class="lbl">Pic CPU</div>
    </div>
    <div class="card">
      <div class="val">${stats.total ?? 0}</div>
      <div class="lbl">Total mesures</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date & Heure</th>
        <th>CPU</th>
        <th>RAM</th>
        <th>Disque</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    Systeme de surveillance distribue — Export automatique
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `rapport_${agentId}_${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

//Seuil

export const getSeuils = () => {
  const saved = localStorage.getItem('seuils');
  return saved ? JSON.parse(saved) : { cpu: 80, ram: 85, disk: 90 };
};

export const saveSeuils = (seuils) => {
  localStorage.setItem('seuils', JSON.stringify(seuils));
};

//authentification

const USERS = [
  { id: 1, username: 'fatima',  password: 'fatima123',  role: 'admin',  nom: 'Administrateur' },
  { id: 2, username: 'aichetou', password: 'aichetou123', role: 'viewer', nom: 'Observateur'     },
];

export const login = (username, password) => {
  const user = USERS.find(
    u => u.username === username && u.password === password
  );
  if (user) {
    const { password: _, ...userSafe } = user;
    localStorage.setItem('currentUser', JSON.stringify(userSafe));
    return { success: true, user: userSafe };
  }
  return { success: false, message: 'Identifiants incorrects' };
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  const saved = localStorage.getItem('currentUser');
  return saved ? JSON.parse(saved) : null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};