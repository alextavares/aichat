import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react"

interface ErrorAlertProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info'
  className?: string
}

const iconMap = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const variantMap = {
  error: 'destructive',
  warning: 'default',
  info: 'default'
} as const

export function ErrorAlert({ 
  title, 
  message, 
  type = 'error',
  className 
}: ErrorAlertProps) {
  const Icon = iconMap[type] || AlertCircle
  const variant = variantMap[type]
  
  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className="whitespace-pre-line">
        {message}
      </AlertDescription>
    </Alert>
  )
}