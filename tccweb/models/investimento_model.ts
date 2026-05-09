import { clearNumber } from "../utils/configs";

export interface Investimentos {
    id_categoria: number;
    ch_rede: string;
    dsc_receita: string;
    dsc_categoria: string;
    valor_inicial: number;

    // datas
    data_inicio: string | Date | null;
    data_fim: string | Date | null;
    data_aporte: string | Date | null;

    // aporte
    id_aporte: number;
    valor_aporte: number;

    // investimento
    id_instituicao: number;
    dsc_instituicao: string;
    nome_investimento: string;
    id_investimento: number;
    valor_total_investido?: number;

    //rendimento
    id_rendimento: number;
    valor_rendimento: number;
    mes_referencia: string | Date | null;

    // outros
    nome: string;
    aportes?: Aporte[];
    rendimentos?: Rendimento[];
}

export interface Aporte {
    id_aporte: number;
    valor_aporte: number;
    data_aporte: string | Date | null;
}

export const newAporte: Aporte = {
    id_aporte: clearNumber,
    valor_aporte: 0,
    data_aporte: new Date(),
};
export interface Rendimento {
    id_rendimento: number;
    valor_rendimento: number;
    mes_referencia: string | Date | null;
}

export const newRendimento: Rendimento = {
    id_rendimento: clearNumber,
    valor_rendimento: 0,
    mes_referencia: new Date(),
};
export interface Aging {
    data_inicial: number;
    "1_a_5_dias": number;
    "6_a_30_dias": number;
    "31_a_90_dias": number;
    "91_a_180_dias": number;
    mais_180_dias: number;
}

export const newAging: Aging = {
    data_inicial: 0,
    "1_a_5_dias": 0,
    "6_a_30_dias": 0,
    "31_a_90_dias": 0,
    "91_a_180_dias": 0,
    mais_180_dias: 0,
};
export const newInvestimentos: Investimentos = {
    id_categoria: clearNumber,
    ch_rede: "",
    dsc_receita: "",
    dsc_categoria: "",
    valor_inicial: 0,

    data_inicio: new Date(),
    data_fim: "",
    data_aporte: new Date(),

    id_aporte: clearNumber,
    valor_aporte: clearNumber,

    id_instituicao: clearNumber,
    dsc_instituicao: "",
    nome_investimento: "",
    id_investimento: clearNumber,

    id_rendimento: clearNumber,
    valor_rendimento: clearNumber,
    mes_referencia: new Date(),

    nome: "",
};

export type TipoFiltroData = "DIA" | "MES" | "ANO";

export interface InvestimentosParametros {
    ch_rede?: string;
    tipoFiltro: TipoFiltroData | null;
    dataDia?: Date | string | null;
    mesInicial?: Date | string | null;
    mesFinal?: Date | string | null;
    ano?: Date | string | null;
}
