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
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';
import {
  updateSupplierSchema,
  IUpdateSupplier,
} from '@/server/validations/suppliers';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { FormSelectComponent } from '@/components/forms/formSelectInput/formSelectInput.component';
import { IEditSheetSupplier } from './editSupplier.types';
import { useStateCityOptions } from '@/hooks/useStateCityOptions';
import { maskCellphone, unmaskCellphone } from '@/utils/masksUtils';

export const SheetEditSupplier: React.FC<IEditSheetSupplier> = ({
  isOpen,
  setIsOpen,
  supplierId,
  refetch,
}) => {
  const { toast } = useToast();
  const utils = api.useUtils();
  const { data } = api.supplier.getByID.useQuery({ id: supplierId });
  const update = api.supplier.update.useMutation({
    onSuccess: () => {
      utils.supplier.getByID.invalidate({ id: supplierId });
      utils.supplier.getAll.invalidate();
    },
  });

  // React-Hook-Form
  const form = useForm<IUpdateSupplier>({
    resolver: zodResolver(updateSupplierSchema),
    defaultValues: {
      id: '',
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
    },
  });

  // Alimenta o form quando os dados do supplier chegarem
  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      form.reset({
        id: d.id,
        name: d.name,
        phone: d.phone ?? '',
        street: d.street ?? '',
        state: d.state ?? '',
        city: d.city ?? '',
      });
    }
  }, [data?.data, form]);

  const selectedState = useWatch({ control: form.control, name: 'state' });

  const { statesOptions, citiesOptions, loadingStates, loadingCities } =
    useStateCityOptions(selectedState || '', data?.data?.state || '');

  useEffect(() => {
    if (selectedState && !loadingStates) {
      if (data?.data?.state === selectedState) {
        form.setValue('city', data?.data?.city ?? '');
      }
    }
  }, [selectedState, loadingStates, form, data?.data]);

  const onSubmit = async (vals: IUpdateSupplier) => {
    try {
      await update.mutateAsync(vals);
      toast({ title: 'Sucesso', description: 'Fornecedor atualizado' });
      setIsOpen(false);
      refetch();
    } catch (err) {
      toast({
        title: 'Erro',
        variant: 'destructive',
        description:
          err instanceof Error ? err.message : 'Erro ao atualizar fornecedor',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="min-w-[30vw] overflow-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <SheetHeader>
              <SheetTitle>Editar Fornecedor</SheetTitle>
              <SheetDescription>
                Atualize os dados do fornecedor
              </SheetDescription>
            </SheetHeader>
            <Separator />

            <FormInputComponent
              control={form.control}
              name="name"
              label="Nome"
              maxLength={50}
            />
            <FormInputComponent
              control={form.control}
              name="phone"
              label="Telefone"
              mask={maskCellphone}
              unmask={unmaskCellphone}
              maxLength={15}
            />
            <FormInputComponent
              control={form.control}
              name="street"
              label="Rua"
              maxLength={100}
            />

            <FormSelectComponent
              control={form.control}
              name="state"
              label="Estado"
              placeholder={
                loadingStates ? 'Carregando...' : 'Selecione o estado'
              }
              options={statesOptions}
              disabled={loadingStates}
            />

            <FormSelectComponent
              control={form.control}
              name="city"
              label="Cidade"
              placeholder={
                !selectedState
                  ? 'Selecione um estado primeiro'
                  : loadingCities
                    ? 'Carregando...'
                    : 'Selecione a cidade'
              }
              options={citiesOptions}
              disabled={!selectedState || loadingCities}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={update.isPending || form.formState.isSubmitting}
              >
                {update.isPending ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
