// Componente para textos com gradiente como no Inner AI

export function GradientText({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <span className={`
      bg-gradient-to-r from-primary via-secondary to-accent 
      bg-clip-text text-transparent font-bold
      ${className}
    `}>
      {children}
    </span>
  )
}