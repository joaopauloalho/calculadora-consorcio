# CLAUDE.md

## Stack

- Frontend: React 18 + TypeScript + Vite
- Estilização: Tailwind CSS + shadcn/ui (componentes em `src/components/ui/`)
- Testes: Vitest (unitários)
- Deploy: Vercel

---

## Convenções de Código

- **TypeScript strict** — sem `any` sem justificativa
- **Componentes UI**: sempre importar de `@/components/ui/` (shadcn)
- **Alias de importação**: usar `@/` para `src/` (configurado no `tsconfig` e `vite.config`)
- **Estilização**: Tailwind utilities. Não criar classes CSS customizadas sem necessidade clara.
- **Toasts**: usar `toast` de `sonner`
- **Componentes `ui/`**: gerados pelo shadcn CLI — não editar diretamente; customizar via CSS variables em `index.css` ou criando wrappers.

---

## Comandos Essenciais

```bash
npm run dev       # Vite dev server
npm run build     # Build de produção
npm run preview   # Preview do build
npm run test      # Vitest
```

---

## Diretrizes de Arquitetura e Economia de Tokens

Você opera em uma arquitetura de **Agentes Multi-Modelo**. Tem à sua disposição um sub-agente (Gemini 2.5 Flash) configurado localmente no terminal para leitura de arquivos longos.

### ⚠️ REGRA DE OURO: CONSCIÊNCIA DE CUSTOS

### Cenário A: Execução Direta (Sem o Gemini)
Atue diretamente editando o código SE E SOMENTE SE a tarefa envolver:
- Edição de arquivos menores que 200 linhas
- Alterações diretas de lógica, refatoração, estilização ou ajustes de estado

### Cenário B: Acionamento Obrigatório do Sub-Agente (Gemini)
Você é **OBRIGADO** a delegar ao Gemini se a tarefa envolver:
- **Logs de Erro:** arquivos de log do Vercel ou Node.js
- **Documentações:** arquivos `.md` de APIs externas ou manuais longos
- **Schemas/Payloads extensos:** dumps de banco, JSONs brutos
- **Qualquer arquivo acima de 200–300 linhas**

### ⚙️ Protocolo de Acionamento do Gemini

```powershell
$conteudo = Get-Content -Raw "CAMINHO_DO_ARQUIVO"; node C:\Users\joaoa\gemini-cli\leitor.mjs "Sua instrução detalhada do que extrair. Baseie-se neste texto: $conteudo"
```
