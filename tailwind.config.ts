import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Cores customizadas do Inner AI
  			primary: {
  				DEFAULT: 'var(--primary)',
  				hover: 'var(--primaryHover)',
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)', 
  				hover: 'var(--secondaryHover)',
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				hover: 'var(--accentHover)',
  			},
  			background: {
  				DEFAULT: 'var(--background)',
  				secondary: 'var(--backgroundSecondary)',
  				tertiary: 'var(--backgroundTertiary)',
  			},
  			text: {
  				primary: 'var(--textPrimary)',
  				secondary: 'var(--textSecondary)',
  				tertiary: 'var(--textTertiary)',
  			},
  			border: {
  				DEFAULT: 'var(--border)',
  				hover: 'var(--borderHover)',
  			},
  			// Manter cores originais para compatibilidade
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		backgroundImage: {
  			'surface': 'var(--surface)',
  			'surface-hover': 'var(--surfaceHover)',
  			'card': 'var(--cardBackground)',
  			'card-hover': 'var(--cardHover)',
  		},
  		boxShadow: {
  			'soft': 'var(--shadow)',
  			'soft-md': 'var(--shadowMd)',
  			'soft-lg': 'var(--shadowLg)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [],
};

export default config;