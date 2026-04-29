package com.surveillance.server;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseManager {

    private static final String DB_URL = "jdbc:sqlite:surveillance.db";

    public static void initialiser() {
        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement stmt = conn.createStatement()) {

            stmt.execute(
                "CREATE TABLE IF NOT EXISTS agents (" +
                "id TEXT PRIMARY KEY, hostname TEXT, derniere_activite LONG)"
            );
            stmt.execute(
                "CREATE TABLE IF NOT EXISTS metrics (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, agent_id TEXT," +
                "cpu REAL, ram REAL, disk REAL, timestamp LONG)"
            );
            stmt.execute(
                "CREATE TABLE IF NOT EXISTS alertes (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, agent_id TEXT," +
                "message TEXT, timestamp LONG)"
            );
            System.out.println("Base de données initialisée");

        } catch (SQLException e) {
            System.err.println("Erreur DB : " + e.getMessage());
        }
    }

    // ─── SAUVEGARDES ───────────────────────────────────────────────────────────

    public static void sauvegarderMetrics(String agentId, double cpu,
                                          double ram, double disk) {
        String sql = "INSERT INTO metrics (agent_id,cpu,ram,disk,timestamp)" +
                     " VALUES (?,?,?,?,?)";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, agentId);
            p.setDouble(2, cpu);
            p.setDouble(3, ram);
            p.setDouble(4, disk);
            p.setLong(5, System.currentTimeMillis());
            p.executeUpdate();

            conn.createStatement().execute(
                "INSERT OR REPLACE INTO agents VALUES ('" + agentId +
                "','" + agentId + "'," + System.currentTimeMillis() + ")"
            );
        } catch (SQLException e) {
            System.err.println("Erreur sauvegarde : " + e.getMessage());
        }
    }

    public static void sauvegarderAlerte(String agentId, String message) {
        String sql = "INSERT INTO alertes (agent_id,message,timestamp)" +
                     " VALUES (?,?,?)";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, agentId);
            p.setString(2, message);
            p.setLong(3, System.currentTimeMillis());
            p.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Erreur alerte : " + e.getMessage());
        }
    }

    // ─── LECTURE AGENTS ────────────────────────────────────────────────────────

    public static String getAgentsJson() {
        StringBuilder sb = new StringBuilder("[");
        try (Connection conn = DriverManager.getConnection(DB_URL);
             ResultSet rs = conn.createStatement()
                               .executeQuery("SELECT * FROM agents")) {
            boolean first = true;
            while (rs.next()) {
                if (!first) sb.append(",");
                sb.append("{")
                  .append("\"id\":\"").append(rs.getString("id")).append("\",")
                  .append("\"derniere_activite\":")
                  .append(rs.getLong("derniere_activite"))
                  .append("}");
                first = false;
            }
        } catch (SQLException e) {
            System.err.println("Erreur agents : " + e.getMessage());
        }
        return sb.append("]").toString();
    }

    // ─── LECTURE METRICS ───────────────────────────────────────────────────────

    public static String getMetricsJson(String agentId) {
        StringBuilder sb = new StringBuilder("[");
        String sql = "SELECT * FROM metrics WHERE agent_id=?" +
                     " ORDER BY timestamp DESC LIMIT 20";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, agentId);
            ResultSet rs = p.executeQuery();
            boolean first = true;
            while (rs.next()) {
                if (!first) sb.append(",");
                sb.append("{")
                  .append("\"cpu\":").append(rs.getDouble("cpu")).append(",")
                  .append("\"ram\":").append(rs.getDouble("ram")).append(",")
                  .append("\"disk\":").append(rs.getDouble("disk")).append(",")
                  .append("\"timestamp\":").append(rs.getLong("timestamp"))
                  .append("}");
                first = false;
            }
        } catch (SQLException e) {
            System.err.println("Erreur lecture : " + e.getMessage());
        }
        return sb.append("]").toString();
    }

    // ─── LECTURE ALERTES ───────────────────────────────────────────────────────

    public static String getAlertesJson(String agentId) {
        StringBuilder sb = new StringBuilder("[");
        String sql = "SELECT * FROM alertes WHERE agent_id=?" +
                     " ORDER BY timestamp DESC LIMIT 20";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, agentId);
            ResultSet rs = p.executeQuery();
            boolean first = true;
            while (rs.next()) {
                if (!first) sb.append(",");
                sb.append("{")
                  .append("\"id\":").append(rs.getInt("id")).append(",")
                  .append("\"message\":\"").append(rs.getString("message")).append("\",")
                  .append("\"timestamp\":").append(rs.getLong("timestamp"))
                  .append("}");
                first = false;
            }
        } catch (SQLException e) {
            System.err.println("Erreur alertes : " + e.getMessage());
        }
        return sb.append("]").toString();
    }

    public static String getAllAlertesJson() {
        StringBuilder sb = new StringBuilder("[");
        String sql = "SELECT * FROM alertes ORDER BY timestamp DESC LIMIT 50";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             ResultSet rs = conn.createStatement().executeQuery(sql)) {
            boolean first = true;
            while (rs.next()) {
                if (!first) sb.append(",");
                sb.append("{")
                  .append("\"agent_id\":\"").append(rs.getString("agent_id")).append("\",")
                  .append("\"message\":\"").append(rs.getString("message")).append("\",")
                  .append("\"timestamp\":").append(rs.getLong("timestamp"))
                  .append("}");
                first = false;
            }
        } catch (SQLException e) {
            System.err.println("Erreur toutes alertes : " + e.getMessage());
        }
        return sb.append("]").toString();
    }

    // ─── STATISTIQUES ──────────────────────────────────────────────────────────

    public static String getStatsJson(String agentId) {
        String sql = "SELECT AVG(cpu) as avgCpu, AVG(ram) as avgRam," +
                     " AVG(disk) as avgDisk, MAX(cpu) as maxCpu," +
                     " MAX(ram) as maxRam, COUNT(*) as total" +
                     " FROM metrics WHERE agent_id=?";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, agentId);
            ResultSet rs = p.executeQuery();
            if (rs.next()) {
                return "{" +
                    "\"avgCpu\":"  + String.format("%.1f", rs.getDouble("avgCpu"))  + "," +
                    "\"avgRam\":"  + String.format("%.1f", rs.getDouble("avgRam"))  + "," +
                    "\"avgDisk\":" + String.format("%.1f", rs.getDouble("avgDisk")) + "," +
                    "\"maxCpu\":"  + String.format("%.1f", rs.getDouble("maxCpu"))  + "," +
                    "\"maxRam\":"  + String.format("%.1f", rs.getDouble("maxRam"))  + "," +
                    "\"total\":"   + rs.getInt("total") +
                "}";
            }
        } catch (SQLException e) {
            System.err.println("Erreur stats : " + e.getMessage());
        }
        return "{}";
    }

    // ─── EXPORT CSV ────────────────────────────────────────────────────────────

    public static String getMetricsCsv(String agentId) {
        StringBuilder sb = new StringBuilder("timestamp,cpu,ram,disk\n");
        String sql = "SELECT * FROM metrics WHERE agent_id=?" +
                     " ORDER BY timestamp DESC";
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, agentId);
            ResultSet rs = p.executeQuery();
            while (rs.next()) {
                sb.append(rs.getLong("timestamp")).append(",")
                  .append(rs.getDouble("cpu")).append(",")
                  .append(rs.getDouble("ram")).append(",")
                  .append(rs.getDouble("disk")).append("\n");
            }
        } catch (SQLException e) {
            System.err.println("Erreur CSV : " + e.getMessage());
        }
        return sb.toString();
    }
}