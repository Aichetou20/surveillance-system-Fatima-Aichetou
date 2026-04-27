package com.surveillance.server;

import static spark.Spark.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class MainServer {

    public static void main(String[] args) {
        // 1. Initialiser la base de données
        DatabaseManager.initialiser();

        // 2. Démarrer le récepteur UDP dans un Thread
        Thread udpThread = new Thread(new UdpReceiver());
        udpThread.start();

        // 3. Démarrer le serveur TCP pour les alertes
        Thread tcpThread = new Thread(() -> {
            try (ServerSocket server = new ServerSocket(9001)) {
                System.out.println("Serveur TCP démarré sur port 9001");
                while (true) {
                    Socket client = server.accept();
                    BufferedReader in = new BufferedReader(
                        new InputStreamReader(client.getInputStream()));
                    String alerte = in.readLine();
                    System.out.println("ALERTE reçue : " + alerte);
                    DatabaseManager.sauvegarderAlerte("agent", alerte);
                    client.close();
                }
            } catch (Exception e) {
                System.err.println("Erreur TCP : " + e.getMessage());
            }
        });
        tcpThread.start();

        // 4. Démarrer l'API REST sur port 8080
        port(8080);

        // CORS pour React
        before((req, res) -> res.header("Access-Control-Allow-Origin", "*"));

        // Routes API
        get("/agents", (req, res) -> {
            res.type("application/json");
            return DatabaseManager.getAgentsJson();
        });

        get("/metrics/:id", (req, res) -> {
            res.type("application/json");
            return DatabaseManager.getMetricsJson(req.params(":id"));
        });

        System.out.println("API REST démarrée sur http://localhost:8080");
    }
}