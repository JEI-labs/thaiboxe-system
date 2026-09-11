# WhatsApp

O provedor em uso é o **Evolution API**: gratuito, aceita texto livre a
qualquer hora e hospeda várias instâncias num servidor só — o que importa se
o sistema for vendido para mais de uma academia.

O código também fala com a Cloud API oficial da Meta e com a Z-API. O
`buildRequest` em `src/server/whatsapp/client.ts` isola as diferenças; trocar
de provedor é escolher outro na tela de Configurações.

## Onde hospedar

O Evolution mantém um WebSocket aberto com o WhatsApp, então precisa de um
processo **sempre ligado** — por isso **não roda na Vercel**, que é
serverless.

A opção gratuita de verdade é a **Oracle Cloud Always Free**: VM ARM
(4 vCPU / 24 GB) sem prazo de expiração. Render e Railway têm plano gratuito,
mas hibernam por inatividade, e quando o processo dorme a sessão do WhatsApp
cai e é preciso ler o QR de novo. Um VPS simples (Hetzner, Contabo) sai por
~R$25/mês e dá menos trabalho.

## Subindo o Evolution

Na VM, com Docker:

```bash
docker run -d \
  --name evolution \
  --restart always \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY='troque-esta-chave' \
  -v evolution_instances:/evolution/instances \
  atendai/evolution-api:v2.1.1
```

`AUTHENTICATION_API_KEY` é o que vai no campo **Token** da tela de
Configurações. O volume preserva a sessão entre reinícios — sem ele, cada
restart pede o QR de novo.

Libere a porta 8080 no _security list_ da Oracle **e** no firewall da VM, que
na imagem Oracle Linux vem fechado mesmo depois de liberar no painel:

```bash
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save
```

Coloque um domínio com HTTPS na frente (Caddy resolve em duas linhas): o token
viaja nessa conexão.

## Criando a instância

```bash
curl -X POST https://seu-dominio/instance/create \
  -H 'apikey: troque-esta-chave' \
  -H 'Content-Type: application/json' \
  -d '{"instanceName":"thaiboxe","integration":"WHATSAPP-BAILEYS"}'
```

Pegue o QR em `GET /instance/connect/thaiboxe` e leia pelo WhatsApp do celular
em _Aparelhos conectados_.

Para mais de uma academia, repita com outro `instanceName` — o mesmo servidor
atende todas, e cada uma pareia com o número do seu dono.

## Preenchendo em Configurações

| Campo             | Valor                                    |
| ----------------- | ---------------------------------------- |
| Provedor          | Evolution API                            |
| URL da instância  | `https://seu-dominio` (sem barra no fim) |
| Nome da instância | `thaiboxe`                               |
| Token             | o `AUTHENTICATION_API_KEY`               |
| Número remetente  | o número pareado                         |
| Integração ativa  | ligado                                   |

O token não é exibido depois de salvo; deixe o campo em branco para mantê-lo.

## Riscos

Evolution usa Baileys, que é WhatsApp Web por baixo — **não é via oficial**.
O número pode ser banido, e disparo em massa é exatamente o padrão detectado.

- use um número que não seja o principal da academia;
- espace os disparos em vez de mandar tudo de uma vez;
- mantenha os textos pessoais: mensagem idêntica para dezenas de contatos é o
  que chama atenção.

## Alternativa: Cloud API da Meta

Oficial, sem risco de banimento e sem servidor (roda da Vercel). Em troca,
exige verificação de empresa, número dedicado e **templates aprovados**: a
Meta só entrega texto livre nas 24h seguintes a uma mensagem do aluno, e
cobrança, aniversário e avisos partem da academia — ou seja, na prática todo
evento automático precisa de template aprovado.

Na tela, escolha _Meta Cloud API_, use `https://graph.facebook.com/v21.0` como
URL e o **Phone Number ID** (não o telefone) no campo de instância. No modelo
de mensagem, preencha o nome do template aprovado; os placeholders viram
parâmetros posicionais, na ordem em que aparecem no texto.

No console da Meta, o caminho é **Casos de uso** → _Conectar-se com clientes
pelo WhatsApp_, que faz surgir o item WhatsApp na lateral.
