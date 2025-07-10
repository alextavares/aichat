"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Copy,
  Check,
  Upload,
  FileAudio,
  Download,
  Play,
  Pause,
  Mic,
  Clock,
  Globe
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AudioTranscriberProps {
  userPlan: string
}

interface TranscriptionResult {
  id: string
  filename: string
  text: string
  language?: string
  duration?: number
  segments?: Array<{
    id: number
    start: number
    end: number
    text: string
  }>
  timestamp: Date
  cost: number
}

const supportedFormats = [
  { format: 'MP3', description: 'Áudio MP3' },
  { format: 'WAV', description: 'Áudio WAV' },
  { format: 'M4A', description: 'Áudio M4A' },
  { format: 'MP4', description: 'Vídeo MP4' },
  { format: 'WebM', description: 'Vídeo WebM' },
  { format: 'OGG', description: 'Áudio OGG' },
  { format: 'MOV', description: 'Vídeo QuickTime' }
]

const languages = [
  { code: 'auto', name: 'Detectar automaticamente' },
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'Inglês' },
  { code: 'es', name: 'Espanhol' },
  { code: 'fr', name: 'Francês' },
  { code: 'de', name: 'Alemão' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: 'Japonês' },
  { code: 'zh', name: 'Chinês' }
]

const outputFormats = [
  { value: 'text', label: 'Texto simples', description: 'Apenas o texto transcrito' },
  { value: 'verbose_json', label: 'Com timestamps', description: 'Texto com marcações de tempo' },
  { value: 'srt', label: 'Legendas SRT', description: 'Arquivo de legenda' },
  { value: 'vtt', label: 'Legendas WebVTT', description: 'Arquivo de legenda web' }
]

export function AudioTranscriber({ userPlan }: AudioTranscriberProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('auto')
  const [outputFormat, setOutputFormat] = useState('verbose_json')
  const [prompt, setPrompt] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [results, setResults] = useState<TranscriptionResult[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 25MB",
          variant: "destructive"
        })
        return
      }

      setSelectedFile(file)
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`
      })
    }
  }

  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo de áudio",
        variant: "destructive"
      })
      return
    }

    if (userPlan === 'FREE') {
      toast({
        title: "Upgrade Necessário",
        description: "Transcrição de áudio disponível apenas para planos LITE e PRO",
        variant: "destructive"
      })
      return
    }

    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('language', language)
      formData.append('prompt', prompt)
      formData.append('response_format', outputFormat)

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao transcrever áudio')
      }

      const data = await response.json()
      const newResult: TranscriptionResult = {
        id: Date.now().toString(),
        filename: selectedFile.name,
        text: data.transcription,
        language: data.language,
        duration: data.duration,
        segments: data.segments,
        timestamp: new Date(),
        cost: data.cost
      }

      setResults(prev => [newResult, ...prev.slice(0, 4)]) // Keep last 5 results
      
      toast({
        title: "Transcrição Concluída!",
        description: `${selectedFile.name} foi transcrito com sucesso`
      })
    } catch (error) {
      console.error('Error transcribing audio:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao transcrever áudio",
        variant: "destructive"
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copiado!",
        description: "Transcrição copiada para a área de transferência"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar texto",
        variant: "destructive"
      })
    }
  }

  const handleDownload = (text: string, filename: string, format: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename.split('.')[0]}-transcription.${format === 'srt' || format === 'vtt' ? format : 'txt'}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Mic className="h-6 w-6" />
          Transcritor de Áudio
        </h2>
        <p className="text-muted-foreground">
          Converta áudio e vídeo em texto com alta precisão usando Whisper AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload de Arquivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm,.ogg,.mov"
                className="hidden"
              />
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {selectedFile ? (
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">Selecione um arquivo</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Arraste e solte ou clique para escolher
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Máximo: 25MB | Formatos: MP3, WAV, M4A, MP4, WebM, OGG, MOV
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Supported Formats */}
            <div>
              <label className="text-sm font-medium mb-2 block">Formatos Suportados</label>
              <div className="grid grid-cols-3 gap-2">
                {supportedFormats.slice(0, 6).map((format) => (
                  <Badge key={format.format} variant="outline" className="justify-center">
                    {format.format}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Idioma
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Formato de Saída</label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-muted-foreground">{format.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Contexto (opcional)
                </label>
                <Input
                  placeholder="Ex: nomes próprios, termos técnicos que aparecem no áudio..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>

            {/* Transcribe Button */}
            <Button 
              onClick={handleTranscribe} 
              disabled={isTranscribing || !selectedFile || userPlan === 'FREE'}
              className="w-full"
              size="lg"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Transcrevendo...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Transcrever Áudio
                </>
              )}
            </Button>

            {userPlan === 'FREE' && (
              <p className="text-sm text-muted-foreground text-center">
                🎙️ Transcrição disponível nos planos LITE e PRO
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Transcrições</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.slice(0, 3).map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileAudio className="h-4 w-4" />
                        <span className="font-medium text-sm">{result.filename}</span>
                        {result.language && (
                          <Badge variant="outline" className="text-xs">
                            {result.language.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(result.text, result.id)}
                        >
                          {copiedId === result.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(result.text, result.filename, outputFormat)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {result.duration && (
                      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(result.duration)}
                        </span>
                        <span>Custo: ${result.cost.toFixed(4)}</span>
                      </div>
                    )}

                    <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
                      {result.segments && outputFormat === 'verbose_json' ? (
                        <div className="space-y-1">
                          {result.segments.slice(0, 10).map((segment) => (
                            <div key={segment.id} className="flex gap-2">
                              <span className="text-muted-foreground text-xs min-w-[40px]">
                                {formatTimestamp(segment.start)}
                              </span>
                              <span>{segment.text.trim()}</span>
                            </div>
                          ))}
                          {result.segments.length > 10 && (
                            <p className="text-muted-foreground text-xs">
                              +{result.segments.length - 10} segmentos...
                            </p>
                          )}
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap">{result.text}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Faça upload de um arquivo de áudio para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}