# Diagramas

Três diagramas autocontidos (HTML + SVG inline, fontes Google) que explicam as decisões do Aurora Bank. Abra o `.html` no navegador ou use o `.png` para colar em slides e docs.

| Arquivo | Tipo | O que mostra |
|---|---|---|
| `architecture.html` | arquitetura | `@aurora/shared` como núcleo de regras; backoffice e app como clientes da mesma API REST |
| `pix-flow.html` | sequência | transferência por chave: normalização, limite de R$ 20.000,00 e débito atômico |
| `consignado-state.html` | máquina de estados | proposta simulada → em análise → aprovada / recusada, com o portão de margem de 35% |

Regenerar os PNGs: abrir o HTML e exportar (ou usar `scripts/export_png.py` da skill `diagram-design`).
