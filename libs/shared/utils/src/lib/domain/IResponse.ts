export type IResponse<S, E = Error> =
    | {
          success: S;
          error: E | null;
      }
    | {
          success: null;
          error: E;
      };
