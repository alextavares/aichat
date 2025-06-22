/**
 * 🚀 MODO DE DESENVOLVIMENTO RÁPIDO
 * Configurações para acelerar o desenvolvimento
 */

module.exports = {
  // Desabilita checagem de tipos durante dev (mantém em build)
  typescript: {
    ignoreBuildErrors: false, // Manter false para pegar erros no build
    tsconfigPath: './tsconfig.dev.json' // Config otimizada para dev
  },

  // Otimizações do Webpack
  webpack: {
    // Cache agressivo
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    },
    
    // Ignora warnings não críticos
    ignoreWarnings: [
      /export .* was not found in/,
      /Module not found: Can't resolve/
    ],

    // Source maps rápidos para dev
    devtool: 'eval-cheap-module-source-map'
  },

  // Hot Reload otimizado
  experimental: {
    // Turbopack para builds mais rápidos (experimental)
    turbo: {
      rules: {
        '*.module.css': {
          loaders: ['css-loader'],
          as: 'css',
        },
      },
    },
    
    // React Compiler (experimental)
    reactCompiler: true,
    
    // Otimizações de memória
    workerThreads: true,
    cpus: 4
  },

  // Configurações específicas para dev
  env: {
    // Desabilita telemetria em dev
    NEXT_TELEMETRY_DISABLED: '1',
    
    // Modo de desenvolvimento
    NODE_ENV: 'development',
    
    // Desabilita verificações desnecessárias
    SKIP_ENV_VALIDATION: 'true',
    
    // Cache agressivo
    FORCE_COLOR: '1'
  }
}