const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

async function cleanupProcesses() {
  console.log(" Iniciando limpeza de processos...");
  
  try {
    // Verificar processos Node.js
    const { stdout } = await execAsync("Get-Process | Where-Object {$_.ProcessName -like \"*node*\"} | Measure-Object | Select-Object -ExpandProperty Count", { shell: "powershell" });
    const nodeProcessCount = parseInt(stdout.trim());
    
    console.log(` Processos Node.js encontrados: ${nodeProcessCount}`);
    
    if (nodeProcessCount > 10) {
      console.log(" Muitos processos Node.js detectados!");
      console.log(" Recomendação: Reiniciar o servidor de desenvolvimento");
      
      // Listar processos que estão usando a porta 3050
      try {
        const { stdout: portInfo } = await execAsync("netstat -ano | findstr :3050", { shell: "cmd" });
        console.log(" Processos na porta 3050:");
        console.log(portInfo);
      } catch (e) {
        console.log("ℹ Nenhum processo encontrado na porta 3050");
      }
    }
    
    // Verificar uso de memória
    const { stdout: memInfo } = await execAsync("Get-Process node | Measure-Object WorkingSet -Sum | Select-Object -ExpandProperty Sum", { shell: "powershell" });
    const totalMemory = parseInt(memInfo.trim()) / (1024 * 1024); // MB
    
    console.log(` Uso total de memória pelos processos Node.js: ${totalMemory.toFixed(2)} MB`);
    
    if (totalMemory > 1000) {
      console.log(" Alto uso de memória detectado!");
    }
    
  } catch (error) {
    console.error(" Erro ao verificar processos:", error.message);
  }
}

async function optimizeSystem() {
  console.log(" Iniciando otimização do sistema...");
  
  // Limpar cache do Next.js
  try {
    await execAsync("rm -rf .next/cache", { shell: "bash" });
    console.log(" Cache do Next.js limpo");
  } catch (e) {
    console.log("ℹ Cache já estava limpo ou erro ao limpar");
  }
  
  // Verificar se há arquivos de lock órfãos
  try {
    const { stdout } = await execAsync("ls -la | grep lock", { shell: "bash" });
    if (stdout.trim()) {
      console.log(" Arquivos de lock encontrados:");
      console.log(stdout);
    }
  } catch (e) {
    console.log(" Nenhum arquivo de lock órfão encontrado");
  }
}

async function main() {
  console.log(" Sistema de Diagnóstico e Limpeza - InnerAI");
  console.log("=" .repeat(50));
  
  await cleanupProcesses();
  console.log("");
  await optimizeSystem();
  
  console.log("");
  console.log(" RECOMENDAÇÕES:");
  console.log("1. Se há muitos processos Node.js, considere reiniciar o servidor");
  console.log("2. Use npm run dev em vez de múltiplas instâncias");
  console.log("3. Monitore o uso de memória regularmente");
  console.log("4. Execute este script periodicamente para manutenção");
  
  console.log("");
  console.log(" Diagnóstico concluído!");
}

main().catch(console.error);
