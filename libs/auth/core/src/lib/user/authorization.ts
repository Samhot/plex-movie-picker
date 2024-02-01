import { Module } from '@plex-tinder/shared/utils';
import { Pack, Policies } from '@plex-tinder/shared/utils';

export const regulatoryDefaultAuthorizationData: {
  packs: Pack[];
  modules: Module[];
  policies: readonly Policies[];
  useOrForPolicies: boolean;
} = {
  packs: [Pack.RegulatoryCompliance],
  modules: [Module.RegulatoryControl],
  policies: ['regulatory_access'] as const,
  useOrForPolicies: true,
};
