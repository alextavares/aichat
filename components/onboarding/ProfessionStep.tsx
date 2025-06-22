"use client"

import { 
  Megaphone, 
  Scale, 
  Palette, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  Code2, 
  Video, 
  Users 
} from 'lucide-react'

interface ProfessionStepProps {
  selectedProfession: string | null
  onSelect: (profession: string) => void
}

const professions = [
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'juridico',
    name: 'Jurídico',
    icon: Scale,
    gradient: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'design',
    name: 'Design',
    icon: Palette,
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 'operacoes',
    name: 'Operações',
    icon: Settings,
    gradient: 'from-gray-600 to-gray-700'
  },
  {
    id: 'financas',
    name: 'Finanças',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'vendas',
    name: 'Vendas',
    icon: TrendingUp,
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'engenharia',
    name: 'Engenharia',
    icon: Code2,
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'criador-conteudo',
    name: 'Criador de Conteúdo',
    icon: Video,
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'recursos-humanos',
    name: 'Recursos Humanos',
    icon: Users,
    gradient: 'from-teal-500 to-green-600'
  }
]

export default function ProfessionStep({ selectedProfession, onSelect }: ProfessionStepProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {professions.map((profession) => {
        const Icon = profession.icon
        const isSelected = selectedProfession === profession.id
        
        return (
          <button
            key={profession.id}
            onClick={() => onSelect(profession.id)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200 text-center
              hover:shadow-md hover:scale-[1.02]
              ${isSelected 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border bg-card hover:border-primary/50'
              }
            `}
          >
            <div className={`
              w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${profession.gradient} 
              flex items-center justify-center
            `}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-sm font-medium text-foreground">
              {profession.name}
            </h3>

            {isSelected && (
              <div className="mt-2 w-4 h-4 mx-auto bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}