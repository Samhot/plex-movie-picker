export interface IGameSessionNotifier {
  notifyParticipantJoined(sessionId: string, user: { id: string; name: string }): void;
  notifyMatchFound(sessionId: string, movieId: string): void;
}

