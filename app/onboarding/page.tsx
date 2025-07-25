"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

import OnboardingLayout from '@/components/onboarding/OnboardingLayout'
import UsageTypeStep from '@/components/onboarding/UsageTypeStep'
import ProfessionStep from '@/components/onboarding/ProfessionStep'
import ProfileStep from '@/components/onboarding/ProfileStep'

interface OnboardingData {
  usageType: string | null
  profession: string | null
  profile: {
    name: string
    lastName: string
    phone: string
    organization: string
    profileImage?: string
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    usageType: null,
    profession: null,
    profile: {
      name: '',
      lastName: '',
      phone: '',
      organization: 'Organização Pessoal',
      profileImage: undefined
    }
  })

  // Initialize profile data from session when available
  useEffect(() => {
    if (session?.user) {
      const fullName = session.user.name || ''
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      setData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: firstName,
          lastName: lastName,
          profileImage: session.user.image || undefined
        }
      }))
    }
  }, [session?.user?.name, session?.user?.image])

  const totalSteps = 3

  const stepConfig = [
    {
      title: "Vamos começar!",
      subtitle: "Estou planejando usar o Inner AI para..."
    },
    {
      title: "Sobre o seu trabalho",
      subtitle: "Conta pra gente de qual time você faz parte..."
    },
    {
      title: "Complete seu Perfil",
      subtitle: "Finalize seu cadastro para personalizar sua experiência"
    }
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.usageType !== null
      case 2:
        return data.profession !== null
      case 3:
        return data.profile.name && data.profile.lastName && data.profile.phone
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usageType: data.usageType,
          professionCategory: data.profession,
          name: data.profile.name,
          lastName: data.profile.lastName,
          phone: data.profile.phone,
          organization: data.profile.organization,
          profileImage: data.profile.profileImage
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar dados do onboarding')
      }

      // Update session
      await update()
      
      toast({
        title: "Onboarding concluído!",
        description: "Seu perfil foi configurado com sucesso.",
      })

      // Force a hard redirect to ensure the onboarding page is completely closed
      window.location.href = '/dashboard'
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o onboarding. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Memoized callback functions to prevent infinite re-renders
  const handleUsageTypeSelect = useCallback((type: string) => {
    setData(prev => ({ ...prev, usageType: type }))
  }, [])

  const handleProfessionSelect = useCallback((profession: string) => {
    setData(prev => ({ ...prev, profession }))
  }, [])

  const handleProfileUpdate = useCallback((profile: any) => {
    setData(prev => ({ ...prev, profile }))
  }, [])

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UsageTypeStep
            selectedType={data.usageType}
            onSelect={handleUsageTypeSelect}
          />
        )
      case 2:
        return (
          <ProfessionStep
            selectedProfession={data.profession}
            onSelect={handleProfessionSelect}
          />
        )
      case 3:
        return (
          <ProfileStep
            profileData={data.profile}
            onUpdate={handleProfileUpdate}
          />
        )
      default:
        return null
    }
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={stepConfig[currentStep - 1].title}
      subtitle={stepConfig[currentStep - 1].subtitle}
    >
      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isLoading}
          className="flex items-center gap-2 gradient-primary text-white"
        >
          {isLoading ? (
            "Salvando..."
          ) : currentStep === totalSteps ? (
            "Finalizar"
          ) : (
            <>
              Próximo
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Skip Option */}
      {currentStep < totalSteps && (
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            Pular por agora
          </Button>
        </div>
      )}
    </OnboardingLayout>
  )
}