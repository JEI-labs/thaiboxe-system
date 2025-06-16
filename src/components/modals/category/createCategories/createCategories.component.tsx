// components/sheetCreateCategory.tsx
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
import {
  createCategorySchema,
  ICreateCategory,
} from '@/server/validations/categories';
import { ICreateSheetCategory } from './createCategories.types';

export const SheetCreateCategory: React.FC<ICreateSheetCategory> = ({
  side,
  isOpen,
  setIsOpen,
  refetch,
}) => {
  const { toast } = useToast();
  const createCategory = api.category.create.useMutation();

  const form = useForm<ICreateCategory>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: '', status: 'ACTIVE', description: '' },
    mode: 'onChange',
  });

  const onSubmit = async (values: ICreateCategory) => {
    try {
      await createCategory.mutateAsync(values);
      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso',
      });
      form.reset();
      setIsOpen(false);
      refetch?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar categoria';
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
              <SheetTitle>Nova Categoria</SheetTitle>
              <SheetDescription>
                Defina o nome e o status da categoria
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
              placeholder="Descreva a categoria"
              maxLength={50}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={
                  createCategory.isPending || form.formState.isSubmitting
                }
              >
                {createCategory.isPending ? 'Salvando...' : 'Criar Categoria'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
