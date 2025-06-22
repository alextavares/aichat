"use client"

import { Briefcase, User, GraduationCap } from 'lucide-react'

interface UsageTypeStepProps {
  selectedType: string | null
  onSelect: (type: string) => void
}

const usageTypes = [
  {
    id: 'TRABALHO',
    name: 'Trabalho',
    description: 'Para uso profissional e empresarial',
    icon: Briefcase,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'USO_PESSOAL', 
    name: 'Uso Pessoal',
    description: 'Para projetos pessoais e hobbies',
    icon: User,
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'ESCOLA',
    name: 'Escola',
    description: 'Para estudos e atividades acadêmicas',
    icon: GraduationCap,
    gradient: 'from-purple-500 to-purple-600'
  }
]

export default function UsageTypeStep({ selectedType, onSelect }: UsageTypeStepProps) {
  return (
    <div className="space-y-4">
      {usageTypes.map((type) => {
        const Icon = type.icon
        const isSelected = selectedType === type.id
        
        return (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`
              w-full p-6 rounded-xl border-2 transition-all duration-200 text-left
              hover:shadow-lg hover:scale-[1.02]
              ${isSelected 
                ? 'border-primary bg-primary/5 shadow-lg' 
                : 'border-border bg-card hover:border-primary/50'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-lg bg-gradient-to-br ${type.gradient} 
                flex items-center justify-center flex-shrink-0
              `}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {type.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {type.description}
                </p>
              </div>

              {isSelected && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}