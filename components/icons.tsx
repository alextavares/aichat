import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
  Github,
  type LucideIcon,
} from "lucide-react"

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertCircle,
  user: User,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  gitHub: Github,
  twitter: Twitter,
  check: Check,
  google: ({ ...props }: React.ComponentProps<'svg'>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  ),
  microsoft: ({ ...props }: React.ComponentProps<'svg'>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#f25022" d="M11.4 11.4H0V0h11.4v11.4Z"/>
      <path fill="#00a4ef" d="M24 11.4H12.6V0H24v11.4Z"/>
      <path fill="#7fba00" d="M11.4 24H0V12.6h11.4V24Z"/>
      <path fill="#ffb900" d="M24 24H12.6V12.6H24V24Z"/>
    </svg>
  ),
  apple: ({ ...props }: React.ComponentProps<'svg'>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.36-1.09-.55-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.36C2.44 15.15 3.51 7.68 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.87 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.59 1.48-1.35 2.95-2.53 4.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.52-3.74 4.25z"
      />
    </svg>
  ),
} as const

export type Icon = LucideIcon