
// Global type definitions for missing modules
declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  
  function pdfParse(buffer: Buffer | Uint8Array, options?: any): Promise<PDFData>;
  export = pdfParse;
}

declare module 'bun' {
  export function write(path: string, data: string): Promise<void>;
}

// Fix any context type issues
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      OPENAI_API_KEY?: string;
      OPENROUTER_API_KEY?: string;
      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      MERCADOPAGO_ACCESS_TOKEN?: string;
    }
  }
}

export {};
