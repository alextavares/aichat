'use client'

import { useAccessibility } from './AccessibilityProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { Settings, Eye, Type, Volume2 } from 'lucide-react'

export function AccessibilityControls() {
  const {
    highContrast,
    reducedMotion,
    fontSize,
    setHighContrast,
    setReducedMotion,
    setFontSize,
    announce,
  } = useAccessibility()

  const handleHighContrastChange = (enabled: boolean) => {
    setHighContrast(enabled)
    announce(enabled ? 'Alto contraste ativado' : 'Alto contraste desativado')
  }

  const handleReducedMotionChange = (enabled: boolean) => {
    setReducedMotion(enabled)
    announce(enabled ? 'Animações reduzidas ativadas' : 'Animações reduzidas desativadas')
  }

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size)
    const sizeNames = {
      small: 'pequeno',
      medium: 'médio',
      large: 'grande'
    }
    announce(`Tamanho da fonte alterado para ${sizeNames[size]}`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Abrir configurações de acessibilidade"
          title="Configurações de Acessibilidade"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Configurações de Acessibilidade
          </DialogTitle>
          <DialogDescription>
            Ajuste as configurações para melhorar sua experiência de navegação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* High Contrast */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Contraste Visual
              </CardTitle>
              <CardDescription>
                Aumenta o contraste para melhor visibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm font-medium">
                  Alto Contraste
                </Label>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={handleHighContrastChange}
                  aria-describedby="high-contrast-description"
                />
              </div>
              <p id="high-contrast-description" className="text-xs text-muted-foreground mt-2">
                {highContrast ? 'Ativado' : 'Desativado'}
              </p>
            </CardContent>
          </Card>

          {/* Reduced Motion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Movimento
              </CardTitle>
              <CardDescription>
                Reduz animações e transições para conforto visual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm font-medium">
                  Reduzir Animações
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={handleReducedMotionChange}
                  aria-describedby="reduced-motion-description"
                />
              </div>
              <p id="reduced-motion-description" className="text-xs text-muted-foreground mt-2">
                {reducedMotion ? 'Animações reduzidas' : 'Animações normais'}
              </p>
            </CardContent>
          </Card>

          {/* Font Size */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4" />
                Tamanho do Texto
              </CardTitle>
              <CardDescription>
                Ajusta o tamanho da fonte para melhor legibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-sm font-medium">
                  Tamanho da Fonte
                </Label>
                <Select
                  value={fontSize}
                  onValueChange={handleFontSizeChange}
                >
                  <SelectTrigger id="font-size" aria-describedby="font-size-description">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
                <p id="font-size-description" className="text-xs text-muted-foreground">
                  Tamanho atual: {fontSize === 'small' ? 'Pequeno' : fontSize === 'medium' ? 'Médio' : 'Grande'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Navigation Help */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Navegação por Teclado</CardTitle>
              <CardDescription>
                Atalhos úteis para navegação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div><kbd className="px-2 py-1 bg-muted rounded">Tab</kbd> - Navegar para frente</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Shift + Tab</kbd> - Navegar para trás</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> - Ativar elemento</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> - Fechar diálogos</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}