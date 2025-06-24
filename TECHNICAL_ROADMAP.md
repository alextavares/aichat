# 🛠️ Roadmap Técnico de Implementação

## 📅 Sprint 1: Melhorias de UI/UX (1 semana)

### 1. Login Social com NextAuth
```bash
npm install @auth/google-adapter @auth/microsoft-adapter
```

**Arquivos a modificar:**
- `/lib/auth.ts` - Adicionar providers
- `/app/api/auth/[...nextauth]/route.ts` - Configurar callbacks
- `.env.local` - Adicionar OAuth credentials

### 2. Redesign do Dashboard

**Componentes a criar:**
```typescript
// /components/dashboard/tool-card.tsx
interface ToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  preview?: string
  onClick: () => void
}

// /components/dashboard/feature-grid.tsx
// Grid responsivo para os cards
```

### 3. Seletor de Modelos Visual

```typescript
// /components/chat/model-selector.tsx
const models = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    speed: 'fast',
    cost: '$$',
    capabilities: ['reasoning', 'code', 'creative']
  },
  // ... outros modelos
]
```

## 📅 Sprint 2: Geração de Imagens (2 semanas)

### 1. Integração DALL-E 3

```typescript
// /lib/image-generation.ts
import OpenAI from 'openai'

export async function generateImage(prompt: string, options?: ImageOptions) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: options?.size || "1024x1024",
    quality: options?.quality || "standard",
    style: options?.style || "vivid",
  })
  
  return response.data[0].url
}
```

### 2. UI de Geração

```typescript
// /app/dashboard/images/page.tsx
// Interface com:
// - Textarea para prompt
// - Seletores de estilo/tamanho
// - Grid de imagens geradas
// - Download/compartilhamento
```

### 3. Banco de Dados

```prisma
// Adicionar ao schema.prisma
model GeneratedImage {
  id        String   @id @default(cuid())
  userId    String
  prompt    String   @db.Text
  imageUrl  String
  style     String?
  size      String
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

## 📅 Sprint 3: Transcrição de Vídeo (2 semanas)

### 1. Upload de Vídeos

```typescript
// /app/api/upload/video/route.ts
import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  
  // Validar tipo e tamanho
  // Salvar temporariamente
  // Retornar ID para processamento
}
```

### 2. Integração Whisper

```typescript
// /lib/transcription.ts
export async function transcribeVideo(videoPath: string) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(videoPath),
    model: "whisper-1",
    response_format: "srt"
  })
  
  return transcription
}
```

### 3. Editor de Legendas

```typescript
// /components/video/subtitle-editor.tsx
// Interface para:
// - Visualizar vídeo com legendas
// - Editar timestamps
// - Exportar SRT/VTT
```

## 📅 Sprint 4: Knowledge Base (3 semanas)

### 1. Upload e Processamento de Documentos

```typescript
// /lib/document-processor.ts
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export async function processDocument(filePath: string) {
  const loader = new PDFLoader(filePath)
  const docs = await loader.load()
  
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  
  return await splitter.splitDocuments(docs)
}
```

### 2. Vector Database (Pinecone/Supabase)

```typescript
// /lib/vector-store.ts
import { SupabaseVectorStore } from "langchain/vectorstores/supabase"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"

export async function indexDocument(chunks: Document[]) {
  const vectorStore = await SupabaseVectorStore.fromDocuments(
    chunks,
    new OpenAIEmbeddings(),
    {
      client: supabaseClient,
      tableName: "documents",
    }
  )
}
```

### 3. RAG Integration

```typescript
// /lib/rag-chat.ts
export async function chatWithDocuments(
  query: string, 
  userId: string
) {
  // 1. Buscar documentos relevantes
  const relevantDocs = await vectorStore.similaritySearch(query, 5)
  
  // 2. Construir contexto
  const context = relevantDocs.map(doc => doc.pageContent).join('\n')
  
  // 3. Gerar resposta
  return await generateResponse(query, context)
}
```

## 🔧 Configurações e Dependências

### Novas Dependências
```json
{
  "dependencies": {
    // Autenticação
    "@auth/google-adapter": "^1.0.0",
    "@auth/microsoft-adapter": "^1.0.0",
    
    // Processamento
    "langchain": "^0.1.0",
    "@langchain/openai": "^0.0.10",
    "@supabase/supabase-js": "^2.39.0",
    "pdf-parse": "^1.1.1",
    
    // Upload
    "multer": "^1.4.5",
    "sharp": "^0.33.0",
    
    // UI
    "react-dropzone": "^14.2.0",
    "react-player": "^2.13.0"
  }
}
```

### Variáveis de Ambiente
```env
# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=

# Storage
SUPABASE_URL=
SUPABASE_ANON_KEY=
UPLOAD_DIR=/tmp/uploads

# APIs
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
```

## 📊 Métricas de Sucesso

1. **Performance**
   - Tempo de geração de imagem < 5s
   - Upload de vídeo até 500MB
   - Busca em documentos < 2s

2. **Qualidade**
   - Accuracy de transcrição > 95%
   - Relevância de RAG > 80%
   - Uptime > 99.9%

3. **Adoção**
   - 50% dos usuários usando nova feature em 30 dias
   - NPS > 50
   - Churn < 5%

## 🚨 Considerações de Segurança

1. **Upload de Arquivos**
   - Validar tipos MIME
   - Scan antivírus
   - Limite de tamanho
   - Rate limiting

2. **Dados Sensíveis**
   - Criptografia em repouso
   - Isolamento por usuário
   - Logs de acesso
   - LGPD compliance

3. **APIs Externas**
   - Rate limiting
   - Fallback providers
   - Cache de resultados
   - Monitoramento de custos