# Deploy no Firebase Hosting - Motéis Fortaleza

## 📋 Pré-requisitos

1. **Node.js** instalado (v18+)
2. **Firebase CLI** instalado:
   ```powershell
   npm install -g firebase-tools
   ```
3. **Projeto Firebase** criado: `moteisfortaleza-9dadd`

---

## 🚀 Passo a Passo

### 1. Login no Firebase
```powershell
firebase login
```
Abre o navegador para autenticar com sua conta Google.

### 2. Selecionar projeto
```powershell
firebase use moteisfortaleza-9dadd
```
*Se o projeto não aparecer:* `firebase projects:list` para ver o ID correto.

### 3. Deploy
```powershell
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

### 4. Verificar
- **Site:** https://moteisfortaleza-9dadd.web.app
- **Admin:** https://moteisfortaleza-9dadd.web.app/admin/
- **Console Firebase:** https://console.firebase.google.com/project/moteisfortaleza-9dadd

---

## 🔧 Configurações Necessárias no Console Firebase

### Authentication → Sign-in method
- ✅ **Email/Password** - Habilitado
- ✅ **Email link (passwordless)** - Opcional

### Firestore Database → Rules
As rules em `firestore.rules` já permitem:
- Clientes criarem reservas (chat)
- Admins lerem/escreverem tudo
- Webhook ASAAS ler reservas por CPF

### Firestore Database → Indexes
Os índices em `firestore.indexes.json` cobrem:
- Reservas por data + status
- Reservas por motel + data
- Busca por CPF
- Busca por paymentId ASAAS
- Busca por protocolo

---

## 🌐 Domínio Personalizado (Opcional)

No Console Firebase → Hosting → **Add custom domain**:
1. Digite `moteisfortaleza.com` (ou subdomínio `reserva.moteisfortaleza.com`)
2. Siga as instruções de DNS (A records ou CNAME)
3. SSL automático em ~10 min

---

## 📱 Configurar Webhook ASAAS

No painel ASAAS (Sandbox ou Produção):
1. **Configurações** → **Webhooks**
2. **Nova URL:** `https://script.google.com/macros/s/AKfycbzAVBD7ReZHQN-vLMEQem8HhnOuAobesEq3OI4W78y1lRAUHhDT_FOUoZg7nV-p9GYV1w/exec`
3. Eventos: `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`

> ⚠️ O Apps Script (`Codigo.gs`) já está publicado como Web App. Verifique se a URL está correta no `index.html` linha 180.

---

## 🔐 Segurança - Regras Importantes

### Variáveis NÃO commitar:
- `firestore.rules` - OK commitar (não tem segredos)
- `firebase.json` - OK commitar
- **NÃO** commitar: `.env`, chaves ASAAS, tokens

### No `index.html` (linha 125-132):
```javascript
var firebaseConfig = {
    apiKey: "AIzaSyCln4mcb1j46UcmG-sTVb3bUudTQCpdfvY",  // OK - chave pública
    authDomain: "moteisfortaleza-9dadd.firebaseapp.com",
    projectId: "moteisfortaleza-9dadd",
    // ...
};
```
A `apiKey` do Firebase **é pública** por design. A segurança vem das **Firestore Rules**.

---

## 🐛 Troubleshooting

### "Permission denied" no chat
- Verifique se `firestore.rules` foi deployado: `firebase deploy --only firestore:rules`
- Rules levam ~1 min para propagar

### Index não criado
```powershell
firebase deploy --only firestore:indexes
```
Ou crie manualmente no Console → Firestore → Indexes

### Webhook ASAAS não recebe
1. Teste no ASAAS: botão "Testar webhook"
2. Veja logs no Apps Script: `script.google.com` → Execuções
3. Verifique se URL do Web App está **pública** (Qualquer pessoa)

---

## 📁 Estrutura de Arquivos Deployados

```
├── index.html          # Chat de reserva (cliente)
├── favicon.svg
├── admin/
│   └── index.html      # Painel admin
├── firebase.json       # Config hosting
├── firestore.rules     # Regras segurança
├── firestore.indexes.json
└── Codigo.gs           # Apps Script (NÃO deployado - fica no Google)
```

---

## ✅ Checklist Pré-Deploy

- [ ] `firebase login` feito
- [ ] `firebase use moteisfortaleza-9dadd` 
- [ ] Regras Firestore deployadas
- [ ] Índices Firestore deployados
- [ ] Hosting deployado
- [ ] Webhook ASAAS apontando para Apps Script
- [ ] Teste reserva completa (chat → PIX → confirmação)
- [ ] Teste painel admin (login → calendário → tabela)

---

## 🆘 Suporte

- **Firebase Status:** https://status.firebase.google.com/
- **ASAAS Status:** https://status.asaas.com/
- **Logs Apps Script:** https://script.google.com/home/projects/[ID]/executions