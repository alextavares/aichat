// Este arquivo contém as definições de cores e variáveis CSS para os temas
// Baseado nas cores do Inner AI:
// - Primary: #8B5CF6 (roxo vibrante)
// - Secondary: #3B82F6 (azul)
// - Accent: #10B981 (verde)
// - Gradientes vibrantes
// - Backgrounds claros com sutileza

export const themes = {
  light: {
    // Cores principais
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    secondary: '#3B82F6', 
    secondaryHover: '#2563EB',
    accent: '#10B981',
    accentHover: '#059669',
    
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    
    // Superfícies com gradiente sutil
    surface: 'linear-gradient(to bottom right, #FFFFFF, #F9FAFB)',
    surfaceHover: 'linear-gradient(to bottom right, #F9FAFB, #F3F4F6)',
    
    // Texto
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // Bordas
    border: '#E5E7EB',
    borderHover: '#D1D5DB',
    
    // Cards com gradiente
    cardBackground: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
    cardHover: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
    
    // Sombras suaves
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  dark: {
    // Manter o tema dark atual mas com toques de cor
    primary: '#8B5CF6',
    primaryHover: '#9333EA',
    secondary: '#3B82F6',
    secondaryHover: '#60A5FA',
    accent: '#10B981',
    accentHover: '#34D399',
    
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    
    surface: 'linear-gradient(to bottom right, #1E293B, #334155)',
    surfaceHover: 'linear-gradient(to bottom right, #334155, #475569)',
    
    textPrimary: '#F9FAFB',
    textSecondary: '#E5E7EB',
    textTertiary: '#9CA3AF',
    
    border: '#334155',
    borderHover: '#475569',
    
    cardBackground: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    cardHover: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
    
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  }
}