'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Template {
  id: string
  name: string
  description?: string
  category: string
  templateContent: string
  variables?: string[]
  usageCount: number
  creator?: {
    name?: string
    email: string
  }
}

interface TemplateSelectorProps {
  onUseTemplate: (content: string) => void
  onClose: () => void
}

const categories = [
  'TRABALHO',
  'MARKETING', 
  'DESIGN',
  'VENDAS',
  'OPERACOES',
  'FINANCAS',
  'ENGENHARIA',
  'CRIADOR_CONTEUDO',
  'RECURSOS_HUMANOS'
]

export default function TemplateSelector({ onUseTemplate, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const url = selectedCategory 
        ? `/api/templates?category=${selectedCategory}`
        : '/api/templates'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async (template: Template) => {
    try {
      // Track usage
      await fetch(`/api/templates/${template.id}/use`, {
        method: 'POST'
      })

      if (template.variables && template.variables.length > 0) {
        setSelectedTemplate(template)
        // Initialize variable values
        const initialValues: Record<string, string> = {}
        template.variables.forEach(variable => {
          initialValues[variable] = ''
        })
        setVariableValues(initialValues)
      } else {
        onUseTemplate(template.templateContent)
        onClose()
      }
    } catch (error) {
      console.error('Error using template:', error)
      // Still allow using the template even if tracking fails
      onUseTemplate(template.templateContent)
      onClose()
    }
  }

  const handleVariableTemplate = () => {
    if (!selectedTemplate) return

    let content = selectedTemplate.templateContent
    Object.entries(variableValues).forEach(([variable, value]) => {
      content = content.replace(new RegExp(`\\{${variable}\\}`, 'g'), value)
    })

    onUseTemplate(content)
    onClose()
  }

  const formatCategoryName = (category: string) => {
    return category.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (selectedTemplate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                ← Voltar
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Preencha as variáveis abaixo:
              </p>
              
              {selectedTemplate.variables?.map((variable) => (
                <div key={variable} className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    value={variableValues[variable] || ''}
                    onChange={(e) => setVariableValues(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder={`Digite ${variable}...`}
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preview:</label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm">
                {(() => {
                  let preview = selectedTemplate.templateContent
                  Object.entries(variableValues).forEach(([variable, value]) => {
                    preview = preview.replace(
                      new RegExp(`\\{${variable}\\}`, 'g'), 
                      value || `{${variable}}`
                    )
                  })
                  return preview
                })()}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleVariableTemplate} className="flex-1">
                Usar Template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Templates de Prompts</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕ Fechar
            </Button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {formatCategoryName(category)}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {formatCategoryName(template.category)}
                    </span>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {template.templateContent.substring(0, 100)}...
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Usado {template.usageCount} vezes</span>
                    {template.variables && template.variables.length > 0 && (
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {template.variables.length} variáveis
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {templates.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhum template encontrado nesta categoria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}