import { SESClient } from '@aws-sdk/client-ses';

// Configuração do AWS SES
export const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Configuração de email
export const emailConfig = {
  from: process.env.FROM_EMAIL || 'contact@wzsolutions.com.br',
  to: process.env.TO_EMAIL || 'contact@wzsolutions.com.br',
  replyTo: process.env.REPLY_TO_EMAIL || 'contact@wzsolutions.com.br',
};
