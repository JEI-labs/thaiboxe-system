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
import { FormSelectComponent } from '@/components/forms/formSelectInput/formSelectInput.component';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import {
  IUpdateCategory,
  updateCategorySchema,
} from '@/server/validations/categories';
import { ISheetEditCategory } from './editCategory.types';
import { ECategoryStatus } from '@prisma/client';

export const SheetEditCategory: React.FC<ISheetEditCategory> = ({
  side,
  isOpen,
  setIsOpen,
  categoryId,
  refetch,
}) => {
  const { toast } = useToast();
  const utils = api.useUtils(); // para invalidar cache

  const categoryQuery = api.category.getByID.useQuery({ id: categoryId });

  const updateCategory = api.category.update.useMutation({
    onSuccess: async () => {
      await utils.category.getByID.invalidate({ id: categoryId });
      await utils.category.getAll.invalidate();
    },
  });

  const form = useForm<IUpdateCategory>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      status: ECategoryStatus.ACTIVE,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const category = categoryQuery.data?.data;
    if (category) {
      form.reset({
        id: category.id,
        name: category.name,
        description: category.description,
        status: category.status,
      });
    }
  }, [categoryQuery.data, form]);

  const onSubmit = async (data: IUpdateCategory) => {
    try {
      await updateCategory.mutateAsync(data);
      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso',
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
              <SheetTitle className="text-2xl">Editar Categoria</SheetTitle>
              <SheetDescription className="mt-2 text-center text-sm">
                Faça as alterações necessárias para a categoria selecionada
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
                  placeholder="Nome da categoria"
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
              <div className="col-span-4">
                <FormSelectComponent
                  control={form.control}
                  name="status"
                  label="Status"
                  placeholder="Selecione o status"
                  options={[
                    { value: ECategoryStatus.ACTIVE, textValue: 'Ativo' },
                    { value: ECategoryStatus.INACTIVE, textValue: 'Inativo' },
                  ]}
                />
              </div>
            </div>

            <div className="mb-4 flex w-full justify-end">
              <Button
                type="submit"
                disabled={
                  updateCategory.isPending || form.formState.isSubmitting
                }
              >
                {updateCategory.isPending
                  ? 'Editando categoria...'
                  : 'Editar categoria'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
