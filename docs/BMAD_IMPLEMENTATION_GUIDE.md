# Guia de Implementação do BMAD-METHOD no Projeto InnerAI

## 1. Visão Geral

Este documento é o guia oficial para a utilização do Breakthrough Method for Agile Ai Driven Development (BMAD-METHOD) no projeto InnerAI. A correta utilização desta metodologia é crucial para mantermos um fluxo de trabalho organizado, eficiente e de alta qualidade.

O BMAD-METHOD estrutura nosso desenvolvimento em torno de **Agentes de IA especializados**, cada um com uma função específica no ciclo de vida do desenvolvimento de software.

## 2. Os Agentes e Suas Funções

Para interagir com um agente, basta mencioná-lo em seu prompt, por exemplo: `@pm Crie um PRD para o novo sistema de templates.`

Cada agente foi configurado com o contexto completo do projeto InnerAI (nossa stack, prioridades e padrões de código).

| Agente | Comando | Responsabilidade Principal |
| :--- | :--- | :--- |
| **Product Manager** | `@pm` | Criação de Product Requirement Documents (PRDs) e definição do "o quê" e "porquê". |
| **Architect** | `@architect` | Criação de Documentos de Arquitetura, definindo o "como" técnico da solução. |
| **Scrum Master** | `@sm` | Quebra dos PRDs e Arquiteturas em Estórias de Usuário detalhadas para o desenvolvimento. |
| **Developer** | `@dev` | Implementação das estórias de usuário, escrevendo o código da funcionalidade. |
| **QA Architect** | `@qa` | Revisão do código, criação de planos de teste e garantia da qualidade da entrega. |

## 3. O Fluxo de Trabalho Padrão

Nosso processo de desenvolvimento seguirá o seguinte fluxo:

1.  **Ideia -> PRD (`@pm`):** Uma nova funcionalidade começa com o `@pm` criando um PRD detalhado.
    - **Output:** `docs/prd.md`

2.  **PRD -> Arquitetura (`@architect`):** Com o PRD em mãos, o `@architect` desenha a solução técnica.
    - **Output:** `docs/architecture.md`

3.  **Docs -> Estórias (`@sm`):** O `@sm` lê o PRD e a Arquitetura para criar estórias de usuário acionáveis.
    - **Output:** `docs/stories/story-X.md`

4.  **Estória -> Código (`@dev`):** O `@dev` implementa uma estória específica.

5.  **Código -> Revisão (`@qa`):** O `@qa` revisa o código implementado, sugere melhorias e valida a funcionalidade.

## 4. Localização dos Artefatos

- **Documentos de Produto (PRD):** `docs/prd.md`
- **Documentos de Arquitetura:** `docs/architecture.md`
- **Estórias de Usuário:** `docs/stories/`
- **Configuração do BMAD:** `.bmad-core/`
- **Regras de Ativação:** `.cursorrules`

Aderir a este processo garantirá que todos os desenvolvimentos sejam bem planejados, documentados e executados com um alto padrão de qualidade.
