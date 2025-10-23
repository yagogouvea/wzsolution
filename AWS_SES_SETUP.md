# Configuração AWS SES para Envio de Emails

## 📧 Configuração do AWS SES

### 1. Criar Conta AWS e Configurar SES

1. **Acesse o AWS Console**: https://console.aws.amazon.com/
2. **Navegue para SES**: Simple Email Service
3. **Verifique seu domínio**: `wzsolutions.com.br`
4. **Configure DKIM**: Para autenticação de emails
5. **Solicite saída do Sandbox**: Para enviar para qualquer email

### 2. Criar Usuário IAM

1. **Acesse IAM**: Identity and Access Management
2. **Crie um usuário**: `wzsolution-ses-user`
3. **Anexe política**: `AmazonSESFullAccess` (ou política customizada mais restritiva)
4. **Gere credenciais**: Access Key ID e Secret Access Key

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Email Configuration
FROM_EMAIL=contact@wzsolutions.com.br
TO_EMAIL=contact@wzsolutions.com.br
REPLY_TO_EMAIL=contact@wzsolutions.com.br

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://wzsolutions.com.br
```

### 4. Política IAM Recomendada (Mais Restritiva)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "ses:FromAddress": "contact@wzsolutions.com.br"
                }
            }
        }
    ]
}
```

## 🚀 Deploy e Configuração

### 1. Variáveis de Ambiente no Deploy

Configure as variáveis de ambiente na plataforma de deploy (Vercel, Netlify, etc.):

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `FROM_EMAIL`
- `TO_EMAIL`
- `REPLY_TO_EMAIL`

### 2. Teste Local

```bash
npm run dev
```

Acesse: http://localhost:3000/budget

### 3. Teste de Produção

1. Preencha o formulário de orçamento
2. Verifique se o email chegou em `contact@wzsolutions.com.br`
3. Teste a resposta direta para o cliente

## 📋 Funcionalidades Implementadas

- ✅ **Envio de email via AWS SES**
- ✅ **Template HTML responsivo**
- ✅ **Validação de dados**
- ✅ **Tratamento de erros**
- ✅ **Resposta automática para o cliente**
- ✅ **Logs de erro no console**

## 🔧 Troubleshooting

### Erro: "Email address not verified"
- Verifique se o domínio está verificado no AWS SES
- Confirme se o email `contact@wzsolutions.com.br` está verificado

### Erro: "User is not authorized"
- Verifique as credenciais AWS
- Confirme se o usuário IAM tem permissões para SES

### Erro: "Rate exceeded"
- AWS SES tem limites de envio
- Considere implementar fila de emails (SQS + Lambda)

## 📊 Monitoramento

- **AWS CloudWatch**: Logs de envio
- **SES Console**: Métricas de entrega
- **Bounce/Complaint**: Configurar SNS para notificações
