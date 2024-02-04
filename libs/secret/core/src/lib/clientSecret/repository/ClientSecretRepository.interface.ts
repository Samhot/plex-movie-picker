import { ClientSecret } from '../domain/ClientSecret';
import { CreateClientSecret } from '../domain/CreateClientSecret';

export interface ClientSecretRepository {
  getClientSecrets(filters: { id: string }): Promise<ClientSecret | null>;
  saveClientSecret(clientSecret: CreateClientSecret): Promise<ClientSecret>;
}
