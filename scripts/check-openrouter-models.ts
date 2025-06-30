// Script para verificar modelos disponíveis no OpenRouter
async function checkOpenRouterModels() {
  console.log('🔍 Verificando modelos disponíveis no OpenRouter...\n');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();
    
    // Modelos que queremos verificar
    const targetModels = [
      'gpt-4o',
      'claude-3.5',
      'gemini',
      'grok',
      'perplexity',
      'llama-3',
      'qwen',
      'mistral-large'
    ];
    
    console.log('📊 Total de modelos disponíveis:', data.data.length);
    console.log('\n🎯 Modelos relevantes encontrados:\n');
    
    const relevantModels = data.data.filter((model: any) => 
      targetModels.some(target => model.id.toLowerCase().includes(target))
    );
    
    // Organizar por categoria
    const categories: Record<string, any[]> = {
      'OpenAI': [],
      'Anthropic': [],
      'Google': [],
      'xAI': [],
      'Perplexity': [],
      'Meta': [],
      'Outros': []
    };
    
    relevantModels.forEach((model: any) => {
      const modelInfo = {
        id: model.id,
        name: model.name,
        contextLength: model.context_length,
        pricing: model.pricing
      };
      
      if (model.id.includes('openai/')) categories['OpenAI'].push(modelInfo);
      else if (model.id.includes('anthropic/')) categories['Anthropic'].push(modelInfo);
      else if (model.id.includes('google/')) categories['Google'].push(modelInfo);
      else if (model.id.includes('x-ai/')) categories['xAI'].push(modelInfo);
      else if (model.id.includes('perplexity/')) categories['Perplexity'].push(modelInfo);
      else if (model.id.includes('meta-llama/')) categories['Meta'].push(modelInfo);
      else categories['Outros'].push(modelInfo);
    });
    
    // Exibir resultados organizados
    Object.entries(categories).forEach(([category, models]) => {
      if (models.length > 0) {
        console.log(`\n### ${category}`);
        models.forEach(model => {
          console.log(`- ${model.name}`);
          console.log(`  ID: ${model.id}`);
          console.log(`  Context: ${model.contextLength} tokens`);
          if (model.pricing) {
            console.log(`  Custo: $${model.pricing.prompt}/1k prompt, $${model.pricing.completion}/1k completion`);
          }
        });
      }
    });
    
    // Salvar em arquivo JSON
    const output = {
      timestamp: new Date().toISOString(),
      totalModels: data.data.length,
      relevantModels: categories
    };
    
    await Bun.write(
      './openrouter-models-available.json',
      JSON.stringify(output, null, 2)
    );
    
    console.log('\n✅ Resultado salvo em openrouter-models-available.json');
    
  } catch (error) {
    console.error('❌ Erro ao buscar modelos:', error);
  }
}

checkOpenRouterModels();