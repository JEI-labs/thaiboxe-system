# WhatsApp via Evolution API

O sistema fala com o Evolution por HTTP (`src/server/whatsapp/client.ts`).
O Evolution precisa de um processo sempre ligado, porque mantém um WebSocket
aberto com o WhatsApp — por isso **não roda na Vercel**, que é serverless.

## Onde hospedar

A opção gratuita de verdade é a **Oracle Cloud Always Free**: uma VM ARM
(4 vCPU / 24 GB) sem prazo de expiração.

Render e Railway têm plano gratuito, mas hibernam por inatividade. Quando o
processo dorme, a sessão do WhatsApp cai e é preciso ler o QR de novo — o que
inviabiliza os disparos automáticos da fase 2.

## Subindo o Evolution

Na VM, com Docker instalado:

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

Libere a porta 8080 no _security list_ da Oracle **e** no firewall da própria
VM (`iptables`), que na imagem Oracle Linux vem fechado por padrão:

```bash
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save
```

Coloque um domínio com HTTPS na frente (Caddy resolve em duas linhas). Alguns
provedores recusam webhook em HTTP puro, e o token viaja nessa conexão.

## Criando a instância

```bash
curl -X POST https://seu-dominio/instance/create \
  -H 'apikey: troque-esta-chave' \
  -H 'Content-Type: application/json' \
  -d '{"instanceName":"thaiboxe","integration":"WHATSAPP-BAILEYS"}'
```

Pegue o QR em `GET /instance/connect/thaiboxe` e leia pelo WhatsApp do celular
em _Aparelhos conectados_.

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

Evolution usa Baileys, que é WhatsApp Web por baixo — ou seja, **não é uma via
oficial**. O número pode ser banido, e envio em massa aumenta muito essa
chance. Recomendações:

- use um número que não seja o principal da academia;
- espace os disparos em vez de mandar tudo de uma vez;
- mantenha os textos pessoais; mensagem idêntica para dezenas de contatos é o
  padrão que a Meta detecta.

Se isso virar um problema, a saída é a Cloud API oficial da Meta. O
`buildRequest` já isola as diferenças entre provedores, então é acrescentar um
caso — o resto do código não muda.
