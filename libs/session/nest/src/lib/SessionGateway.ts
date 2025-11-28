import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ISessionNotifier } from '@plex-tinder/session/core';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, lock this down
  },
  namespace: 'sessions',
})
export class SessionGateway implements OnGatewayConnection, OnGatewayDisconnect, ISessionNotifier {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SessionGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Client should join a specific room (sessionId) upon connection
    // e.g. client.emit('request_session_id');
    const sessionId = client.handshake.query['sessionId'] as string;
    if (sessionId) {
      client.join(sessionId);
      this.logger.log(`Client ${client.id} joined session ${sessionId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ISessionNotifier Implementation

  notifyMatchFound(sessionId: string, movieId: string): void {
    this.server.to(sessionId).emit('match_found', { movieId });
    this.logger.log(`Match emitted for session ${sessionId}: Movie ${movieId}`);
  }

  notifyParticipantJoined(sessionId: string, user: { id: string; name: string }): void {
    this.server.to(sessionId).emit('participant_joined', { user });
  }
}
