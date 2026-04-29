package com.surveillance.server.rmi;

import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;

import com.surveillance.server.DatabaseManager;

public class MonitoringServiceImpl extends UnicastRemoteObject 
                                   implements MonitoringService {

    public MonitoringServiceImpl() throws RemoteException {
        super();
    }

    @Override
    public String getAgents() throws RemoteException {
        return DatabaseManager.getAgentsJson();
    }

    @Override
    public String getMetrics(String agentId) throws RemoteException {
        return DatabaseManager.getMetricsJson(agentId);
    }

    @Override
    public String getAlertes(String agentId) throws RemoteException {
        return DatabaseManager.getAlertesJson(agentId);
    }

    @Override
    public String getStats(String agentId) throws RemoteException {
        return DatabaseManager.getStatsJson(agentId);
    }
}