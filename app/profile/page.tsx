'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UserProfile {
  id: string
  email: string
  name: string | null
  planType: string
  profession: string | null
  organization: string | null
  createdAt: string
}

interface Subscription {
  id: string
  planType: string
  status: string
  startedAt: string
  expiresAt: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cancellingSubscription, setCancellingSubscription] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    organization: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session) {
      fetchProfile()
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const [profileResponse, subscriptionResponse] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/subscription')
      ])
      
      if (profileResponse.ok) {
        const data = await profileResponse.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          profession: data.profession || '',
          organization: data.organization || ''
        })
      }
      
      if (subscriptionResponse.ok) {
        const subData = await subscriptionResponse.json()
        setSubscription(subData.subscription)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE'
      })

      if (response.ok) {
        await signOut({ callbackUrl: '/' })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) {
      return
    }

    setCancellingSubscription(true)
    try {
      const response = await fetch('/api/subscription', {
        method: 'DELETE'
      })

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, planType: 'FREE' } : null)
        setSubscription(null)
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    } finally {
      setCancellingSubscription(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Erro ao carregar perfil</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Card */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">Informações Pessoais</h2>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: profile.name || '',
                      profession: profile.profession || '',
                      organization: profile.organization || ''
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-lg">{profile.email}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Nome</label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              ) : (
                <p className="text-lg">{profile.name || 'Não informado'}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Profissão</label>
              {isEditing ? (
                <Input
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  placeholder="Ex: Desenvolvedor, Designer, Marketing"
                />
              ) : (
                <p className="text-lg">{profile.profession || 'Não informado'}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Organização</label>
              {isEditing ? (
                <Input
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Nome da empresa ou organização"
                />
              ) : (
                <p className="text-lg">{profile.organization || 'Não informado'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Plan Information */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Plano Atual</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{profile.planType}</p>
              <p className="text-sm text-muted-foreground">
                Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {profile.planType === 'FREE' ? (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={() => router.push('/pricing')}
              >
                Fazer Upgrade 🚀
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push('/pricing')}
              >
                Mudar Plano
              </Button>
            )}
          </div>

          {subscription && profile.planType !== 'FREE' && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium">
                  {subscription.status === 'ACTIVE' ? 'Ativo' : 'Cancelado'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Iniciado em</span>
                <span className="text-sm">
                  {new Date(subscription.startedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {subscription.expiresAt && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Próxima renovação</span>
                  <span className="text-sm">
                    {new Date(subscription.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {subscription.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-50"
                  onClick={handleCancelSubscription}
                  disabled={cancellingSubscription}
                >
                  {cancellingSubscription ? 'Cancelando...' : 'Cancelar Assinatura'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Zona de Perigo</h2>
          <div className="space-y-4">
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Deletar Conta</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Uma vez deletada, sua conta não poderá ser recuperada. Todos os seus dados serão perdidos permanentemente.
              </p>
              <Button 
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                onClick={handleDeleteAccount}
              >
                Deletar minha conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}