# 🍽️ Dieta — app de dieta e compras (versão iOS)

App web estilo iOS (Liquid Glass) que calcula sua lista de compras a partir da dieta, compara preços entre mercados e sincroniza tudo na nuvem (celular + computador). Modo claro e escuro automáticos.

## O que tem dentro

| Arquivo | Para quê |
|---|---|
| `index.html` | O app inteiro (funciona sozinho, até aberto direto no navegador) |
| `manifest.json` | Deixa o app instalável na tela inicial do celular |
| `sw.js` | Faz o app abrir offline depois da primeira visita |
| `icon-192.png` / `icon-512.png` | Ícones do app (prato com talheres, squircle iOS) |

## Abas do app

- **Dieta** — frequência das refeições, proporção frango×fígado, resumo nutricional (proteína/dia, kcal/dia, custo/mês, custo/dia, R$ por g de proteína) e todos os itens da dieta: ajuste a quantidade por vez, desligue itens ou adicione novos (inclusive alimentos que você mesmo cadastra, com kcal e proteína).
- **Lista** — lista de compras com checkboxes (modo mercado), por mês ou por semana, em duas visões: *Por item* ou *Roteiro por mercado* (o que comprar em cada mercado para pagar o mínimo).
- **Preços** — cadastre mercados e preencha preços pela unidade de compra. O app destaca o mercado mais barato no total, o item mais barato em cada mercado, mostra a **cesta mista otimizada** (quanto você economiza dividindo a compra), a tendência ▲▼ de cada preço e um mini-gráfico. Toque no nome do item para ver o histórico completo com datas.
- **Ajustes** — tema (auto/claro/escuro), sincronização na nuvem, backup em .json e reset.

## Passo 1 — Publicar de graça (GitHub Pages, ~5 min)

1. Crie uma conta em [github.com](https://github.com).
2. **New repository** → nome (ex: `dieta`) → **Public** → criar.
3. Na página do repositório: **uploading an existing file** → arraste os 5 arquivos desta pasta → **Commit changes**.
4. **Settings → Pages** → Branch `main`, pasta `/ (root)` → salvar.
5. Em 1–2 min o app estará em `https://SEU-USUARIO.github.io/dieta/`.

No celular (Chrome/Safari): **Compartilhar / menu ⋮ → Adicionar à tela inicial** para instalar como app.

> Alternativa sem conta git: arraste a pasta em [app.netlify.com/drop](https://app.netlify.com/drop).

## Passo 2 — Sincronização na nuvem (Firebase, ~10 min, grátis)

1. Em [console.firebase.google.com](https://console.firebase.google.com), **Criar um projeto** (pode desativar o Analytics).
2. **Criação → Realtime Database → Criar banco de dados** (United States serve), **modo bloqueado**.
3. Aba **Regras** — substitua tudo por isto e **Publique**:

```json
{
  "rules": {
    "listas": {
      "$chave": { ".read": true, ".write": true }
    }
  }
}
```

4. Copie a URL do topo do banco (`https://seu-projeto-default-rtdb.firebaseio.com`).
5. No app: **Ajustes → Sincronização** → cole a URL → **gerar chave** → **salvar e conectar**.
6. No outro aparelho: mesma URL + mesma chave → conectar. Qualquer mudança num aparelho aparece no outro (ao abrir, ao voltar pra aba, e a cada 60 s).

**Segurança:** só sincroniza quem tem a chave exata (24 caracteres aleatórios). Adequado para lista de compras; não use para dados sensíveis. Guarde a chave — ela fica visível em Ajustes.

## Dicas

- O histórico de preços registra uma entrada por dia por item — atualize os preços quando for ao mercado e a tendência ▲▼ e o gráfico aparecem sozinhos.
- Faça um backup (.json) antes de trocar de celular; a importação restaura tudo.
- Os dados nutricionais dos alimentos padrão são aproximados (TACO/USDA), por unidade de consumo, alimento cru.
