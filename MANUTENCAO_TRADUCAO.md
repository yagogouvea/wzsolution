# 🌍 Guia de Manutenção - Sistema de Tradução

## 📋 **Estrutura Atual**

### **URLs do Site:**
- **🇧🇷 Português:** `http://localhost:3000/pt`
- **🇺🇸 English:** `http://localhost:3000/en`
- **🔄 Redirecionamento:** `http://localhost:3000/` → `/pt`

### **Componentes por Idioma:**

#### **Português (PT):**
- `src/components/Hero.tsx`
- `src/components/About.tsx`
- `src/components/Budget.tsx`
- `src/components/Contact.tsx`

#### **Inglês (EN):**
- `src/components/HeroEN.tsx`
- `src/components/AboutEN.tsx`
- `src/components/BudgetEN.tsx`
- `src/components/ContactEN.tsx`

---

## 🔄 **Processo de Manutenção**

### **1. ✅ Quando alterar APENAS o layout/estilo:**
- **Altere apenas** os componentes em português
- **Copie as alterações** para os componentes em inglês
- **Mantenha** apenas os textos diferentes

### **2. ✅ Quando alterar TEXTO em português:**
- **Altere** o componente em português
- **Traduza** e altere o componente em inglês correspondente

### **3. ✅ Quando alterar FUNCIONALIDADE:**
- **Altere** ambos os componentes (PT e EN)
- **Mantenha** apenas os textos diferentes

---

## 📝 **Checklist de Alterações**

### **Antes de fazer alterações:**
- [ ] Identificar qual componente precisa ser alterado
- [ ] Verificar se é alteração de layout, texto ou funcionalidade
- [ ] Anotar quais textos precisam ser traduzidos

### **Após fazer alterações:**
- [ ] Testar versão em português (`/pt`)
- [ ] Testar versão em inglês (`/en`)
- [ ] Verificar se o seletor de idioma funciona
- [ ] Verificar se não há erros no console

---

## 🛠️ **Comandos Úteis**

### **Desenvolvimento:**
```bash
npm run dev
```

### **Build:**
```bash
npm run build
```

### **Limpar cache:**
```bash
Remove-Item -Recurse -Force .next
```

---

## 📁 **Estrutura de Arquivos**

```
src/
├── app/
│   ├── page.tsx          # Redirecionamento para /pt
│   ├── pt/
│   │   └── page.tsx      # Página em português
│   └── en/
│       └── page.tsx      # Página em inglês
├── components/
│   ├── Hero.tsx          # Hero em português
│   ├── HeroEN.tsx        # Hero em inglês
│   ├── About.tsx         # About em português
│   ├── AboutEN.tsx       # About em inglês
│   ├── Budget.tsx        # Budget em português
│   ├── BudgetEN.tsx      # Budget em inglês
│   ├── Contact.tsx       # Contact em português
│   ├── ContactEN.tsx     # Contact em inglês
│   ├── Header.tsx        # Header (comum)
│   ├── Footer.tsx        # Footer (comum)
│   └── LanguageSwitcher.tsx # Seletor de idioma
```

---

## ⚠️ **Importante**

1. **SEMPRE** teste ambas as versões após alterações
2. **MANTENHA** a consistência visual entre as versões
3. **TRADUZA** adequadamente os textos para inglês
4. **VERIFIQUE** se o seletor de idioma funciona corretamente

---

## 🚀 **Para Deploy**

### **URLs de Produção:**
- **Português:** `https://seudominio.com/pt`
- **Inglês:** `https://seudominio.com/en`
- **Redirecionamento:** `https://seudominio.com/` → `/pt`

### **SEO:**
- Cada idioma tem sua própria URL
- Conteúdo otimizado para cada público
- Meta tags específicas por idioma

