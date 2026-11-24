import 'dotenv/config';

const port = Number(process.env.PORT ?? 4173);
const configuredBaseUrl = process.env.BASE_URL?.trim();

export const config = {
  port,
  baseUrl: configuredBaseUrl || `http://localhost:${port}`,
  usesExternalServer: Boolean(configuredBaseUrl),
  headless: process.env.HEADED !== '1',
};
