import 'server-only';

import type { EWhatsappProvider, WhatsappConfig } from '@prisma/client';

export interface SendResult {
  ok: boolean;
  error?: string;
}

/** Deixa só dígitos e garante o DDI 55, que os dois provedores esperam. */
export function normalizeNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

/**
 * Substitui {{campo}} pelos valores. Placeholder sem valor vira string vazia
 * em vez de aparecer cru na mensagem do aluno.
 */
export function renderTemplate(
  body: string,
  values: Record<string, string | undefined>,
): string {
  return body.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_match, key: string) =>
    (values[key] ?? '').toString(),
  );
}

interface ProviderRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * Z-API e Evolution recebem texto livre, mas em formatos diferentes.
 * Isolar aqui deixa trocar de provedor sem mexer no resto.
 */
function buildRequest(
  provider: EWhatsappProvider,
  config: WhatsappConfig,
  to: string,
  message: string,
): ProviderRequest {
  const base = config.baseUrl.replace(/\/+$/, '');
  // separado porque 'Content-Type' exige aspas e 'apikey' não: no mesmo
  // objeto literal, prettier e quote-props se desfazem mutuamente
  const jsonHeaders = { 'Content-Type': 'application/json' };

  if (provider === 'ZAPI') {
    return {
      url: `${base}/send-text`,
      headers: { ...jsonHeaders, 'Client-Token': config.token },
      body: JSON.stringify({ phone: to, message }),
    };
  }

  // EVOLUTION
  return {
    url: `${base}/message/sendText/${config.instanceId ?? ''}`,
    headers: { 'Content-Type': 'application/json', 'apikey': config.token },
    body: JSON.stringify({ number: to, text: message }),
  };
}

export async function sendWhatsappMessage(
  config: WhatsappConfig,
  rawNumber: string,
  message: string,
): Promise<SendResult> {
  if (!config.isActive) {
    return { ok: false, error: 'Integração de WhatsApp desativada.' };
  }

  const to = normalizeNumber(rawNumber);
  if (!to) return { ok: false, error: 'Aluno sem telefone válido.' };

  const request = buildRequest(config.provider, config, to, message);

  try {
    // timeout explícito: sem ele uma instância fora do ar prenderia a
    // requisição até o limite da função serverless
    const response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        ok: false,
        error: `Provedor respondeu ${response.status}. ${detail.slice(0, 200)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Falha ao contatar o provedor.';
    return { ok: false, error: message };
  }
}
