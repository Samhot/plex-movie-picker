import { ClientSecret } from '../domain/ClientSecret';
import { CreateClientSecret } from '../domain/CreateClientSecret';

export interface IClientSecretRepository {
  getClientSecrets(userId: string): Promise<ClientSecret | null>;
  saveClientSecret(clientSecret: CreateClientSecret): Promise<ClientSecret>;
}
