// utils/ibge.ts
import axios from 'axios';

export interface IBGEState {
  sigla: string;
  nome: string;
}

export interface IBGECity {
  nome: string;
}

/**
 * Busca todos os estados ordenados por nome.
 */
export async function fetchStates(): Promise<Array<IBGEState>> {
  const { data } = await axios.get<Array<IBGEState>>(
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
  );
  return data;
}

/**
 * Busca todas as cidades de um estado, dado sua sigla.
 * @param stateSigla Sigla do estado (ex: "SP", "RJ")
 */
export async function fetchCities(
  stateSigla: string,
): Promise<Array<IBGECity>> {
  const { data } = await axios.get<Array<IBGECity>>(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateSigla}/municipios?orderBy=nome`,
  );
  return data;
}
