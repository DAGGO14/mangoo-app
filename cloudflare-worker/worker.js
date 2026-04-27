/**
 * MANGOO AI Proxy — Cloudflare Worker
 * 
 * Este worker recibe peticiones de MangooAI.jsx y las reenvía
 * a la API de Anthropic con la API Key guardada de forma segura.
 * 
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Ve a https://dash.cloudflare.com → Workers & Pages → Create
 * 2. Pega este código
 * 3. Ve a Settings → Variables → añade variable de entorno:
 *    Nombre: ANTHROPIC_API_KEY
 *    Valor: sk-ant-... (tu API key de Anthropic)
 * 4. Copia la URL del worker (ej: mangoo-ai.tuusuario.workers.dev)
 * 5. Pega esa URL en MangooAI.jsx donde dice AI_PROXY_URL
 */

export default {
  async fetch(request, env) {
    // CORS headers para permitir llamadas desde tu dominio
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Cambia '*' por tu dominio en producción
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Manejar preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const { system, messages } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'messages requerido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Llamada a Anthropic con la API Key segura
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', // Haiku es más barato para el chatbot
          max_tokens: 1000,
          system: system || '',
          messages: messages,
        })
      });

      const data = await anthropicRes.json();

      return new Response(JSON.stringify(data), {
        status: anthropicRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
