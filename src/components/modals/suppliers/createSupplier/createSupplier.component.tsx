'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';
import {
  createSupplierSchema,
  ICreateSupplier,
} from '@/server/validations/suppliers';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { FormSelectComponent } from '@/components/forms/formSelectInput/formSelectInput.component';
import { ICreateSheetSupplier } from './createSupplier.types';
import { maskCellphone, unmaskCellphone } from '@/utils/masksUtils';
import { fetchStates, fetchCities, IBGEState } from '@/utils/api/ibge';

export const SheetCreateSupplier: React.FC<ICreateSheetSupplier> = ({
  isOpen,
  setIsOpen,
  refetch,
}) => {
  const { toast } = useToast();
  const createSupplier = api.supplier.create.useMutation();

  const form = useForm<ICreateSupplier>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
    },
  });

  // cache em memória: estado.sigla → opções de cidades
  const citiesCache = useRef<
    Record<string, Array<{ value: string; textValue: string }>>
  >({});
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [rawStates, setRawStates] = useState<Array<IBGEState>>([]);
  const [citiesOptions, setCitiesOptions] = useState<
    Array<{ value: string; textValue: string }>
  >([]);
  const selectedState = form.watch('state');

  useEffect(() => {
    setLoadingStates(true);
    fetchStates()
      .then((data) => setRawStates(data))
      .catch(() =>
        toast({ title: 'Erro ao carregar estados', variant: 'destructive' }),
      )
      .finally(() => setLoadingStates(false));
  }, [toast]);

  const statesOptions = useMemo(
    () =>
      rawStates.map((st) => ({
        value: st.sigla,
        textValue: st.nome,
      })),
    [rawStates],
  );

  useEffect(() => {
    form.setValue('city', '');

    if (!selectedState) {
      setCitiesOptions([]);
      setLoadingCities(false);
      return;
    }

    // se já tem no cache, usa direto
    if (citiesCache.current[selectedState]) {
      setCitiesOptions(citiesCache.current[selectedState]);
      return;
    }

    // senão busca e cacheia
    setLoadingCities(true);
    fetchCities(selectedState)
      .then((data) => {
        const opts = data.map((ct) => ({
          value: ct.nome,
          textValue: ct.nome,
        }));
        citiesCache.current[selectedState] = opts;
        setCitiesOptions(opts);
      })
      .catch(() =>
        toast({ title: 'Erro ao carregar cidades', variant: 'destructive' }),
      )
      .finally(() => setLoadingCities(false));
  }, [selectedState, toast, form]);

  const onSubmit = async (vals: ICreateSupplier) => {
    try {
      await createSupplier.mutateAsync(vals);
      toast({ title: 'Sucesso', description: 'Fornecedor criado' });
      form.reset();
      setIsOpen(false);
      refetch();
    } catch (err) {
      toast({
        title: 'Erro',
        variant: 'destructive',
        description:
          err instanceof Error ? err.message : 'Erro ao criar fornecedor',
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
              <SheetTitle>Novo Fornecedor</SheetTitle>
              <SheetDescription>
                Preencha os dados para cadastrar um fornecedor
              </SheetDescription>
            </SheetHeader>
            <Separator />

            <FormInputComponent
              control={form.control}
              name="name"
              label="Nome"
              placeholder="Nome do fornecedor"
            />
            <FormInputComponent
              control={form.control}
              name="phone"
              label="Telefone"
              placeholder="(xx) xxxxx-xxxx"
              mask={maskCellphone}
              unmask={unmaskCellphone}
              maxLength={15}
            />
            <FormInputComponent
              control={form.control}
              name="street"
              label="Rua"
              placeholder="Rua do fornecedor"
              maxLength={100}
            />

            <FormSelectComponent
              control={form.control}
              name="state"
              label="Estado"
              placeholder={
                loadingStates ? 'Carregando estados...' : 'Selecione o estado'
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
                    ? 'Carregando cidades...'
                    : 'Selecione a cidade'
              }
              options={citiesOptions}
              disabled={!selectedState || loadingCities}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
