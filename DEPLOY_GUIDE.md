# 🚀 Guia de Deploy - WZ Solutions

## ❌ **PROBLEMA ATUAL:**
- **Erro 503**: Serviço de email indisponível em produção
- **Causa**: Variáveis de ambiente AWS não configuradas
- **Status**: API retorna erro 503 com informações de contato alternativo

---

## ✅ **SOLUÇÃO:**

### **1. Configurar Variáveis de Ambiente:**

```env
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_chave_de_acesso_aqui
AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aqui

# Email Configuration  
FROM_EMAIL=contact@wzsolutions.com.br
TO_EMAIL=contact@wzsolutions.com.br
REPLY_TO_EMAIL=contact@wzsolutions.com.br

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://app.wzsolutions.com.br
NODE_ENV=production
```

### **2. Verificar Domínio no AWS SES:**
- Acesse: https://console.aws.amazon.com/ses/
- Verifique se `wzsolutions.com.br` está verificado
- Configure DNS se necessário

---

## 🔧 **MELHORIAS IMPLEMENTADAS:**

### **📧 API de Email:**
- ✅ **Logs detalhados**: Para debug em produção
- ✅ **Erro 503 específico**: Com informações de contato
- ✅ **Fallback para desenvolvimento**: Funciona sem AWS
- ✅ **Tratamento robusto**: Erros bem documentados

### **🎨 Interface do Usuário:**
- ✅ **Mensagem clara**: Para erro 503
- ✅ **Contato alternativo**: Email e WhatsApp
- ✅ **Experiência melhorada**: Usuário sabe o que fazer

---

## 📋 **CHECKLIST DE DEPLOY:**

### **Antes do Deploy:**
- [ ] Variáveis AWS configuradas no servidor
- [ ] Domínio verificado no AWS SES
- [ ] Credenciais válidas testadas
- [ ] Backup das configurações atuais

### **Após o Deploy:**
- [ ] Teste do formulário de orçamento
- [ ] Verificação de logs do servidor
- [ ] Teste de envio de email
- [ ] Confirmação de recebimento

---

## 🧪 **TESTE LOCAL vs PRODUÇÃO:**

### **Desenvolvimento (localhost:3004):**
```bash
# Funciona sem AWS - simula envio
POST /api/send-email
Status: 200
Response: "Email simulado enviado com sucesso!"
```

### **Produção (app.wzsolutions.com.br):**
```bash
# Com AWS configurado - envia email real
POST /api/send-email  
Status: 200
Response: "Email enviado com sucesso!"

# Sem AWS configurado - erro 503
POST /api/send-email
Status: 503
Response: "Serviço de email temporariamente indisponível"
```

---

## 🚨 **AÇÃO NECESSÁRIA:**

**URGENTE**: Configure as variáveis de ambiente AWS no servidor de produção para resolver o erro 503.

**Alternativa**: O formulário já mostra informações de contato direto quando há erro 503, então os usuários podem entrar em contato mesmo com o problema.

---

## 📞 **CONTATO DE EMERGÊNCIA:**

- **Email**: contact@wzsolutions.com.br
- **WhatsApp**: +55 11 94729-3221
- **Status**: Site funcionando, apenas formulário com problema
