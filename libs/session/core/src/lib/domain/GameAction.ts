export enum GameActionType {
  SWIPE = 'SWIPE',
  VOTE_BRACKET = 'VOTE_BRACKET',
  VETO = 'VETO',
  BID = 'BID',
}

export type GameActionPayload = Record<string, unknown>;

export class GameAction {
  constructor(
    public readonly userId: string,
    public readonly type: GameActionType,
    public readonly payload: GameActionPayload,
    public readonly timestamp: Date = new Date()
  ) {}
}

