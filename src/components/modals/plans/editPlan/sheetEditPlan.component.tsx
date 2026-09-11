'use client';

import { FormDrawer } from '@/components/formDrawer/formDrawer.component';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { api } from '@/trpc/react';
import { ISheetEditPlan } from './sheetEditPlan.types';
import {
  IUpdatePlanSchema,
  updatePlanSchema,
} from '@/server/validations/plans';
import { maskDecimalWithAcronym, unmaskDecimal } from '@/utils/masksUtils';
import { maskOnlyNumbersV2 } from '@/common/utils/mask';

export const SheetEditPlan: React.FC<ISheetEditPlan> = ({
  side,
  isOpen,
  setIsOpen,
  planId,
  refetch,
}) => {
  const { toast } = useToast();
  const utils = api.useUtils();

  const planQuery = api.plans.getById.useQuery({ id: planId });

  const updatePlan = api.plans.update.useMutation({
    onSuccess: async () => {
      await utils.plans.getById.invalidate({ id: planId });
      await utils.plans.getAll.invalidate();
    },
  });

  const form = useForm<IUpdatePlanSchema>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      price: '0',
      duration: '1',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const plan = planQuery.data?.data;
    if (plan) {
      form.reset({
        id: plan.id,
        name: plan.name,
        description: plan.description ?? '',
        price: (Number(plan.price) * 100).toString(),
        duration: plan.duration.toString(),
      });
    }
  }, [planQuery.data, form]);

  console.log(planQuery.data?.data.price);

  const onSubmit = async (data: IUpdatePlanSchema) => {
    try {
      await updatePlan.mutateAsync(data);
      toast({
        title: 'Sucesso',
        description: 'Plano atualizado com sucesso',
        variant: 'default',
      });
      setIsOpen(false);
      refetch?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  return (
    <Form {...form}>
      <FormDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        side={side}
        title="Editar plano"
        description="Altere os dados do plano"
        onSubmit={form.handleSubmit(onSubmit)}
        submitLabel="Salvar alterações"
        submitPendingLabel="Salvando..."
        isSubmitting={updatePlan.isPending || form.formState.isSubmitting}
      >
        <div className="mx-2 my-8 grid w-full grid-cols-4 gap-6">
          <div className="col-span-4">
            <FormInputComponent
              control={form.control}
              name="name"
              label="Nome"
              type="text"
              placeholder="Nome do plano"
              maxLength={50}
            />
          </div>
          <div className="col-span-4">
            <FormInputComponent
              control={form.control}
              name="description"
              label="Descrição"
              type="text"
              placeholder="(opcional)"
              maxLength={50}
            />
          </div>
          <div className="col-span-2">
            <FormInputComponent
              control={form.control}
              name="price"
              label="Preço (R$)"
              placeholder="0.00"
              mask={maskDecimalWithAcronym}
              unmask={unmaskDecimal}
              maxLength={10}
            />
          </div>
          <div className="col-span-2">
            <FormInputComponent
              control={form.control}
              name="duration"
              label="Duração (meses)"
              tooltip="Por quantos meses a matrícula vale. O valor informado é o de cada parcela."
              placeholder="1"
              mask={maskOnlyNumbersV2}
              min={1}
            />
          </div>
        </div>

        <div className="mb-4 flex w-full justify-end">
          <Button
            type="submit"
            disabled={updatePlan.isPending || form.formState.isSubmitting}
          >
            {updatePlan.isPending ? 'Editando plano...' : 'Editar plano'}
          </Button>
        </div>
      </FormDrawer>
    </Form>
  );
};
