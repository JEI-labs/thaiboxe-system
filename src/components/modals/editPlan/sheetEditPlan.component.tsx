'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import {
  ISheetEditPlan,
  IUpdatePlan,
  updatePlanSchema,
} from './sheetEditPlan.types';

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

  const form = useForm<IUpdatePlan>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      price: '0',
      duration: 1,
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
        price: plan.price,
        duration: plan.duration,
      });
    }
  }, [planQuery.data, form]);

  const onSubmit = async (data: IUpdatePlan) => {
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side={side}
        className="min-w-[40vw] items-center overflow-auto xl:min-w-[30vw]"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <SheetHeader className="mx-2 mb-8 flex flex-col items-center">
              <SheetTitle className="text-2xl">Editar Plano</SheetTitle>
              <SheetDescription className="mt-2 text-center text-sm">
                Faça as alterações necessárias para o plano selecionado
              </SheetDescription>
            </SheetHeader>

            <Separator />

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
                />
              </div>
              <div className="col-span-2">
                <FormInputComponent
                  control={form.control}
                  name="price"
                  label="Preço (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <FormInputComponent
                  control={form.control}
                  name="duration"
                  label="Duração (meses)"
                  type="number"
                  placeholder="1"
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
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
