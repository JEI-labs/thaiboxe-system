# WhatsApp

O provedor padrão é a **Cloud API oficial da Meta**: não exige servidor
próprio (roda direto da Vercel) e não corre risco de banimento. O código
também fala com Evolution e Z-API — ver "Outros provedores" no fim.

## A janela de 24 horas

É a regra que mais molda o uso. A Meta só entrega **texto livre** nas 24h
seguintes a uma mensagem enviada _pelo aluno_. Fora dessa janela, só sai
**template aprovado**.

Como cobrança, aniversário e avisos partem da academia, e não do aluno, na
prática **todos os eventos automáticos precisam de template aprovado**. Um
modelo sem `providerTemplateName` aparece na tela marcado como "Só dentro de
24h", justamente para deixar isso explícito.

## Configurando

No [Meta for Developers](https://developers.facebook.com), crie um app do
tipo Business e adicione o produto WhatsApp. Você vai precisar de:

| Campo na tela    | Onde encontrar                                       |
| ---------------- | ---------------------------------------------------- |
| URL da instância | `https://graph.facebook.com/v21.0`                   |
| Phone Number ID  | WhatsApp › Configuração da API. **Não** é o telefone |
| Token            | token de acesso permanente (via System User)         |
| Número remetente | o número cadastrado                                  |

O token de teste expira em 24h. Para produção, crie um **System User** em
Business Settings, dê a ele a permissão `whatsapp_business_messaging` e gere
um token sem expiração.

O número precisa ser **dedicado**: não pode estar ativo no app WhatsApp comum
nem no Business. Se já estiver, é preciso apagar a conta antes.

## Criando templates

Em WhatsApp › Manage Templates. A aprovação leva de minutos a 48h.

Os parâmetros do corpo são **posicionais** — a Meta não aceita nomes. No
template aprovado eles são `{{1}}`, `{{2}}`; no sistema você escreve
`{{primeiro_nome}}`, e o envio converte **na ordem em que aparecem no texto**.
Ou seja, a ordem local precisa bater com a do template.

Exemplo de template aprovado:

```
Olá {{1}}, tudo bem? Notamos que sua mensalidade venceu.
Qualquer dúvida, estamos por aqui.
```

E no sistema, o corpo do modelo:

```
Olá {{primeiro_nome}}, tudo bem? Notamos que sua mensalidade venceu.
Qualquer dúvida, estamos por aqui.
```

Categoria importa: cobrança e aviso são **Utility**; oferta é **Marketing**,
que custa mais caro e o aluno pode desativar.

## Custos

A Meta cobra por conversa iniciada de 24h, não por mensagem. Há uma cota
gratuita mensal de conversas de serviço. Utility e Marketing têm preços
diferentes — a tabela do Brasil está na documentação de pricing da Meta.

## Outros provedores

O `buildRequest` em `src/server/whatsapp/client.ts` isola as diferenças, e a
tela aceita escolher entre Meta, Evolution e Z-API.

Evolution e Z-API usam WhatsApp Web por baixo (Baileys), o que **não é via
oficial**: aceitam texto livre a qualquer hora, sem template, mas o número
pode ser banido — e disparo em massa é exatamente o padrão detectado. O
Evolution ainda exige um servidor sempre ligado, já que mantém um WebSocket
aberto, então não roda na Vercel.
