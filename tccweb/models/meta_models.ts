// export interface Meta {
//     id_meta: number;
//     dsc_meta: string;
//     valor_meta: number | null;
//     falta: number | null;
//     valor_atual: number | null;
//     prioridade: number;
//     // data_recebimento: string | Date | null;
// }

import { clearNumber } from "../utils/configs";

export interface Meta {
    id_meta: number;
    prioridade: number;
    dsc_meta: string;
    valor_meta: number | null;
    valor_atual: number;
    falta: number;
    ativa: string;
    ativa_booleano: boolean;
    concluida_booleano: boolean;
}
export interface AporteMeta {
    id_movimentacao: number;
    id_meta: number;
    valor: number | null;
    data_movimentacao: Date | string | null;
    // ativa: string;
    // ativa_booleano: boolean;
}
export const newAporte: AporteMeta = {
    id_movimentacao: clearNumber,
    id_meta: clearNumber,
    valor: null,
    data_movimentacao: "",
    // ativa: string;
    // ativa_booleano: boolean;
};
export const newMeta: Meta = {
    id_meta: clearNumber,
    prioridade: clearNumber,
    dsc_meta: "",
    valor_meta: null,
    valor_atual: clearNumber,
    falta: clearNumber,
    ativa: "",
    ativa_booleano: false,
    concluida_booleano: false,
};

export interface RelatorySaldoMensal {
    mes: string;
    saldo: number;
    aportado: number;
    disponivel: number;
}

export const prioridadeLabel = (p: number) =>
    ({ 1: "Alta", 2: "Média", 3: "Baixa" })[p] || String(p);

export const prioridadeSeverity = (p: number) =>
    ({ 1: "danger", 2: "warning", 3: "info" })[p] || "secondary";

