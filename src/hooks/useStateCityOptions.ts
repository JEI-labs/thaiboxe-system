// hooks/useStateCityOptions.ts
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchStates,
  fetchCities,
  IBGEState,
  IBGECity,
} from '@/utils/api/ibge';

export interface Option {
  value: string;
  textValue: string;
}

/**
 * Hook para alimentar selects de Estado → Cidade, já trazendo
 * as cidades iniciais a partir de `initialState`.
 *
 * @param selectedState Sigla do estado atualmente selecionado no form
 * @param initialState  Sigla do estado do fornecedor (edição), se houver
 */
export function useStateCityOptions(
  selectedState: string,
  initialState?: string,
) {
  const { toast } = useToast();
  const [rawStates, setRawStates] = useState<Array<IBGEState>>([]);
  const [rawCities, setRawCities] = useState<Array<IBGECity>>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // 1) busca todos os estados uma vez
  useEffect(() => {
    setLoadingStates(true);
    fetchStates()
      .then(setRawStates)
      .catch(() =>
        toast({ title: 'Erro ao carregar estados', variant: 'destructive' }),
      )
      .finally(() => setLoadingStates(false));
  }, [toast]);

  // 2) pré-carrega as cidades do estado inicial (edição)
  useEffect(() => {
    if (!initialState) return;
    setLoadingCities(true);
    fetchCities(initialState)
      .then(setRawCities)
      .catch(() =>
        toast({
          title: 'Erro ao carregar cidades iniciais',
          variant: 'destructive',
        }),
      )
      .finally(() => setLoadingCities(false));
  }, [initialState, toast]);

  // 3) toda vez que o usuário muda de estado, carrega novas cidades
  useEffect(() => {
    if (!selectedState || selectedState === initialState) {
      return;
    }
    setLoadingCities(true);
    fetchCities(selectedState)
      .then(setRawCities)
      .catch(() =>
        toast({ title: 'Erro ao carregar cidades', variant: 'destructive' }),
      )
      .finally(() => setLoadingCities(false));
  }, [selectedState, initialState, toast]);

  // transforma em Option para o select
  const statesOptions = useMemo<Array<Option>>(
    () => rawStates.map((st) => ({ value: st.sigla, textValue: st.nome })),
    [rawStates],
  );

  const citiesOptions = useMemo<Array<Option>>(
    () => rawCities.map((ct) => ({ value: ct.nome, textValue: ct.nome })),
    [rawCities],
  );

  return { statesOptions, citiesOptions, loadingStates, loadingCities };
}
