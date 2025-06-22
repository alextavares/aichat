"use client"

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  Zap,
  Download,
  Trash2,
  Info,
  Loader2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  emailNotifications: boolean
  marketingEmails: boolean
  aiResponseStyle: 'concise' | 'detailed' | 'balanced'
  autoSaveConversations: boolean
  shareUsageData: boolean
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'pt-BR',
    emailNotifications: true,
    marketingEmails: false,
    aiResponseStyle: 'balanced',
    autoSaveConversations: true,
    shareUsageData: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      setTheme(parsed.theme)
    }
  }, [setTheme])

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    if (key === 'theme') {
      setTheme(value as string)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings))
      
      // In production, save to API
      // await fetch('/api/user/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // })

      toast({
        title: "Configurações salvas!",
        description: "Suas preferências foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const exportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user/export-data')
      if (response.ok) {
        const data = await response.blob()
        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = `innerai-data-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "Dados exportados!",
          description: "Seus dados foram baixados com sucesso.",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const clearData = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      // Clear conversations and templates from API
      await fetch('/api/user/clear-data', { method: 'POST' })
      
      toast({
        title: "Dados limpos!",
        description: "Seus dados locais foram removidos.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar os dados.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência no InnerAI
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Customize a aparência da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme">Tema</Label>
              <p className="text-sm text-muted-foreground">
                Escolha entre claro, escuro ou automático
              </p>
            </div>
            <Select
              value={settings.theme}
              onValueChange={(value) => updateSetting('theme', value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Claro
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Escuro
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Sistema
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <p className="text-sm text-muted-foreground">
                Idioma da interface
              </p>
            </div>
            <Select
              value={settings.language}
              onValueChange={(value) => updateSetting('language', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Português (BR)
                  </div>
                </SelectItem>
                <SelectItem value="en-US">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    English (US)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure suas preferências de notificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notificações por email</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações importantes sobre sua conta
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Emails promocionais</Label>
              <p className="text-sm text-muted-foreground">
                Receba novidades e ofertas especiais
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Preferências de IA
          </CardTitle>
          <CardDescription>
            Configure o comportamento da IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="response-style">Estilo de resposta</Label>
              <p className="text-sm text-muted-foreground">
                Como a IA deve responder suas perguntas
              </p>
            </div>
            <Select
              value={settings.aiResponseStyle}
              onValueChange={(value) => updateSetting('aiResponseStyle', value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Conciso</SelectItem>
                <SelectItem value="balanced">Balanceado</SelectItem>
                <SelectItem value="detailed">Detalhado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Salvar conversas automaticamente</Label>
              <p className="text-sm text-muted-foreground">
                Salve automaticamente todas as conversas
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={settings.autoSaveConversations}
              onCheckedChange={(checked) => updateSetting('autoSaveConversations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidade
          </CardTitle>
          <CardDescription>
            Controle seus dados e privacidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-usage">Compartilhar dados de uso</Label>
              <p className="text-sm text-muted-foreground">
                Ajude a melhorar o InnerAI compartilhando dados anônimos
              </p>
            </div>
            <Switch
              id="share-usage"
              checked={settings.shareUsageData}
              onCheckedChange={(checked) => updateSetting('shareUsageData', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Gerenciar dados</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar dados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearData}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar dados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar configurações'
          )}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Algumas configurações são salvas localmente e podem não sincronizar entre dispositivos.
        </AlertDescription>
      </Alert>
    </div>
  )
}