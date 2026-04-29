package com.surveillance.server.rmi;
import java.rmi.Remote;
import java.rmi.RemoteException;

public interface MonitoringService extends Remote {
    String getAgents() throws RemoteException;
    String getMetrics(String agentId) throws RemoteException;
    String getAlertes(String agentId) throws RemoteException;
    String getStats(String agentId) throws RemoteException;
}
