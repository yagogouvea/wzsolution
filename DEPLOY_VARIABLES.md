# Configuração de Variáveis de Ambiente para Deploy

## 🚀 **Variáveis Obrigatórias para Produção**

### **AWS SES Configuration:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA... (sua chave de acesso)
AWS_SECRET_ACCESS_KEY=... (sua chave secreta)
```

### **Email Configuration:**
```env
FROM_EMAIL=contact@wzsolutions.com.br
TO_EMAIL=contact@wzsolutions.com.br
REPLY_TO_EMAIL=contact@wzsolutions.com.br
```

### **Next.js Configuration:**
```env
NEXT_PUBLIC_APP_URL=https://wzsolutions.com.br
NODE_ENV=production
```

---

## 📋 **Como Configurar em Cada Plataforma:**

### **1. Vercel:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para "Settings" → "Environment Variables"
4. Adicione todas as variáveis acima
5. Faça redeploy

### **2. Netlify:**
1. Acesse: https://app.netlify.com/
2. Selecione seu site
3. Vá para "Site settings" → "Environment variables"
4. Adicione todas as variáveis acima
5. Faça redeploy

### **3. AWS Amplify:**
1. Acesse: https://console.aws.amazon.com/amplify/
2. Selecione seu app
3. Vá para "App settings" → "Environment variables"
4. Adicione todas as variáveis acima
5. Faça redeploy

---

## 🔧 **Troubleshooting:**

### **Erro 500 - "Configuração de email não disponível":**
- **Causa**: Variáveis de ambiente não configuradas
- **Solução**: Configure as variáveis AWS SES

### **Erro 503 - "AWS credentials not configured":**
- **Causa**: Credenciais AWS inválidas ou ausentes
- **Solução**: Verifique AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY

### **Email não enviado:**
- **Causa**: Domínio não verificado no AWS SES
- **Solução**: Verifique `wzsolutions.com.br` no AWS SES Console

---

## 🧪 **Teste Local:**

### **Desenvolvimento (sem AWS):**
- API simula envio bem-sucedido
- Logs mostram dados do formulário
- Funciona para testes

### **Produção (com AWS):**
- Envia email real via AWS SES
- Logs detalhados de erro
- Tratamento robusto de exceções

---

## 📊 **Logs de Debug:**

A API agora inclui logs detalhados:
- Verificação de variáveis de ambiente
- Logs de erro com stack trace
- Dados do formulário em desenvolvimento
- Status de credenciais AWS

---

## ✅ **Checklist de Deploy:**

- [ ] Variáveis AWS configuradas
- [ ] Domínio verificado no SES
- [ ] Credenciais válidas
- [ ] Redeploy realizado
- [ ] Teste de formulário funcionando
- [ ] Email chegando em contact@wzsolutions.com.br
