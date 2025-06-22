declare module 'next/server' {
  export type NextRequest = any;
  export type NextResponse = any;
  export const NextResponse: any;
  export type NextMiddleware = any;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function useSearchParams(): any;
  export function usePathname(): any;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'next/headers' {
  export function headers(): any;
  export function cookies(): any;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/font/google' {
  export function Inter(config: any): any;
  export function Roboto(config: any): any;
}

declare module 'next' {
  export type Metadata = any;
  export type NextConfig = any;
}

declare module 'date-fns' {
  export function format(date: Date, formatStr: string, options?: any): string;
  export function formatDistanceToNow(date: Date, options?: any): string;
  export function parseISO(dateStr: string): Date;
}

declare module 'date-fns/locale' {
  export const ptBR: any;
  export const enUS: any;
}