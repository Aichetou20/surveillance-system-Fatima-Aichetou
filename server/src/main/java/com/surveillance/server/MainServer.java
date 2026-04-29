package com.surveillance.server;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

import com.surveillance.server.rmi.MonitoringService;
import com.surveillance.server.rmi.MonitoringServiceImpl;

import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.options;
import static spark.Spark.port;


public class MainServer {

    public static void main(String[] args) {
        // 1. Base de données
        DatabaseManager.initialiser();

        // 2. UDP
        Thread udpThread = new Thread(new UdpReceiver());
        udpThread.start();

        // 3. TCP Alertes
        Thread tcpThread = new Thread(() -> {
            try (ServerSocket server = new ServerSocket(9001)) {
                System.out.println("Serveur TCP démarré sur port 9001");
                while (true) {
                    Socket client = server.accept();
                    BufferedReader in = new BufferedReader(
                        new InputStreamReader(client.getInputStream()));
                    String alerte = in.readLine();
                    // Extraire l'agent ID du message
                    String agentId = alerte.contains("ALERTE ") ?
                        alerte.split(" ")[1] : "agent-unknown";
                    System.out.println("ALERTE reçue : " + alerte);
                    DatabaseManager.sauvegarderAlerte(agentId, alerte);
                    client.close();
                }
            } catch (Exception e) {
                System.err.println("Erreur TCP : " + e.getMessage());
            }
        });
        tcpThread.start();

        // 4. RMI
        try {
            Registry registry = LocateRegistry.createRegistry(1099);
            MonitoringService service = new MonitoringServiceImpl();
            registry.rebind("MonitoringService", service);
            System.out.println("RMI démarré sur port 1099");
        } catch (Exception e) {
            System.err.println("Erreur RMI : " + e.getMessage());
        }

        // 5. API REST
        port(8080);

        // CORS
        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
        });
        options("/*", (req, res) -> "OK");

        // Routes existantes
        get("/agents", (req, res) -> {
            res.type("application/json");
            return DatabaseManager.getAgentsJson();
        });

        get("/metrics/:id", (req, res) -> {
            res.type("application/json");
            return DatabaseManager.getMetricsJson(req.params(":id"));
        });

        // Nouvelles routes
        get("/alertes", (req, res) -> {
            res.type("application/json");
            return DatabaseManager.getAllAlertesJson();
        });

        get("/alertes/:id", (req, res) -> {
            res.type("application/json");
            return DatabaseManager.getAlertesJson(req.params(":id"));
        });

        get("/stats/:id", (req, res) -> {
            res.type("application/json");
            return DatabaseManager.getStatsJson(req.params(":id"));
        });

        get("/export/:id", (req, res) -> {
            res.type("text/csv");
            res.header("Content-Disposition",
                "attachment; filename=metrics_" + req.params(":id") + ".csv");
            return DatabaseManager.getMetricsCsv(req.params(":id"));
        });

        System.out.println("API REST démarrée sur http://localhost:8080");
    }
}