import { useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { useProject } from '@/contexts/ProjectContext';

export interface TestRunEvent {
    runId: number;
    status: 'Healthy' | 'Unhealthy';
    projectId: number;
    projectName: string;
    totalTests: number;
    failCount: number;
    type: 'NEW_RUN' | 'UPDATE';
}

type MessageHandler = (event: TestRunEvent) => void;

export function useWebSocket(onMessage: MessageHandler) {
    const { currentProject } = useProject();
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // 1. If no project selected, don't connect
        if (!currentProject) return;

        // 2. Initialize Client
        // We use the standard WebSocket URL.
        // Note: Since we used .withSockJS() in backend, the raw websocket path is usually /ws/websocket
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws/websocket',
            reconnectDelay: 5000, // Auto reconnect
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');

                // 3. Subscribe to Project Topic
                // Backend sends to: /topic/project/{id}/runs
                const topic = `/topic/project/${currentProject.id}/runs`;

                client.subscribe(topic, (message: IMessage) => {
                    try {
                        const event: TestRunEvent = JSON.parse(message.body);
                        onMessage(event);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message', error);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        // 4. Activate
        client.activate();
        clientRef.current = client;

        // 5. Cleanup on unmount or project change
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [currentProject?.id]); // Re-run if project changes
}