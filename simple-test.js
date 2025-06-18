// Teste simples para verificar funcionalidades básicas
const http = require('http');

console.log('🧪 Iniciando teste simples do Inner AI Clone...\n');

// Teste 1: Verificar se o servidor está rodando
function testServerConnection() {
    return new Promise((resolve, reject) => {
        console.log('1️⃣ Testando conexão com servidor...');
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 200 || res.statusCode === 302) {
                console.log('✅ Servidor está respondendo!\n');
                resolve(true);
            } else {
                console.log(`❌ Servidor retornou status ${res.statusCode}\n`);
                resolve(false);
            }
        });

        req.on('error', (e) => {
            console.log(`❌ Erro ao conectar: ${e.message}`);
            console.log('💡 Dica: Execute "npm run dev" em outro terminal\n');
            resolve(false);
        });

        req.end();
    });
}

// Teste 2: Verificar estrutura de arquivos
function testFileStructure() {
    console.log('2️⃣ Verificando estrutura de arquivos...');
    const fs = require('fs');
    
    const requiredFiles = [
        'package.json',
        'app/page.tsx',
        'app/dashboard/page.tsx',
        'app/api/chat/route.ts',
        'components/chat/chat-interface.tsx',
        'prisma/schema.prisma'
    ];
    
    let allFilesExist = true;
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ❌ ${file} não encontrado`);
            allFilesExist = false;
        }
    });
    
    console.log(allFilesExist ? '\n✅ Estrutura de arquivos OK!\n' : '\n❌ Alguns arquivos estão faltando\n');
    return allFilesExist;
}

// Teste 3: Verificar configurações
function testConfiguration() {
    console.log('3️⃣ Verificando configurações...');
    const fs = require('fs');
    
    // Verificar .env.local
    if (fs.existsSync('.env.local')) {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const requiredVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'NEXTAUTH_SECRET'
        ];
        
        let allVarsPresent = true;
        requiredVars.forEach(varName => {
            if (envContent.includes(varName)) {
                console.log(`  ✅ ${varName} configurado`);
            } else {
                console.log(`  ❌ ${varName} não encontrado`);
                allVarsPresent = false;
            }
        });
        
        console.log(allVarsPresent ? '\n✅ Configurações OK!\n' : '\n❌ Algumas variáveis estão faltando\n');
        return allVarsPresent;
    } else {
        console.log('  ❌ Arquivo .env.local não encontrado');
        console.log('  💡 Dica: Copie .env.example para .env.local e configure\n');
        return false;
    }
}

// Executar todos os testes
async function runTests() {
    console.log('🚀 Executando testes básicos...\n');
    console.log('================================\n');
    
    const serverOk = await testServerConnection();
    const filesOk = testFileStructure();
    const configOk = testConfiguration();
    
    console.log('================================');
    console.log('📊 Resumo dos Testes:\n');
    console.log(`Servidor: ${serverOk ? '✅ OK' : '❌ Falhou'}`);
    console.log(`Arquivos: ${filesOk ? '✅ OK' : '❌ Falhou'}`);
    console.log(`Configuração: ${configOk ? '✅ OK' : '❌ Falhou'}`);
    
    const allPassed = serverOk && filesOk && configOk;
    console.log(`\n${allPassed ? '🎉 Todos os testes passaram!' : '⚠️  Alguns testes falharam'}`);
    
    if (!serverOk) {
        console.log('\n💡 Para iniciar o servidor:');
        console.log('   npm run dev');
    }
}

// Executar testes
runTests();