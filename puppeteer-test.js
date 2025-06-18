const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Testando Puppeteer...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ]
    });
    
    console.log('Browser iniciado com sucesso!');
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const title = await page.title();
    
    console.log('Título da página:', title);
    
    await browser.close();
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
  }
})();