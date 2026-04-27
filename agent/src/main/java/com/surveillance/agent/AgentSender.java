package com.surveillance.agent;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class AgentSender {

    // Adresse et ports du serveur
    private static final String SERVER_IP   = "localhost";
    private static final int    UDP_PORT    = 9000;
    private static final int    TCP_PORT    = 9001;

    // Seuils d'alerte
    private static final double CPU_SEUIL  = 80.0;
    private static final double RAM_SEUIL  = 85.0;

    // ID unique de cet agent
   private static final String AGENT_ID = getAgentId();

   private static String getAgentId() {
    try {
        return "agent-" + java.net.InetAddress.getLocalHost().getHostName();
    } catch (Exception e) {
        return "agent-unknown";
    }
}

    public static void main(String[] args) throws Exception {
        System.out.println("Agent démarré : " + AGENT_ID);

        ScheduledExecutorService scheduler = 
            Executors.newScheduledThreadPool(2);

        // Thread 1 : envoie les métriques via UDP toutes les 5 secondes
        scheduler.scheduleAtFixedRate(() -> {
            try {
                SystemMetrics metrics = SystemMetrics.collect(AGENT_ID);
                envoyerUDP(metrics.toJson());
                System.out.println("UDP envoyé → CPU: " + 
                    String.format("%.1f", metrics.getCpuUsage()) + "%" +
                    " | RAM: " + 
                    String.format("%.1f", metrics.getRamUsage()) + "%");

                // Thread 2 : vérifie les seuils et envoie alerte TCP si besoin
                if (metrics.getCpuUsage() > CPU_SEUIL || 
                    metrics.getRamUsage() > RAM_SEUIL) {
                    envoyerAlerteTCP("ALERTE " + AGENT_ID + 
                        " CPU=" + metrics.getCpuUsage() + 
                        " RAM=" + metrics.getRamUsage());
                }

            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }, 0, 5, TimeUnit.SECONDS);
    }

    // Envoie un message UDP au serveur
    private static void envoyerUDP(String message) throws Exception {
        DatagramSocket socket = new DatagramSocket();
        byte[] data = message.getBytes();
        InetAddress address = InetAddress.getByName(SERVER_IP);
        DatagramPacket packet = new DatagramPacket(
            data, data.length, address, UDP_PORT);
        socket.send(packet);
        socket.close();
    }

    // Envoie une alerte TCP au serveur
    private static void envoyerAlerteTCP(String message) throws Exception {
        Socket socket = new Socket(SERVER_IP, TCP_PORT);
        PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
        out.println(message);
        socket.close();
        System.out.println("ALERTE TCP envoyée !");
    }
}