# 🚀 Guia de Deploy no Railway

## ✅ **CORREÇÕES APLICADAS:**

### **1. Tailwind CSS v3:**
- **Removido**: Tailwind CSS v4 (incompatível)
- **Adicionado**: Tailwind CSS v3.4.15
- **Corrigido**: imports no globals.css

### **2. Build Script:**
- **Removido**: `--turbopack` do build (incompatível com Railway)
- **Mantido**: `--turbopack` apenas no dev

### **3. Next.js Config:**
- **Adicionado**: `output: 'standalone'` para Railway
- **Mantido**: Todas as otimizações

### **4. PostCSS:**
- **Criado**: postcss.config.js compatível
- **Removido**: postcss.config.mjs conflitante

---

## 🚀 **COMO FAZER DEPLOY NO RAILWAY:**

### **1. Conectar Repositório:**
1. Acesse: https://railway.app/dashboard
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório: `yagogouvea/wzsolution`

### **2. Configurar Variáveis de Ambiente:**
1. Vá para "Variables" no projeto
2. Adicione as seguintes variáveis:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_chave_de_acesso_aqui
AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aqui
FROM_EMAIL=contact@wzsolutions.com.br
TO_EMAIL=contact@wzsolutions.com.br
REPLY_TO_EMAIL=contact@wzsolutions.com.br
NEXT_PUBLIC_APP_URL=https://app.wzsolutions.com.br
NODE_ENV=production
```

### **3. Configurar Domínio:**
1. Vá para "Settings" → "Domains"
2. Adicione domínio personalizado: `app.wzsolutions.com.br`
3. Configure DNS conforme instruções

### **4. Deploy:**
1. Railway fará deploy automaticamente
2. Aguarde conclusão (2-3 minutos)
3. Teste o site

---

## 🧪 **TESTE APÓS DEPLOY:**

### **1. Verificar Site:**
- Acesse: https://app.wzsolutions.com.br
- Verifique se carrega corretamente

### **2. Testar Formulário:**
- Acesse: https://app.wzsolutions.com.br/budget
- Preencha e envie
- Deve funcionar sem erro 503

### **3. Verificar Logs:**
- Acesse: "Deployments" → "View Logs"
- Procure por logs de debug da API

---

## 🔧 **TROUBLESHOOTING:**

### **Se Deploy Falhar:**
1. **Verifique logs** de build
2. **Confirme variáveis** estão configuradas
3. **Verifique domínio** no AWS SES

### **Se Site Não Carregar:**
1. **Aguarde 2-3 minutos** para propagação
2. **Verifique DNS** do domínio
3. **Confirme certificado SSL**

### **Se Formulário Dar Erro 503:**
1. **Verifique logs** da API
2. **Confirme variáveis AWS** estão corretas
3. **Verifique domínio** no AWS SES

---

## 📊 **LOGS ESPERADOS:**

### **Build Bem-sucedido:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### **API Funcionando:**
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
===================================

=== EMAIL ENVIADO COM SUCESSO ===
```

---

## 🎯 **PRÓXIMOS PASSOS:**

1. **Faça o deploy** no Railway
2. **Configure as variáveis** de ambiente
3. **Teste o site** e formulário
4. **Verifique logs** se houver problemas

**Agora o código está otimizado para Railway!** 🚀
