import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IGameSessionNotifier } from '@plex-tinder/game-session/core';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, lock this down
  },
  namespace: 'game-sessions',
})
export class GameSessionGateway implements OnGatewayConnection, OnGatewayDisconnect, IGameSessionNotifier {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameSessionGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Client should join a specific room (sessionId) upon connection
    const sessionId = client.handshake.query['sessionId'] as string;
    if (sessionId) {
      client.join(sessionId);
      this.logger.log(`Client ${client.id} joined game session ${sessionId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // IGameSessionNotifier Implementation

  notifyMatchFound(sessionId: string, movieId: string): void {
    this.server.to(sessionId).emit('match_found', { movieId });
    this.logger.log(`Match emitted for game session ${sessionId}: Movie ${movieId}`);
  }

  notifyParticipantJoined(sessionId: string, user: { id: string; name: string }): void {
    this.server.to(sessionId).emit('participant_joined', { user });
  }
}

