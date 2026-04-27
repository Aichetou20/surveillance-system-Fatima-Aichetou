package com.surveillance.server;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UdpReceiver implements Runnable {

    private static final int UDP_PORT = 9000;

    @Override
    public void run() {
        try (DatagramSocket socket = new DatagramSocket(UDP_PORT)) {
            System.out.println("Serveur UDP démarré sur port " + UDP_PORT);
            byte[] buffer = new byte[4096];

            while (true) {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.receive(packet);

                String message = new String(packet.getData(), 0, packet.getLength());
                System.out.println("UDP reçu : " + message);

                // Parser le JSON reçu
                JsonObject json = JsonParser.parseString(message).getAsJsonObject();
                String agentId = json.get("agentId").getAsString();
                double cpu     = json.get("cpuUsage").getAsDouble();
                double ram     = json.get("ramUsage").getAsDouble();
                double disk    = json.get("diskUsage").getAsDouble();

                // Sauvegarder en base
                DatabaseManager.sauvegarderMetrics(agentId, cpu, ram, disk);
            }

        } catch (Exception e) {
            System.err.println("Erreur UDP : " + e.getMessage());
        }
    }
}