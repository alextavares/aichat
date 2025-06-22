"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload } from 'lucide-react'

interface ProfileStepProps {
  profileData: {
    name: string
    lastName: string
    phone: string
    organization: string
    profileImage?: string
  }
  onUpdate: (data: any) => void
}

export default function ProfileStep({ profileData, onUpdate }: ProfileStepProps) {
  const [formData, setFormData] = useState(profileData)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    onUpdate(formData)
  }, [formData, onUpdate])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setImagePreview(imageUrl)
        setFormData(prev => ({ ...prev, profileImage: imageUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = () => {
    return `${formData.name.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={imagePreview || formData.profileImage} />
            <AvatarFallback className="bg-primary text-white text-xl">
              {getInitials() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
            onClick={() => document.getElementById('profile-image')?.click()}
          >
            <Camera className="w-4 h-4" />
          </Button>
          
          <input
            id="profile-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        
        <Button variant="ghost" size="sm" className="text-primary">
          <Upload className="w-4 h-4 mr-2" />
          Escolher Foto
        </Button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Alexandre"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Tavares"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Organização</Label>
        <Input
          id="organization"
          value={formData.organization}
          onChange={(e) => handleInputChange('organization', e.target.value)}
          placeholder="Organização Pessoal"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Número de Telefone</Label>
        <div className="flex">
          <div className="flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-md">
            <span className="text-2xl mr-2">🇧🇷</span>
            <span className="text-sm text-muted-foreground">+55</span>
          </div>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="11 96123-4567"
            className="rounded-l-none"
          />
        </div>
      </div>
    </div>
  )
}