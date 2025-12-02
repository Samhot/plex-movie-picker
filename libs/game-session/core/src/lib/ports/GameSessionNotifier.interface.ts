export type SwipeProgressPayload = {
  movieId: string;
  totalParticipants: number;
  likesCount: number;
};

export interface IGameSessionNotifier {
  notifyParticipantJoined(sessionId: string, user: { id: string; name: string }): void;
  notifyMatchFound(sessionId: string, movieId: string): void;
  notifySwipeProgress(sessionId: string, payload: SwipeProgressPayload): void;
}

