package com.surveillance.agent;

import com.google.gson.Gson;

import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.software.os.OSFileStore;

public class SystemMetrics {

    private String agentId;
    private double cpuUsage;
    private double ramUsage;
    private double diskUsage;
    private long timestamp;

    // Collecte toutes les metriques de la machine
    public static SystemMetrics collect(String agentId) {
        SystemInfo si = new SystemInfo();
        SystemMetrics metrics = new SystemMetrics();
        metrics.agentId = agentId;
        metrics.timestamp = System.currentTimeMillis();

        // CPU
        CentralProcessor cpu = si.getHardware().getProcessor();
        long[] prevTicks = cpu.getSystemCpuLoadTicks();
        try { Thread.sleep(1000); } catch (InterruptedException e) {}
        metrics.cpuUsage = cpu.getSystemCpuLoadBetweenTicks(prevTicks) * 100;

        // RAM
        GlobalMemory ram = si.getHardware().getMemory();
        long used = ram.getTotal() - ram.getAvailable();
        metrics.ramUsage = (double) used / ram.getTotal() * 100;

        // DISQUE
        OSFileStore disk = si.getOperatingSystem().getFileSystem()
                            .getFileStores().get(0);
        long usedDisk = disk.getTotalSpace() - disk.getUsableSpace();
        metrics.diskUsage = (double) usedDisk / disk.getTotalSpace() * 100;

        return metrics;
    }

    // Convertit en JSON pour envoyer au serveur
    public String toJson() {
        return new Gson().toJson(this);
    }

    // Getters
    public double getCpuUsage()  { return cpuUsage; }
    public double getRamUsage()  { return ramUsage; }
    public double getDiskUsage() { return diskUsage; }
    public String getAgentId()   { return agentId; }
}