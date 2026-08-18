# 🍽️ Dieta — app de dieta e compras (versão iOS)

App web estilo iOS (Liquid Glass) que calcula sua lista de compras a partir da dieta, compara preços entre mercados e sincroniza tudo na nuvem (celular + computador). Modo claro e escuro automáticos.

## O que tem dentro

| Arquivo | Para quê |
|---|---|
| `index.html` | O app inteiro (funciona sozinho, até aberto direto no navegador) |
| `manifest.json` | Deixa o app instalável na tela inicial do celular |
| `sw.js` | Faz o app abrir offline depois da primeira visita |
| `icon-192.png` / `icon-512.png` | Ícones do app (prato com talheres, squircle iOS) |
| `nfce-worker.js` | Leitor de notas fiscais — publica-se à parte no Cloudflare (ver abaixo) |

## Abas do app

- **Dieta** — frequência das refeições, proporção frango×fígado, resumo nutricional (proteína/dia, kcal/dia, custo/mês, custo/dia, R$ por g de proteína) e todos os itens da dieta: ajuste a quantidade por vez, desligue itens ou adicione novos. Para cadastrar um alimento novo, **escaneie o código de barras** com a câmera — nome, calorias e proteína vêm preenchidos automaticamente da base aberta Open Food Facts. Defina **metas** (peso × g de proteína/kg, calorias) e acompanhe nas barras de progresso. Quando frango e fígado têm preços cadastrados, o app **sugere a troca** para o que estiver mais barato por grama de proteína.
- **Cardápio** — escolha em quais dias da semana faz cada refeição (isso alimenta a lista e a nutrição), veja a semana dia a dia com o que comer em cada refeição, o resumo de **marmitas** (meal prep: quantas cozinhar, gramas totais de arroz/proteína/vegetais), e marque ✓ o que realmente comeu — o **balanço nutricional** compara o esperado do plano com o consumido real em 10 nutrientes (fibra, ferro, cálcio, magnésio, zinco, potássio, vitaminas A e C, B12 e folato), com faixas de referência e alertas de "abaixo da faixa" / "acima do limite".
- **Lista** — lista de compras com checkboxes (modo mercado), por mês ou por semana, em duas visões: *Por item* ou *Roteiro por mercado* (o que comprar em cada mercado para pagar o mínimo).
- **Preços** — cadastre mercados e preencha preços pela unidade de compra. O app mostra o **preço normalizado (R$/100g ou R$/un)** de cada item, destaca o mercado mais barato no total e o item mais barato em cada mercado, e calcula a **cesta mista otimizada** (quanto você economiza dividindo a compra), com tendência ▲▼ e mini-gráfico. Toque no nome do item para ver o histórico com datas e usar a **calculadora de embalagem**: digite preço e tamanho de outra embalagem e veja na hora se vale trocar.
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

## Leitor de notas fiscais (NFC-e) — opcional, ~5 min

Escaneie o QR do cupom fiscal na saída do mercado e os preços da compra entram no app de uma vez. Como o site da Sefaz bloqueia leitura direta pelo navegador, é preciso publicar um mini-serviço gratuito seu:

1. Crie uma conta em [dash.cloudflare.com](https://dash.cloudflare.com) (grátis).
2. **Workers & Pages → Create → Create Worker → Deploy**.
3. **Edit code** → apague tudo → cole o conteúdo de `nfce-worker.js` → **Deploy**.
4. Copie a URL (`https://seu-worker.xxx.workers.dev`) e cole no app em **Ajustes → Nota fiscal**.
5. Na aba **Preços → Importar nota fiscal**, escaneie o QR do cupom. O app lê os itens, sugere a associação com seus alimentos (você confere) e registra os preços no mercado escolhido.

**Atenção (SP):** funciona com cupons **NFC-e**. Alguns mercados de SP ainda emitem o modelo antigo **CF-e SAT** (o QR leva a `satsp.fazenda.sp.gov.br`, com captcha) — esses não dá para importar automaticamente. Se uma nota não for lida, o leitor devolve um trecho da página ("hint") que ajuda a ajustar o parser.

## Novidades da Fase 1

- 📷 Scanner de código de barras (câmera) com preenchimento automático via Open Food Facts — funciona no site publicado (precisa de HTTPS, que o GitHub Pages já dá).
- 🏷️ Preço normalizado R$/100g ou R$/un em todos os itens com preço.
- 🧮 Calculadora de embalagem no histórico de cada item.
- 💡 Sugestão automática de troca frango×fígado pelo menor custo por grama de proteína.
- 🎯 Metas nutricionais (peso × proteína/kg e calorias) com barras de progresso.
- 🔗 **Produtos por item (variantes)**: toque em qualquer item da dieta (ou no botão 🔗 no histórico de preços) e cadastre quantas marcas/embalagens quiser — escaneando o código de barras ou manualmente (nome, tamanho, preço, mercado). O app compara todas por R$/100g, marca a que **vale mais a pena** e mostra qual está **em uso**. O botão "usar" troca o produto ativo do item: a unidade de compra vira a embalagem dele (ex: "pacote 5 kg"), os preços são convertidos automaticamente e, se a variante tem preço + mercado, esse preço já entra na comparação de mercados. Dá pra voltar à unidade padrão a qualquer momento.

## Novidades da Fase 2

- 📅 **Cardápio semanal** com dias por refeição, plano dia a dia e proteína alternando frango/fígado conforme sua proporção.
- 🍱 **Meal prep**: quantas marmitas cozinhar na semana e os totais de cada ingrediente.
- ✅ **Consumo real**: marque o que comeu; o balanço compara esperado × real.
- 🧪 **Balanço de micronutrientes** (10 nutrientes, TACO/USDA) com faixas de referência (RDA/UL) e alertas. Estimativa educativa — não substitui nutricionista.
- ⚖️ **Pesagem**: registre o peso, veja gráfico e variação de 7/30 dias; a meta de proteína se atualiza sozinha.
- 📄 **Importar nota fiscal (NFC-e)** via QR do cupom + Cloudflare Worker.

## Novidades da Fase 3

- 👨‍🍳 **Receitas com o que você tem**: 16 receitas montadas só com os itens da dieta. Marque os ingredientes que tem em casa e seus utensílios (panela, frigideira, forno, airfryer, micro-ondas, liquidificador) — o app mostra o que "dá pra fazer" agora, o que "falta 1", o preparo e a nutrição por porção. Dá pra registrar "comi isso hoje" direto da receita.
- ➕ **Fora do plano**: em cada dia do cardápio, registre o que comeu além (ou no lugar) do planejado — um alimento do app com quantidade, ou comida livre com nome + calorias + proteína (ex: "pizza 2 fatias · 550 kcal"). Tudo entra no consumo real do balanço. Se substituiu uma refeição, desmarque a caixinha dela.
- 🔍 **Fontes de cada nutriente**: toque em qualquer nutriente do balanço para ver de onde ele vem, alimento por alimento, com percentuais. Quando algo passa do limite, o alerta já aponta o maior responsável (ex: "Vitamina A acima do limite — maior fonte: Fígado, 83%").

## Acompanhamento a dois ❤️

Para usar em casal (mesmo em cidades diferentes): **cada um tem seus próprios dados** — dieta, mercados da sua cidade, preços, metas, tudo separado, cada um com sua chave de sincronização. O que se compartilha é só um painel de métricas.

Como configurar (os dois usam o MESMO link do app e o MESMO banco Firebase):

1. Cada um em **Ajustes → Sincronização**: gera **sua própria** chave de sincronização e conecta (a URL do banco é a mesma pros dois).
2. Cada um em **Ajustes → Acompanhamento a dois**: coloca o apelido, **gera a chave de acompanhamento** e salva.
3. Troquem as chaves **de acompanhamento** (não a de sincronização!) por mensagem.
4. Cada um cola a chave recebida em "chave do par" e salva.

Pronto: na aba Dieta aparece o painel do outro — peso e variação em 7 dias (com mini-gráfico), refeições da semana marcadas, proteína real vs meta e custo/mês da dieta. Atualiza sozinho a cada minuto, ao voltar pro app, ou no botão "atualizar agora".

**Privacidade:** a chave de acompanhamento só dá acesso a esse resumo — quem a tem não vê nem edita seus dados. A chave de sincronização continua sendo a "senha" dos seus dados: essa não se compartilha.

## Pareamento rápido (QR + link)

Em **Ajustes → Pareamento rápido** há três opções:

- **📱 Parear meus aparelhos** — QR/link que configura outro aparelho como a SUA conta (mesma sincronização). ⚠️ Dá acesso total: escaneie você mesmo ou envie apenas para você (ex: "mensagens salvas").
- **❤️ Convidar o par** — QR/link que dá ao outro apenas o seu painel de acompanhamento (peso, refeições, custo). Seguro para mandar por mensagem. Quem aceita já recebe a sugestão de gerar o convite de volta, fechando o acompanhamento nos dois sentidos.
- **📷 Escanear um pareamento** — lê o QR mostrado em outro aparelho (ou cole o link recebido).

Abrir um link de pareamento no navegador configura o app automaticamente, com tela de confirmação antes. Se um link vazar, basta gerar uma chave nova em Ajustes — o link antigo morre.

## Micronutrientes de alimentos escaneados

Ao cadastrar um alimento novo pelo código de barras, o app agora captura também os **micronutrientes do rótulo** (fibra, ferro, cálcio, magnésio, zinco, potássio, vitaminas A/C, B12 e folato) da Open Food Facts, quando disponíveis — e eles passam a contar no balanço nutricional e nas fontes por nutriente, igual aos alimentos padrão. kcal e proteína contam sempre, em qualquer registro; comida livre ("pizza 2 fatias") conta só kcal + proteína informadas.

## Almoço fora de casa (faculdade/RU)

Nos dias sem almoço em casa, o cardápio mostra "🍛 Almoço — bandejão do RU" (nome configurável) **com caixinha de ✓**: toque no nome para definir as calorias e a proteína típicas do prato de lá (referência: prato de RU fica entre 700–900 kcal e 30–40 g de proteína). Esses valores entram no esperado e, quando você marca ✓, no consumido real — então a proteína/dia e as calorias/dia do app passam a refletir o dia inteiro, não só a comida de casa. Micronutrientes do prato de fora não são contados (não dá pra saber). Comeu algo muito diferente num dia? Desmarque e registre em "fora do plano". Dá para desligar a contagem no mesmo lugar.

## Biblioteca de pratos (RU / refeições fora)

Você tem acesso ao cardápio do RU? Monte cada prato **pelos ingredientes** (com quantidades) uma única vez — os pratos se repetem, então a biblioteca cresce e depois é só selecionar. Pratos montados por ingredientes contam calorias, proteína **e micronutrientes** no balanço.

- No almoço fora de casa (cardápio): toque na refeição → escolha o prato daquele dia na biblioteca (ou crie na hora). O dia passa a contar o prato real em vez da estimativa padrão.
- No "fora do plano": os pratos salvos aparecem no topo da lista — um toque registra o prato completo.
- Ingrediente que ainda não existe no app (feijão, farofa…)? Cadastre antes em Dieta → adicionar item (escaneando, os micros do rótulo vêm juntos).

## Colar lista de preços (texto)

Anotou os preços no bloco de notas enquanto passava nos mercados? Em **Preços → Colar lista de preços**, cole o texto: uma linha por item ("nome  preço"), linha só com nome inicia um novo mercado, e "9,99 promo 5,99" usa o preço promocional. O app reconhece os itens, e **converte embalagens automaticamente** para a unidade de compra: "ovo 20un 13,50" vira R$ 8,10/dúzia, "maçã kg 4,99" vira R$ 0,65/un, "aveia 450g 8,89" vira R$ 19,76/kg — deixando tudo comparável. Itens repetidos no mesmo mercado (3 marcas de pão) registram o mais barato; itens fora da dieta ficam como "ignorar". Você confere tudo antes de registrar.
