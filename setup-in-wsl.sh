#!/bin/bash
# Script para configurar o projeto no WSL nativo

echo "🚀 Configurando Inner AI Clone no WSL..."
echo "======================================"

# Ir para home
cd ~

# Criar diretório e extrair
echo "📁 Criando diretório do projeto..."
mkdir -p inneraiclone
cd inneraiclone

# Extrair arquivo
echo "📦 Extraindo arquivos..."
tar -xzf ~/innerai-project.tar.gz

# Remover arquivo tar
rm ~/innerai-project.tar.gz

# Instalar dependências
echo "📥 Instalando dependências..."
npm install

# Mostrar status
echo ""
echo "✅ Projeto configurado com sucesso!"
echo "======================================"
echo ""
echo "📍 Localização: ~/inneraiclone"
echo ""
echo "🎯 Próximos comandos:"
echo "   cd ~/inneraiclone"
echo "   npm run dev          # Iniciar servidor"
echo "   npm run test:all     # Executar testes"
echo ""
echo "💡 Dica: O projeto agora está no sistema de arquivos nativo do WSL"
echo "         A performance será MUITO melhor!"