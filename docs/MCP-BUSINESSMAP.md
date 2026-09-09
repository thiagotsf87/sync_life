# MCP Businessmap (Kanbanize)

Servidor MCP remoto **oficial** do Businessmap, configurado em `.mcp.json` na raiz do
repositório (escopo `project` — vale para qualquer pessoa que abrir o projeto).

```json
{
  "mcpServers": {
    "businessmap": {
      "type": "http",
      "url": "https://rennersa.kanbanize.com/baiApi/v1/mcp"
    }
  }
}
```

## Como ativar

1. Abra o Claude Code **na sua máquina**, na raiz do projeto.
2. Na primeira vez o Claude Code pergunta se confia nos servidores MCP do projeto — aceite.
3. Rode `/mcp`, escolha `businessmap` e **Authenticate**.
4. O navegador abre o login do Businessmap. Faça login, clique em **Allow**.
5. Rode `/mcp` de novo: o status deve ficar `connected`.

Nenhum token fica no repositório — a autenticação é OAuth e o token é guardado
localmente pelo Claude Code, fora do Git.

## Limitação conhecida

Sessões do **Claude Code na web/nuvem** não conseguem alcançar `rennersa.kanbanize.com`:
a política de egresso do ambiente remoto bloqueia o domínio. O MCP só funciona no
Claude Code local (CLI, desktop ou extensão de IDE).

## Comandos úteis

```bash
claude mcp list            # status de todos os servidores
claude mcp get businessmap # detalhes deste servidor
claude mcp remove businessmap --scope project
```

## Alternativa local (não configurada)

Existe um servidor da comunidade em npm, caso o remoto oficial não atenda:

```bash
claude mcp add --scope local --transport stdio businessmap-local \
  --env BUSINESSMAP_API_TOKEN=seu_token \
  --env BUSINESSMAP_API_URL=https://rennersa.kanbanize.com/api/v2 \
  --env BUSINESSMAP_READ_ONLY_MODE=true \
  -- npx -y @edicarlos.lds/businessmap-mcp
```

Requer Node 22+ e um API token gerado no Businessmap. Use escopo `local` para o
token **não** ir para o Git.
