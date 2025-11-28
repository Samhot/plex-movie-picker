export interface ISessionNotifier {
  notifyParticipantJoined(sessionId: string, user: { id: string; name: string }): void;
  notifyMatchFound(sessionId: string, movieId: string): void;
}

