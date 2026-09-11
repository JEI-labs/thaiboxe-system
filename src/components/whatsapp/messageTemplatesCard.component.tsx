'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { EMessageEvent, MessageTemplate } from '@prisma/client';

import {
  MESSAGE_EVENTS,
  MESSAGE_EVENT_LIST,
  MESSAGE_PLACEHOLDERS,
} from '@/common/constants/messageEvents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/emptyState/emptyState.component';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/forms/formTextArea/TextArea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';

const EMPTY = {
  id: '',
  event: 'PROMOTIONAL' as EMessageEvent,
  name: '',
  body: '',
};

export function MessageTemplatesCard() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = api.whatsapp.listTemplates.useQuery();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);

  const save = api.whatsapp.saveTemplate.useMutation({
    onSuccess: () => {
      toast({ title: 'Modelo salvo' });
      setOpen(false);
      refetch();
    },
    onError: (error) =>
      toast({
        title: 'Erro ao salvar modelo',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const remove = api.whatsapp.deleteTemplate.useMutation({
    onSuccess: () => {
      toast({ title: 'Modelo excluído' });
      refetch();
    },
  });

  const openNew = () => {
    setDraft(EMPTY);
    setOpen(true);
  };

  const openEdit = (template: MessageTemplate) => {
    setDraft({
      id: template.id,
      event: template.event,
      name: template.name,
      body: template.body,
    });
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Modelos de mensagem</CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo modelo
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm">Carregando modelos…</p>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="Nenhum modelo cadastrado"
            description="Crie um modelo por tipo de evento para reutilizar o texto nos envios."
          />
        ) : (
          data.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between gap-4 rounded-md border p-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{template.name}</p>
                  <Badge variant="secondary">
                    {MESSAGE_EVENTS[template.event].label}
                  </Badge>
                  {MESSAGE_EVENTS[template.event].automatic && (
                    <Badge variant="outline">Automático</Badge>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2 text-sm whitespace-pre-wrap">
                  {template.body}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => openEdit(template)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar modelo</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => remove.mutate({ id: template.id })}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir modelo</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? 'Editar modelo' : 'Novo modelo'}
            </DialogTitle>
            <DialogDescription>
              {MESSAGE_EVENTS[draft.event].description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Evento</Label>
              <Select
                value={draft.event}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    event: value as EMessageEvent,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_EVENT_LIST.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-name">Nome</Label>
              <Input
                id="template-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Ex: Cobrança amigável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-body">Mensagem</Label>
              <Textarea
                id="template-body"
                rows={5}
                value={draft.body}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, body: event.target.value }))
                }
                placeholder="Olá {{primeiro_nome}}, tudo bem?"
              />
              <p className="text-muted-foreground text-xs">
                Disponíveis:{' '}
                {MESSAGE_PLACEHOLDERS.map((item) => item.token).join(', ')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={save.isPending || !draft.name || !draft.body}
              onClick={() =>
                save.mutate({
                  id: draft.id || undefined,
                  event: draft.event,
                  name: draft.name,
                  body: draft.body,
                  isActive: true,
                })
              }
            >
              {save.isPending ? 'Salvando...' : 'Salvar modelo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
