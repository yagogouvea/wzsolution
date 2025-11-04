import { SESClient } from '@aws-sdk/client-ses';

// Cliente SES com inicialização lazy para evitar erros durante o build
let sesClientInstance: SESClient | null = null;

/**
 * Obtém ou cria o cliente SES
 * Usa inicialização lazy para garantir que as variáveis de ambiente estejam disponíveis
 */
export function getSESClient(): SESClient {
  if (!sesClientInstance) {
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    // Validar credenciais antes de criar o cliente
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS credentials não configuradas. Configure AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY.'
      );
    }

    sesClientInstance = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return sesClientInstance;
}

// Exportar função getter para compatibilidade
export const sesClient = {
  send: async (command: any) => {
    const client = getSESClient();
    return client.send(command);
  },
};

// Configuração de email
export const emailConfig = {
  get from() {
    return process.env.FROM_EMAIL || 'contact@wzsolutions.com.br';
  },
  get to() {
    return process.env.TO_EMAIL || 'contact@wzsolutions.com.br';
  },
  get replyTo() {
    return process.env.REPLY_TO_EMAIL || 'contact@wzsolutions.com.br';
  },
};

/**
 * Valida se as configurações AWS estão disponíveis
 */
export function validateAWSConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.AWS_REGION) {
    errors.push('AWS_REGION não configurada');
  }

  if (!process.env.AWS_ACCESS_KEY_ID) {
    errors.push('AWS_ACCESS_KEY_ID não configurada');
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    errors.push('AWS_SECRET_ACCESS_KEY não configurada');
  }

  if (!process.env.FROM_EMAIL) {
    errors.push('FROM_EMAIL não configurada');
  }

  if (!process.env.TO_EMAIL) {
    errors.push('TO_EMAIL não configurada');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
