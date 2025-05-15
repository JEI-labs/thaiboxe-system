// components/sheetCreatePlan.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
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

  console.log(form.formState.errors);

  const onSubmit = async (values: ICreatePlanSchema) => {
    console.log('entrou aqui');

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side={side} className="min-w-[30vw] overflow-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <SheetHeader>
              <SheetTitle>Novo Plano</SheetTitle>
              <SheetDescription>
                Defina o nome, valor e duração do plano
              </SheetDescription>
            </SheetHeader>

            <Separator />

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
              placeholder="1"
              maxLength={2}
              mask={maskOnlyNumbersV2}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={createPlan.isPending || form.formState.isSubmitting}
              >
                {createPlan.isPending ? 'Salvando...' : 'Criar Plano'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
