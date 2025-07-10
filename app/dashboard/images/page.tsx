import { ImageGenerator } from '@/components/dashboard/image-generator'

export default function ImagesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Imagens</h1>
        <p className="text-muted-foreground">
          Crie imagens profissionais usando DALL-E 3 com qualidade HD
        </p>
      </div>
      <ImageGenerator userPlan="PRO" />
    </div>
  )
}