import { clearNumber } from "../utils/configs";

export interface Despesas {
    id_categoria: number;
    id_meio_pagamento: number;
    dsc_meio_pagamento: string;
    ch_rede: string;
    dsc_despesa: string;
    dsc_categoria: string;
    valor_total: number | null;
    data_despesa: string | Date | null;
    despesa_recorrente: string;
    despesa_recorrente_booleano?: boolean;
    parcelada: string;
    parcelado_booleano?: boolean;
    pago: string;
    pago_booleano?: boolean;
    id_despesa: number;
    nome: string;
    despesas?: Despesas[];
}
export const newDespesas: Despesas = {
    id_categoria: clearNumber,
    id_meio_pagamento: clearNumber,
    dsc_meio_pagamento: "",
    ch_rede: "",
    dsc_despesa: "",
    dsc_categoria: "",
    valor_total: null,
    data_despesa: new Date(),
    despesa_recorrente: "N",
    parcelada: "N",
    pago: "S",
    id_despesa: clearNumber,
    nome: "",
};

export type TipoFiltroData = "DIA" | "MES" | "ANO";

export interface DespesasParametros {
    ch_rede?: string;
    tipoFiltro: TipoFiltroData | null;
    dataDia?: Date | string | null;
    mesInicial?: Date | string | null;
    mesFinal?: Date | string | null;
    ano?: Date | string | null;
}
