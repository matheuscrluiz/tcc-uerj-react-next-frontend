import { clearNumber } from "../utils/configs";

export interface Receitas {
    id_categoria: number;
    ch_rede: string;
    dsc_receita: string;
    dsc_categoria: string;
    valor: number | null;
    data_recebimento: string | Date | null;
    receita_recorrente: string;
    receita_recorrente_booleano?: boolean;
    origem_receita: string;
    id_receita: number;
    nome: string;
    receitas?: Receitas[];
}
export const newReceitas: Receitas = {
    id_categoria: clearNumber,
    ch_rede: "",
    dsc_receita: "",
    dsc_categoria: "",
    valor: null,
    data_recebimento: new Date(),
    receita_recorrente: "N",
    origem_receita: "",
    id_receita: clearNumber,
    nome: "",
};

export type TipoFiltroData = "DIA" | "MES" | "ANO";

export interface ReceitaParametros {
    ch_rede?: string;
    tipoFiltro: TipoFiltroData | null;
    dataDia?: Date | string | null;
    mesInicial?: Date | string | null;
    mesFinal?: Date | string | null;
    ano?: Date | string | null;
}
