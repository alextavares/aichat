import OpenAI from 'openai'

export interface AudioTranscriptionOptions {
  file: File
  model?: 'whisper-1'
  language?: string
  prompt?: string
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
  temperature?: number
}

export interface AudioTranscriptionResponse {
  text: string
  language?: string
  duration?: number
  segments?: Array<{
    id: number
    seek: number
    start: number
    end: number
    text: string
    tokens: number[]
    temperature: number
    avg_logprob: number
    compression_ratio: number
    no_speech_prob: number
  }>
  cost: number
  model: string
}

export class WhisperProvider {
  private openai: OpenAI | null = null
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey })
    }
  }

  async transcribeAudio(options: AudioTranscriptionOptions): Promise<AudioTranscriptionResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured')
    }

    const {
      file,
      model = 'whisper-1',
      language,
      prompt,
      response_format = 'verbose_json',
      temperature = 0
    } = options

    // Validate file size (25MB limit for Whisper)
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Limite máximo: 25MB')
    }

    // Validate file type
    const supportedFormats = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/mp4', 'audio/webm', 'audio/ogg', 'video/mp4',
      'video/webm', 'video/quicktime'
    ]
    
    if (!supportedFormats.includes(file.type)) {
      throw new Error('Formato de arquivo não suportado. Use MP3, WAV, M4A, MP4, WebM, OGG ou MOV')
    }

    try {
      const response = await this.openai.audio.transcriptions.create({
        file: file,
        model: model,
        language: language,
        prompt: prompt,
        response_format: response_format,
        temperature: temperature
      })

      // Calculate cost based on audio duration
      // Whisper costs $0.006 per minute
      const audioDuration = await this.getAudioDuration(file)
      const durationMinutes = audioDuration / 60
      const cost = durationMinutes * 0.006

      if (response_format === 'verbose_json') {
        return {
          text: (response as any).text,
          language: (response as any).language,
          duration: (response as any).duration,
          segments: (response as any).segments,
          cost,
          model
        }
      } else {
        return {
          text: response as string,
          cost,
          model
        }
      }
    } catch (error) {
      console.error('Whisper API error:', error)
      throw new Error('Erro ao transcrever áudio')
    }
  }

  private async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src)
        resolve(audio.duration || 0)
      }
      
      audio.onerror = () => {
        resolve(0) // Fallback if duration can't be determined
      }
      
      audio.src = URL.createObjectURL(file)
    })
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  getSupportedFormats() {
    return [
      { format: 'MP3', mime: 'audio/mpeg', description: 'Áudio MP3' },
      { format: 'WAV', mime: 'audio/wav', description: 'Áudio WAV' },
      { format: 'M4A', mime: 'audio/m4a', description: 'Áudio M4A' },
      { format: 'MP4', mime: 'video/mp4', description: 'Vídeo MP4' },
      { format: 'WebM', mime: 'video/webm', description: 'Vídeo WebM' },
      { format: 'OGG', mime: 'audio/ogg', description: 'Áudio OGG' },
      { format: 'MOV', mime: 'video/quicktime', description: 'Vídeo QuickTime' }
    ]
  }

  getLanguageOptions() {
    return [
      { code: 'auto', name: 'Detectar automaticamente' },
      { code: 'pt', name: 'Português' },
      { code: 'en', name: 'Inglês' },
      { code: 'es', name: 'Espanhol' },
      { code: 'fr', name: 'Francês' },
      { code: 'de', name: 'Alemão' },
      { code: 'it', name: 'Italiano' },
      { code: 'ja', name: 'Japonês' },
      { code: 'ko', name: 'Coreano' },
      { code: 'zh', name: 'Chinês' },
      { code: 'ru', name: 'Russo' },
      { code: 'ar', name: 'Árabe' },
      { code: 'hi', name: 'Hindi' }
    ]
  }
}

export const whisperProvider = new WhisperProvider()