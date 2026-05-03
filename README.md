
# Système de Surveillance Distribué

Plateforme distribuée pour surveiller en temps réel les ressources système (CPU, RAM, Disque) de plusieurs machines distantes, avec gestion des alertes et visualisation graphique.

## Stack Technique
Agent -> Java 17, OSHI, Maven ;
Serveur -> Spark Java, SQLite, RMI ;
Frontend -> React 18, Recharts, Axios 

## Fonctionnalités

- Collecte CPU / RAM / Disque via OSHI toutes les 5 secondes (UDP)
- Alertes critiques automatiques via TCP (CPU > 80%, RAM > 85%)
- Java RMI avec interface MonitoringService
- API REST 6 routes (Spark Java)
- Dashboard temps réel avec graphiques dynamiques
- Historique, statistiques, filtrage et recherche des agents
- Gestion des utilisateurs (Admin / Viewer)
- Export des données en CSV, JSON et HTML

## Démarrage rapide
# Serveur
cd server && mvn package -DskipTests
&& java -jar target/server-1.0-SNAPSHOT.jar

# Agent (nouveau terminal)
cd agent
&& java -jar target/agent-1.0-SNAPSHOT.jar

# Frontend (nouveau terminal)
cd frontend && npm install && npm start

plateforme est accessible via : `http://localhost:3000`

## Ports

9000 UDP ---> Métriques Agent et Serveur ;
9001 TCP ---> Alertes critiques ;
1099 RMI ---> Services Java distants ;
8080 HTTP ---> API REST ;
3000 HTTP ---> Interface React ;

