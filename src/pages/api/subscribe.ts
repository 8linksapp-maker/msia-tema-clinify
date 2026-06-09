import type { APIRoute } from 'astro';
import { readFileFromRepo, writeFileToRepo } from '../../lib/server-io';

export const prerender = false;

interface Lead {
  nome: string;
  telefone: string;
  email?: string;
  servico?: string;
  mensagem?: string;
  recebidoEm: string;
  origem: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  try {
    const ct = request.headers.get('content-type') || '';
    let body: Record<string, string> = {};
    if (ct.includes('application/json')) {
      body = await request.json();
    } else {
      const fd = await request.formData();
      body = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
    }

    const nome = (body.nome || '').trim();
    const telefone = (body.telefone || '').trim();
    if (!nome || !telefone) {
      return json({ error: 'Nome e telefone são obrigatórios.' }, 400);
    }

    const lead: Lead = {
      nome,
      telefone,
      email: (body.email || '').trim() || undefined,
      servico: (body.servico || '').trim() || undefined,
      mensagem: (body.mensagem || '').trim() || undefined,
      recebidoEm: new Date().toISOString(),
      origem: (body.origem || 'site').trim(),
    };

    const raw = await readFileFromRepo('src/data/subscribers.json');
    const leads: Lead[] = raw ? JSON.parse(raw) : [];
    leads.push(lead);
    await writeFileToRepo('src/data/subscribers.json', JSON.stringify(leads, null, 2), {
      message: `lead: ${nome}`,
    });

    // fallback sem JS (form nativo): redireciona com flag de sucesso
    if (!ct.includes('application/json')) {
      return new Response(null, { status: 303, headers: { Location: '/contato?enviado=1' } });
    }
    return json({ ok: true });
  } catch (err: any) {
    return json({ error: err?.message || 'Erro ao enviar.' }, 500);
  }
};
