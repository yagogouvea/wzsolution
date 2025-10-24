# 🔧 Corrigir AWS SES em Produção

## ❌ **PROBLEMA ATUAL:**
- **Email não funciona** em produção (erro 503)
- **Fallback funciona** (WhatsApp)
- **Local funciona** perfeitamente
- **Variáveis configuradas** mas não carregadas

---

## 🔍 **DIAGNÓSTICO:**

### **1. Verificar Logs do Servidor:**
- Acesse logs do Railway/Vercel/Netlify
- Procure por: "=== DEBUG API SEND-EMAIL ==="
- Verifique se variáveis estão sendo carregadas

### **2. Verificar Variáveis de Ambiente:**
```bash
# Deve aparecer nos logs:
AWS_REGION: us-east-1
AWS_ACCESS_KEY_ID: Set
AWS_SECRET_ACCESS_KEY: Set
FROM_EMAIL: contact@wzsolutions.com.br
```

### **3. Verificar Domínio no AWS SES:**
- Acesse: https://console.aws.amazon.com/ses/
- Verifique se `wzsolutions.com.br` está verificado
- Se não estiver, adicione e configure DNS

---

## 🛠️ **SOLUÇÕES:**

### **Solução 1: Verificar Configuração das Variáveis**

#### **No Railway:**
1. Acesse: https://railway.app/dashboard
2. Selecione seu projeto
3. Vá para "Variables"
4. Verifique se todas as variáveis estão configuradas:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=sua_chave_de_acesso_aqui
   AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aqui
   FROM_EMAIL=contact@wzsolutions.com.br
   TO_EMAIL=contact@wzsolutions.com.br
   REPLY_TO_EMAIL=contact@wzsolutions.com.br
   NEXT_PUBLIC_APP_URL=https://app.wzsolutions.com.br
   NODE_ENV=production
   ```

#### **No Vercel:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para "Settings" → "Environment Variables"
4. Adicione as variáveis acima

#### **No Netlify:**
1. Acesse: https://app.netlify.com/
2. Selecione seu site
3. Vá para "Site settings" → "Environment variables"
4. Adicione as variáveis acima

### **Solução 2: Verificar Domínio no AWS SES**

1. **Acesse AWS SES Console:**
   ```
   https://console.aws.amazon.com/ses/
   ```

2. **Vá para "Verified identities"**

3. **Verifique se `wzsolutions.com.br` está listado**

4. **Se não estiver:**
   - Clique em "Create identity"
   - Selecione "Domain"
   - Digite: `wzsolutions.com.br`
   - Siga as instruções de DNS

### **Solução 3: Verificar Credenciais AWS**

1. **Acesse AWS Console:**
   ```
   https://console.aws.amazon.com/
   ```

2. **Faça login com as credenciais:**
   - Access Key: `sua_chave_de_acesso_aqui`
   - Secret Key: `sua_chave_secreta_aqui`

3. **Verifique se tem acesso ao SES**

4. **Teste envio manual de email**

---

## 🧪 **TESTE APÓS CORREÇÃO:**

### **1. Verificar Logs:**
- Acesse logs do servidor
- Procure por: "=== ENVIANDO EMAIL VIA AWS SES ==="
- Deve aparecer: "=== EMAIL ENVIADO COM SUCESSO ==="

### **2. Testar Formulário:**
- Acesse: https://app.wzsolutions.com.br/budget
- Preencha e envie
- Deve funcionar sem fallback

### **3. Verificar Email:**
- Email deve chegar em: contact@wzsolutions.com.br
- Conteúdo deve estar formatado

---

## 🚨 **AÇÃO IMEDIATA:**

### **1. Verificar Logs do Servidor:**
- Acesse o painel do seu provedor
- Vá para logs/deployments
- Procure por logs da API

### **2. Verificar Variáveis:**
- Confirme se todas as variáveis estão configuradas
- Faça redeploy se necessário

### **3. Verificar AWS SES:**
- Acesse console AWS
- Verifique domínio e credenciais

---

## 📊 **RESULTADO ESPERADO:**

### **Logs Corretos:**
```
=== DEBUG API SEND-EMAIL ===
NODE_ENV: production
AWS_REGION: us-east-1
AWS_ACCESS_KEY_ID: Set
AWS_SECRET_ACCESS_KEY: Set
FROM_EMAIL: contact@wzsolutions.com.br
================================

=== ENVIANDO EMAIL VIA AWS SES ===
From: contact@wzsolutions.com.br
To: contact@wzsolutions.com.br
Subject: Nova Solicitação de Orçamento - [Nome]
===================================

=== EMAIL ENVIADO COM SUCESSO ===
```

### **Formulário Funcionando:**
- Status: 200
- Mensagem: "Orçamento Enviado com Sucesso!"
- Email chega em contact@wzsolutions.com.br

---

## 🎯 **PRÓXIMOS PASSOS:**

1. **Verifique logs** do servidor
2. **Confirme variáveis** estão configuradas
3. **Verifique domínio** no AWS SES
4. **Faça redeploy** se necessário
5. **Teste formulário** novamente

**O problema é de configuração, não de código!** 🔧
