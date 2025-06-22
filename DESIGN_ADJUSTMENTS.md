# Ajustes de Design - InnerAI Clone

## Comparação com InnerAI Original

Após análise detalhada das screenshots do InnerAI original, identifiquei os seguintes ajustes necessários no design:

### 1. **Área do Chat Principal**
- **Placeholder do Chat**: O InnerAI original tem um campo de input mais proeminente na parte inferior, com bordas arredondadas suaves e um design mais integrado
- **Altura do Input**: Precisa ser maior (aproximadamente 60-70px de altura)
- **Botões de Ação**: Adicionar botões flutuantes dentro do input (Adicionar arquivo, Pesquisa na web, Conhecimento)
- **Sombra e Elevação**: O campo de chat precisa ter uma sombra sutil para criar sensação de elevação

### 2. **Sidebar/Menu Lateral**
- **Largura**: Aproximadamente 280px
- **Cor de Fundo**: Usar um cinza muito escuro (#1a1a1a ou similar)
- **Ícones**: Mais minimalistas e monocromáticos
- **Espaçamento**: Maior padding entre itens do menu
- **Seção de Upgrade**: Box destacado com gradiente roxo/lilás para chamar atenção

### 3. **Área Principal de Conteúdo**
- **Cor de Fundo**: Cinza muito escuro (#0f0f0f ou #111111)
- **Templates/Cards**: 
  - Usar cards com cantos arredondados (border-radius: 12-16px)
  - Altura fixa de aproximadamente 200-250px
  - Ícones centralizados grandes
  - Texto descritivo abaixo do ícone
  - Hover effect com elevação sutil

### 4. **Header/Cabeçalho**
- **Seletor de Modelo**: Dropdown estilizado com ícone do modelo (GPT-4o)
- **Ícones de Ação**: Pesquisa e biblioteca com ícones outline
- **Avatar do Usuário**: Circular com borda sutil

### 5. **Tipografia**
- **Fonte Principal**: Sans-serif moderna (Inter, Helvetica, ou similar)
- **Tamanhos**:
  - Títulos principais: 24-28px
  - Subtítulos: 18-20px
  - Texto do chat: 16px
  - Labels e textos pequenos: 14px

### 6. **Cores**
- **Primária**: Roxo/Lilás (#7C3AED ou similar)
- **Background Principal**: #0f0f0f
- **Background Secundário**: #1a1a1a
- **Texto Principal**: #ffffff
- **Texto Secundário**: #9ca3af
- **Bordas**: #2d2d2d

### 7. **Componentes Específicos**

#### Cards de Templates
- Grid de 3-4 colunas
- Ícones ilustrativos grandes (64x64px)
- Título em negrito
- Descrição em texto secundário
- Hover: elevação e brilho sutil

#### Botão de Upgrade
- Gradiente roxo/rosa
- Ícone de raio/estrela
- Texto "Fazer upgrade"
- Sombra colorida sutil

#### Chat Interface
- Mensagens do usuário: alinhadas à direita, fundo escuro
- Mensagens do AI: alinhadas à esquerda, sem fundo
- Avatar pequeno para cada mensagem
- Timestamp sutil

### 8. **Animações e Transições**
- Transições suaves (0.2-0.3s) para hovers
- Fade-in para novos elementos
- Smooth scroll
- Loading states com skeleton screens

### 9. **Responsividade**
- Sidebar colapsável em mobile
- Grid adaptativo para cards
- Chat interface full-height em mobile

### 10. **Detalhes Adicionais**
- Badge "FREE" no perfil do usuário
- Indicadores de status online
- Tooltips informativos
- Microinterações (botões, hovers)

## Prioridades de Implementação

1. **Alta Prioridade**
   - Ajustar área do chat (tamanho, posição, estilo)
   - Implementar sidebar correta
   - Ajustar cores gerais

2. **Média Prioridade**
   - Estilizar cards de templates
   - Implementar botão de upgrade
   - Ajustar tipografia

3. **Baixa Prioridade**
   - Animações e transições
   - Microinterações
   - Polimento final