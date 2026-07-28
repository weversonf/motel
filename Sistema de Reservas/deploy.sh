#!/bin/bash
# Deploy script para Firebase Hosting

echo "🚀 Iniciando deploy no Firebase..."

# 1. Login (apenas primeira vez)
# firebase login

# 2. Selecionar projeto (apenas primeira vez)
# firebase use moteisfortaleza-9dadd

# 3. Deploy Hosting + Firestore Rules + Indexes
firebase deploy --only hosting,firestore:rules,firestore:indexes

echo "✅ Deploy concluído!"
echo "🌐 URL: https://moteisfortaleza-9dadd.web.app"
echo "📊 Console: https://console.firebase.google.com/project/moteisfortaleza-9dadd"