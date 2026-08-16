/**
 * Leitor de notas fiscais (NFC-e) — Cloudflare Worker
 *
 * O QR code do cupom fiscal aponta para o site da Sefaz, que não permite
 * leitura direta pelo navegador (CORS). Este mini-serviço busca a página
 * da nota e devolve os itens em JSON para o app Dieta.
 *
 * Como publicar (grátis, ~5 min):
 *   1. Crie uma conta em https://dash.cloudflare.com
 *   2. Menu "Workers & Pages" → "Create" → "Create Worker" → Deploy
 *   3. Clique em "Edit code", apague tudo, cole este arquivo inteiro e "Deploy"
 *   4. Copie a URL (https://SEU-WORKER.SEU-USUARIO.workers.dev)
 *   5. No app: Ajustes → Nota fiscal → cole a URL → salvar
 *
 * Testado com o layout nacional de consulta de NFC-e (usado por SP e pela
 * maioria dos estados). Se alguma nota não for lida, o serviço devolve um
 * campo "hint" com o texto da página — útil para ajustar o parser.
 */

export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json; charset=utf-8',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    try {
      const u = new URL(request.url).searchParams.get('url');
      if (!u) throw new Error('parâmetro ?url= ausente');
      const target = new URL(u);
      if (!/fazenda|sefaz|nfce|nfe|sef\./i.test(target.hostname)) {
        throw new Error('a URL não parece ser de uma Sefaz');
      }
      const r = await fetch(target.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        redirect: 'follow',
      });
      const html = await r.text();
      const items = parseItems(html);
      const emitente =
        pick(html, /<div[^>]*class="txtTopo"[^>]*>([^<]+)</i) ||
        pick(html, /<div[^>]*id="u20"[^>]*>([^<]+)</i) ||
        '';
      if (!items.length) {
        return json(
          {
            ok: false,
            error: 'não achei itens — talvez o formato da página seja diferente',
            emitente: emitente.trim(),
            hint: html
              .replace(/<script[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style[\s\S]*?<\/style>/gi, ' ')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .slice(0, 3000),
          },
          cors
        );
      }
      return json({ ok: true, emitente: emitente.trim(), items }, cors);
    } catch (e) {
      return json({ ok: false, error: String((e && e.message) || e) }, cors);
    }
  },
};

function pick(html, re) {
  const m = html.match(re);
  return m ? decode(m[1]) : null;
}
function num(s) {
  return parseFloat(String(s || '0').replace(/\./g, '').replace(',', '.')) || 0;
}
function decode(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}
function json(o, headers) {
  return new Response(JSON.stringify(o), { headers });
}

function parseItems(html) {
  const items = [];
  // Layout nacional da consulta pública de NFC-e (tabela "tabResult"):
  //   <span class="txtTit">DESCRIÇÃO</span> <span class="RCod">(Código: 123)</span>
  //   <span class="Rqtd"><strong>Qtde.:</strong>2</span>
  //   <span class="RUN"><strong>UN: </strong>UN</span>
  //   <span class="RvlUnit"><strong>Vl. Unit.:</strong>&nbsp;5,49</span>
  //   <span class="valor">10,98</span>
  const re =
    /<span class="txtTit(?:2)?"[^>]*>([\s\S]*?)<\/span>([\s\S]*?)<span class="valor"[^>]*>([\d.,]+)<\/span>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const desc = decode(m[1].replace(/<[^>]+>/g, ''));
    const mid = m[2];
    const code = (mid.match(/C[oó]digo:\s*([\d.]+)/i) || [])[1] || null;
    const qty = num((mid.match(/Qtde\.?\s*:?<\/strong>\s*([\d.,]+)/i) || [])[1] || '1');
    const un = ((mid.match(/UN\s*:?\s*<\/strong>\s*([A-Za-z]+)/i) || [])[1] || 'UN').toUpperCase();
    const unitPrice = num((mid.match(/Vl\.\s*Unit\.?\s*:?<\/strong>\s*(?:&nbsp;)?\s*([\d.,]+)/i) || [])[1] || '0');
    const total = num(m[3]);
    if (desc && (total > 0 || unitPrice > 0)) {
      items.push({ desc, code, qty: qty || 1, un, unitPrice: unitPrice || (qty ? total / qty : 0), total });
    }
  }
  if (items.length) return items;

  // Fallback genérico: linhas de tabela com [descrição | qtd | ... | vl unit | total]
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let row;
  while ((row = rowRe.exec(html)) !== null) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
      decode(c[1].replace(/<[^>]+>/g, '')).trim()
    );
    if (cells.length >= 4 && /[a-zA-Z]{4,}/.test(cells[0]) && /\d/.test(cells[cells.length - 1])) {
      const qty = num(cells[1]);
      const unit = num(cells[cells.length - 2]);
      const tot = num(cells[cells.length - 1]);
      if (qty > 0 && tot > 0) {
        items.push({ desc: cells[0], code: null, qty, un: 'UN', unitPrice: unit || tot / qty, total: tot });
      }
    }
  }
  return items;
}
