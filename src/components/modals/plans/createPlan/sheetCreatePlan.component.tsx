// components/sheetCreatePlan.tsx
'use client';

import { FormDrawer } from '@/components/formDrawer/formDrawer.component';
import React from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';
import { ICreateSheetPlan } from './sheetCreatePlan.types';
import { maskDecimalWithAcronym, unmaskDecimal } from '@/utils/masksUtils';
import {
  createPlanSchema,
  ICreatePlanSchema,
} from '@/server/validations/plans';
import { maskOnlyNumbersV2 } from '@/common/utils/mask';

export const SheetCreatePlan: React.FC<ICreateSheetPlan> = ({
  side,
  isOpen,
  setIsOpen,
  refetch,
}) => {
  const { toast } = useToast();
  const createPlan = api.plans.create.useMutation();

  const form = useForm<ICreatePlanSchema>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      price: '0',
      duration: '1',
      description: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ICreatePlanSchema) => {
    try {
      await createPlan.mutateAsync(values);
      toast({
        title: 'Sucesso',
        description: 'Plano criado com sucesso',
      });
      form.reset();
      setIsOpen(false);
      refetch?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar plano';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <FormDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        side={side}
        title="Novo plano"
        description="Preencha os dados do plano"
        onSubmit={form.handleSubmit(onSubmit)}
        submitLabel="Criar plano"
        submitPendingLabel="Salvando..."
        isSubmitting={createPlan.isPending || form.formState.isSubmitting}
      >
        <FormInputComponent
          control={form.control}
          name="name"
          label="Nome"
          type="text"
          placeholder="Ex: Mensalidade"
          maxLength={50}
        />

        <FormInputComponent
          control={form.control}
          name="description"
          label="Descrição"
          type="text"
          placeholder="Descreva o plano"
          maxLength={100}
        />

        <FormInputComponent
          control={form.control}
          name="price"
          label="Preço (R$)"
          placeholder="0.00"
          mask={maskDecimalWithAcronym}
          unmask={unmaskDecimal}
        />

        <FormInputComponent
          control={form.control}
          name="duration"
          label="Duração (meses)"
          tooltip="Por quantos meses a matrícula vale. O valor informado é o de cada parcela."
          placeholder="1"
          maxLength={2}
          mask={maskOnlyNumbersV2}
        />
      </FormDrawer>
    </Form>
  );
};
