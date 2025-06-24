const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function analyzeInnerAI() {
    console.log('🔍 Iniciando análise do InnerAI...\n');
    
    const browser = await puppeteer.launch({
        headless: false, // Mostrar navegador para debug
        defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    
    try {
        // 1. Navegar para o InnerAI
        console.log('📱 Acessando InnerAI...');
        await page.goto('https://app.innerai.com/', { waitUntil: 'networkidle2' });
        
        // 2. Fazer login
        console.log('🔐 Realizando login...');
        
        // Clicar em "Log in"
        await page.waitForSelector('button', { visible: true });
        const loginButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => btn.textContent.includes('Log in'));
        });
        if (loginButton) {
            await loginButton.click();
        }
        
        // Aguardar formulário de login
        await page.waitForTimeout(2000);
        
        // Preencher email
        await page.waitForSelector('input[type="email"], input[placeholder*="mail"]', { visible: true });
        await page.type('input[type="email"], input[placeholder*="mail"]', 'alexandretmoraescpa@gmail.com');
        
        // Clicar em continuar
        await page.waitForTimeout(1000);
        const continueButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => btn.textContent.includes('Continuar') || btn.textContent.includes('Continue'));
        });
        if (continueButton) {
            await continueButton.click();
        }
        
        // Aguardar campo de senha
        await page.waitForTimeout(2000);
        await page.waitForSelector('input[type="password"]', { visible: true });
        await page.type('input[type="password"]', 'Y*mare2025');
        
        // Clicar em entrar
        await page.waitForTimeout(1000);
        const enterButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => btn.textContent.includes('Entrar') || btn.textContent.includes('Enter'));
        });
        if (enterButton) {
            await enterButton.click();
        }
        
        // 3. Aguardar dashboard carregar
        console.log('⏳ Aguardando dashboard...');
        await page.waitForTimeout(5000);
        
        // 4. Capturar screenshots e analisar funcionalidades
        const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'innerai-analysis');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        
        console.log('📸 Capturando screenshots...');
        
        // Dashboard principal
        await page.screenshot({ 
            path: path.join(screenshotsDir, '01-dashboard.png'),
            fullPage: true 
        });
        
        // Analisar elementos da página
        const features = await page.evaluate(() => {
            const result = {
                navigation: [],
                tools: [],
                chatFeatures: [],
                uiElements: []
            };
            
            // Navegação lateral
            const navItems = document.querySelectorAll('[role="navigation"] a, nav a, .sidebar a, aside a');
            navItems.forEach(item => {
                const text = item.textContent.trim();
                if (text) result.navigation.push(text);
            });
            
            // Ferramentas disponíveis
            const toolCards = document.querySelectorAll('[class*="card"], [class*="Card"], [class*="tool"], [class*="Tool"]');
            toolCards.forEach(card => {
                const title = card.querySelector('h2, h3, h4, [class*="title"]')?.textContent;
                const description = card.querySelector('p, [class*="description"]')?.textContent;
                if (title) {
                    result.tools.push({ title: title.trim(), description: description?.trim() });
                }
            });
            
            // Elementos de chat
            const chatElements = document.querySelectorAll('[class*="chat"], [class*="Chat"], [class*="message"], [class*="Message"]');
            result.chatFeatures.push(`Chat elements found: ${chatElements.length}`);
            
            // UI Elements
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                const text = btn.textContent.trim();
                if (text && !result.uiElements.includes(text)) {
                    result.uiElements.push(text);
                }
            });
            
            return result;
        });
        
        console.log('\n📊 Funcionalidades encontradas:');
        console.log(JSON.stringify(features, null, 2));
        
        // Tentar navegar por diferentes seções
        const sections = ['Tools', 'Library', 'Settings', 'History'];
        
        for (const section of sections) {
            try {
                console.log(`\n🔍 Explorando ${section}...`);
                const sectionLink = await page.evaluateHandle((sectionName) => {
                    const links = Array.from(document.querySelectorAll('a, button'));
                    return links.find(link => link.textContent.includes(sectionName));
                }, section);
                
                if (sectionLink) {
                    await sectionLink.click();
                    await page.waitForTimeout(2000);
                    await page.screenshot({ 
                        path: path.join(screenshotsDir, `${section.toLowerCase()}.png`),
                        fullPage: true 
                    });
                }
            } catch (e) {
                console.log(`   Seção ${section} não encontrada`);
            }
        }
        
        // Salvar análise em arquivo
        const analysis = {
            timestamp: new Date().toISOString(),
            features: features,
            screenshotsPath: screenshotsDir
        };
        
        fs.writeFileSync(
            path.join(__dirname, '..', 'innerai-analysis.json'),
            JSON.stringify(analysis, null, 2)
        );
        
        console.log('\n✅ Análise concluída!');
        console.log(`📁 Screenshots salvos em: ${screenshotsDir}`);
        
    } catch (error) {
        console.error('❌ Erro durante análise:', error);
    } finally {
        await browser.close();
    }
}

// Executar análise
analyzeInnerAI();