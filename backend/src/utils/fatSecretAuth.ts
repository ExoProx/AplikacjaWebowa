// utils/fatsecretAuth.ts
import axios from 'axios';

export async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('scope', 'premier');

  const response = await axios.post('https://oauth.fatsecret.com/connect/token', params, {
    auth: {
      username: process.env.FATSECRET_CLIENT_ID!,
      password: process.env.FATSECRET_CLIENT_SECRET!,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.access_token;
}
