// components/sheetCreatePlan.tsx
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
import { ICreatePlan, createPlanSchema } from '@/server/validations/plans';
import { ICreateSheetPlan } from './createPlans.types';

export const SheetCreatePlan: React.FC<ICreateSheetPlan> = ({
  side,
  isOpen,
  setIsOpen,
  refetch,
}) => {
  const { toast } = useToast();
  const createPlan = api.plan.create.useMutation();

  const form = useForm<ICreatePlan>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 1,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ICreatePlan) => {
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
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
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
                Defina nome, preço e duração do plano
              </SheetDescription>
            </SheetHeader>

            <Separator />

            <FormInputComponent
              control={form.control}
              name="name"
              label="Nome"
              type="text"
              placeholder="Ex: Básico"
              maxLength={50}
            />

            <FormInputComponent
              control={form.control}
              name="description"
              label="Descrição"
              type="text"
              placeholder="Descreva o plano"
              maxLength={255}
            />

            <FormInputComponent
              control={form.control}
              name="price"
              label="Preço (R$)"
              type="number"
              placeholder="Ex: 99.90"
            />

            <FormInputComponent
              control={form.control}
              name="duration"
              label="Duração (meses)"
              type="number"
              placeholder="Ex: 6"
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
