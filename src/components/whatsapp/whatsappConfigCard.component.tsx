'use client';

import { useState } from 'react';
import { EWhatsappProvider } from '@prisma/client';

import { useResetOnChange } from '@/hooks/useResetOnChange/useResetOnChange.hook';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';

export function WhatsappConfigCard() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = api.whatsapp.getConfig.useQuery();

  const [provider, setProvider] = useState<EWhatsappProvider>('ZAPI');
  const [baseUrl, setBaseUrl] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [isActive, setIsActive] = useState(false);

  // preenche o formulário quando a config chega; durante o render, para o
  // valor salvo não aparecer depois de um frame com os campos vazios
  useResetOnChange([data], () => {
    if (!data) return;
    setProvider(data.provider);
    setBaseUrl(data.baseUrl);
    setInstanceId(data.instanceId ?? '');
    setSenderNumber(data.senderNumber);
    setIsActive(data.isActive);
  });

  const save = api.whatsapp.saveConfig.useMutation({
    onSuccess: () => {
      toast({ title: 'Configuração salva' });
      setToken('');
      refetch();
    },
    onError: (error) =>
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      }),
  });

  if (isLoading) {
    return <p className="py-4 text-sm">Carregando configuração…</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integração de WhatsApp</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Provedor</Label>
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as EWhatsappProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ZAPI">Z-API</SelectItem>
                <SelectItem value="EVOLUTION">Evolution API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderNumber">Número remetente</Label>
            <Input
              id="senderNumber"
              value={senderNumber}
              onChange={(event) => setSenderNumber(event.target.value)}
              placeholder="(44) 99999-9999"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseUrl">URL da instância</Label>
          <Input
            id="baseUrl"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder={
              provider === 'ZAPI'
                ? 'https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN'
                : 'https://sua-evolution.com'
            }
          />
        </div>

        {provider === 'EVOLUTION' && (
          <div className="space-y-2">
            <Label htmlFor="instanceId">Nome da instância</Label>
            <Input
              id="instanceId"
              value={instanceId}
              onChange={(event) => setInstanceId(event.target.value)}
              placeholder="minha-instancia"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Input
            id="token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder={
              data?.hasToken
                ? 'Token salvo — preencha só para trocar'
                : 'Token do provedor'
            }
          />
          <p className="text-muted-foreground text-xs">
            {/* o token nunca volta do servidor; em branco significa manter */}
            Por segurança o token nunca é exibido depois de salvo. Deixe em
            branco para manter o atual.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Integração ativa</p>
            <p className="text-muted-foreground text-xs">
              Com isto desligado, nenhuma mensagem é enviada.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="flex justify-end">
          <Button
            disabled={save.isPending}
            onClick={() =>
              save.mutate({
                provider,
                baseUrl,
                instanceId: instanceId || null,
                token: token || undefined,
                senderNumber,
                isActive,
              })
            }
          >
            {save.isPending ? 'Salvando...' : 'Salvar configuração'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
