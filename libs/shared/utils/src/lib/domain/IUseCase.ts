// import { Module } from '../types/modules';
import { Policies } from '../types/policies';

import { IResponse } from './IResponse';

export type AuthorizationData = {
  policies: readonly Policies[];
  useOrForPolicies?: boolean;
  // modules?: Module[];
  modules?: any[];
};
export interface IUseCase<Input, Output, ErrorOutput = Error> {
  execute(input: Input): Promise<IResponse<Output, ErrorOutput>>;
  authorize(input: Input): Promise<boolean> | boolean;
  authorization?: AuthorizationData | AuthorizationData[];
}
