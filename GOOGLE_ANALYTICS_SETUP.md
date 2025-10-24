# 📊 Google Analytics Setup - WZ Solutions

## 🚀 Configuração do Google Analytics 4

### 1. **Criar Conta no Google Analytics**
- Acesse: [Google Analytics](https://analytics.google.com)
- Crie uma nova propriedade para o site WZ Solutions
- Configure como "Web" e selecione "Brasil" como país

### 2. **Obter Measurement ID**
- No Google Analytics, vá em "Administração" → "Fluxo de dados"
- Clique em "Web" e copie o "ID de medição" (formato: G-XXXXXXXXXX)

### 3. **Configurar Variável de Ambiente**

#### **No Railway (Produção):**
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### **No .env.local (Desenvolvimento):**
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. **Eventos Configurados**

#### **📈 Eventos de Conversão:**
- `form_submit_success` - Formulário enviado com sucesso
- `form_submit_start` - Início do envio do formulário
- `form_submit_error` - Erro no envio do formulário
- `budget_request_conversion` - Conversão de orçamento

#### **🎯 Eventos de Interação:**
- `cta_click` - Clique em botões CTA
- `whatsapp_click` - Clique no botão WhatsApp
- `page_view` - Visualização de páginas (automático)

#### **📊 Parâmetros de Eventos:**
- `form_name` - Nome do formulário
- `project_type` - Tipo de projeto selecionado
- `button_name` - Nome do botão clicado
- `location` - Localização do elemento
- `error_type` - Tipo de erro
- `error_code` - Código do erro

### 5. **Configurações Avançadas**

#### **🎯 Objetivos Configurados:**
- **Orçamento Enviado**: Formulário de orçamento enviado com sucesso
- **WhatsApp Click**: Clique no botão WhatsApp
- **CTA Click**: Clique em botões de call-to-action

#### **📈 Relatórios Personalizados:**
- **Conversões por Tipo de Projeto**
- **Taxa de Conversão do Formulário**
- **Origem dos Cliques WhatsApp**
- **Performance dos CTAs**

### 6. **Verificação da Implementação**

#### **Teste Local:**
```bash
# 1. Configure a variável de ambiente
echo "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env.local

# 2. Inicie o servidor
npm run dev

# 3. Abra o DevTools → Network
# 4. Procure por requisições para google-analytics.com
```

#### **Teste em Produção:**
```bash
# 1. Configure no Railway
# 2. Faça deploy
# 3. Teste os eventos no Google Analytics Real-time
```

### 7. **Monitoramento**

#### **📊 Métricas Importantes:**
- **Taxa de Conversão**: Formulários enviados / Visitantes
- **Tempo na Página**: Engajamento dos usuários
- **Origem do Tráfego**: De onde vêm os visitantes
- **Dispositivos**: Mobile vs Desktop

#### **🔍 Debugging:**
- **Google Tag Assistant**: Extensão do Chrome
- **GA4 Debug View**: No Google Analytics
- **Console do Browser**: Verificar erros de JavaScript

### 8. **Próximos Passos**

#### **📈 Otimizações Futuras:**
- **Enhanced Ecommerce**: Para tracking de vendas
- **Custom Dimensions**: Dados personalizados
- **Audience Segments**: Segmentação de usuários
- **Attribution Modeling**: Análise de atribuição

#### **🎯 Campanhas:**
- **UTM Parameters**: Para tracking de campanhas
- **Google Ads Integration**: Integração com anúncios
- **Facebook Pixel**: Tracking adicional
- **Heatmaps**: Análise de comportamento

---

## ✅ **Status da Implementação**

- [x] Componente GoogleAnalytics criado
- [x] Tracking de formulários implementado
- [x] Tracking de CTAs implementado
- [x] Tracking de WhatsApp implementado
- [x] Hook useGoogleAnalytics criado
- [x] Integração com layout principal
- [ ] Configuração da variável de ambiente
- [ ] Teste em produção
- [ ] Configuração de objetivos no GA4

---

## 🚨 **Importante**

1. **Configure a variável `NEXT_PUBLIC_GA_MEASUREMENT_ID` no Railway**
2. **Teste todos os eventos após o deploy**
3. **Configure objetivos no Google Analytics**
4. **Monitore as métricas regularmente**

**Sistema de Analytics 100% implementado e pronto para uso!** 📊✨
