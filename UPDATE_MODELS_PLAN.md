# Plano de Atualização de Modelos - InnerAI Clone

## 📋 Checklist de Preparação

### 1. Modelos Prioritários para Implementar

#### 🚀 Modelos Rápidos (Fast)
- [ ] **Claude 3.5 Haiku** ✅ (já temos)
- [ ] **Gemini 2.0 Flash** (atualizar de gemini-pro)
- [ ] **Llama 3.2** (versão real disponível)
- [ ] **Mistral 7B** ✅ (já temos)
- [ ] **Qwen 2.5** (alternativa ao DeepSeek)

#### 🧠 Modelos Avançados (Advanced)
- [ ] **GPT-4o** (openai/gpt-4o)
- [ ] **Claude 3.5 Sonnet** (atualizar nomenclatura)
- [ ] **Gemini 2.0 Pro** (google/gemini-2.0-pro)
- [ ] **Grok 2** (x-ai/grok-2)
- [ ] **Mistral Large** (atualizar para v2)
- [ ] **Perplexity Sonar** (perplexity/sonar-medium)

### 2. Mapeamento de Modelos (InnerAI → OpenRouter)

```javascript
// Novos mapeamentos necessários
'gpt-4o': 'openai/gpt-4o',
'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet-20241022',
'gemini-2-flash': 'google/gemini-2.0-flash-exp:free',
'gemini-2-pro': 'google/gemini-2.0-pro',
'grok-2': 'x-ai/grok-2',
'grok-2-vision': 'x-ai/grok-2-vision',
'llama-3.2': 'meta-llama/llama-3.2-70b-instruct',
'qwen-2.5': 'qwen/qwen-2.5-72b-instruct',
'perplexity-sonar': 'perplexity/sonar-medium-online'
```

### 3. Estrutura de Categorização

#### Por Velocidade
- **fast**: Modelos otimizados para resposta rápida
- **balanced**: Equilíbrio entre velocidade e capacidade
- **advanced**: Máxima capacidade, sem restrição de tempo

#### Por Especialidade
- **general**: Uso geral
- **code**: Programação
- **reasoning**: Raciocínio complexo
- **creative**: Conteúdo criativo
- **research**: Pesquisa e análise

### 4. Arquivos a Modificar

1. **`/lib/ai/openrouter-provider.ts`**
   - Adicionar novos mapeamentos de modelos
   - Atualizar informações de modelos (getModelInfo)
   - Adicionar custos estimados
   - Incluir na lista getAvailableModels()

2. **`/lib/ai/ai-service.ts`**
   - Atualizar array openRouterModels
   - Ajustar getModelsForPlan() para novos modelos
   - Adicionar lógica de categorização

3. **`/lib/usage-limits.ts`**
   - Definir quais modelos são "fast" vs "advanced"
   - Ajustar limites por plano

4. **`/app/dashboard/models/page.tsx`**
   - Atualizar UI para mostrar categorias
   - Adicionar badges para especialidades

### 5. Funcionalidades Extras a Considerar

#### Sistema de Créditos (para mídia)
- [ ] Criar tabela de créditos no banco
- [ ] Implementar sistema de consumo
- [ ] Adicionar providers para Flux, ElevenLabs, etc.

#### Pesquisa Web (Perplexity)
- [ ] Implementar flag webSearchEnabled
- [ ] Criar provider específico para Perplexity
- [ ] Adicionar UI para ativar/desativar

### 6. Ordem de Implementação Sugerida

1. **Fase 1 - Modelos Core**
   - GPT-4o
   - Claude 3.5 Sonnet (atualizar)
   - Gemini 2.0 Flash/Pro
   - DeepSeek R1 ✅ (já implementado)

2. **Fase 2 - Modelos Especializados**
   - Grok 2
   - Perplexity Sonar
   - Qwen 2.5
   - Llama 3.2

3. **Fase 3 - Recursos Avançados**
   - Sistema de créditos
   - Providers de mídia
   - Integração com pesquisa web

## 🎯 Próximos Passos

1. Verificar quais modelos estão realmente disponíveis no OpenRouter
2. Confirmar IDs corretos dos modelos
3. Obter informações de custo atualizadas
4. Começar implementação pela Fase 1

## 📝 Notas

- Alguns modelos da InnerAI podem ser nomes comerciais (ex: "Claude 4" ainda não existe)
- Focar primeiro nos modelos confirmados e disponíveis
- Manter compatibilidade com estrutura atual
- Adicionar testes para cada novo modelo

---

*Preparado em: Dezembro 2024*