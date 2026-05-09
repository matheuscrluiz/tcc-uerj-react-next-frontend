import C from "./constants";
import { Toast } from "primereact/toast";
import { Response, serverityTypes } from "../models/service_model";

/**
 * Ativa o toast de feedback quando a mensagem for warn ou success.
 *
 * @param {string, string, string}
 *  { severity, summary, detail } - Objeto que contém tipo, título e conteúdo da mensagem, respectivamente.
 * @param {React.RefObject<Toast>} toast - Componente Toast que ativa o display de feedback.
 *
 */
export function showMessage(
    {
        severity,
        summary,
        detail,
    }: { severity: serverityTypes; summary: string; detail: string },
    toast: React.RefObject<Toast>
): void {
    toast.current?.show({
        severity: severity,
        summary: summary,
        detail: detail,
        life: 3000,
    });
}

/**
 * Ativa o toast de feedback quando a mensagem for warn ou success.
 *
 * @param {Response<T>} response - Objeto que contém a mensagem e o tipo da resposta.
 * @param {React.RefObject<Toast>} toast - Componente Toast que ativa o display de feedback.
 *
 */
export function showMessageResponse<T>(
    response: Response<T>,
    toast: React.RefObject<Toast>
): void {
    showMessage(
        {
            severity: response.resp_server.tip_retorno,
            summary: C.SUMMARY[response.resp_server.tip_retorno],
            detail: response.resp_server.msg_retorno,
        },
        toast
    );
}

/**
 * Ativa o toast de feedback quando a mensagem for de erro.
 * Se houver mensagem especificada, ela será exibida.
 * Senão, será exibida uma mensagem de erro padrão.
 *
 * @param {any} error - Objeto que contém a mensagem e o tipo do erro.
 * @param {React.RefObject<Toast>} toast - Componente Toast que ativa o display de feedback.
 *
 */
export function showMessageError<T>(
    error: any,
    toast: React.RefObject<Toast>
): void {
    if (error.response && error.response.data.resp_server) {
        showMessage(
            {
                severity: error.response.data.resp_server.tip_retorno,
                summary: C.SUMMARY.error,
                detail: error.response.data.resp_server.msg_retorno,
            },
            toast
        );
    } else {
        showMessage(
            {
                severity: C.SERVER_ERROR,
                summary: C.SUMMARY.error,
                detail: C.ERRO_PADRAO,
            },
            toast
        );
    }
}

export function formatDate(date: Date) {
    const formattedDate = date.toISOString();
    return formattedDate;
}

/**
 * Converte colunas de datas de string para Date.
 *
 * @param {T[]} data - Array de objetos a ser percorrido.
 * @param {Array<keyof T>} fields - Array de string que contém as colunas que serão convertidas.
 *
 * @return {T[]} Array de objetos com as datas convertidas para Date.
 */
export function convertColumnToDate<T>(
    data: Array<T>,
    fields: Array<keyof T>
): Array<T> {
    data.map((element: T) => {
        const regex = new RegExp(
            "([0-2][0-9]||3[0-1])/(0[0-9]||1[0-2])/([0-9][0-9])?[0-9][0-9]( ([0-1][0-9]||2[0-4]):([0-5][0-9]||60):[0-9][0-9])?"
        );
        for (let field of fields) {
            const value = element[field] as unknown as string;
            if (value) {
                let dateObj: Date;

                if (value.match(regex)) {
                    // dd/mm/yyyy
                    const [day, month, year] = value.split("/");
                    dateObj = new Date(
                        Number(year),
                        Number(month) - 1,
                        Number(day)
                    );
                } else {
                    // ISO ou GMT do backend
                    const d = new Date(value);
                    // Força apenas ano, mês e dia no fuso local
                    dateObj = new Date(
                        d.getUTCFullYear(),
                        d.getUTCMonth(),
                        d.getUTCDate()
                    );
                }

                element[field] = dateObj as unknown as T[keyof T];
            }
        }
    });
    return data;
}

/**
 * Converte colunas Date para string.
 *
 * @param {T[]} data - Array de objetos a ser percorrido.
 * @param {Array<keyof T>} fields - Array de string que contém as colunas que serão convertidas.
 *
 * @return {T[]} Array de objetos com as datas convertidas para string.
 */
export function convertDateToString<T>(
    data: Array<T>,
    fields: Array<keyof T>
): Array<T> {
    const dataCopy = JSON.parse(JSON.stringify(data));
    dataCopy.map((element: T) => {
        for (let field of fields) {
            const value = element[field] as unknown as Date;
            if (value) {
                element[field] = formatViewDate(value) as unknown as T[keyof T];
            }
        }
    });
    return dataCopy;
}

/**
 * Formata as datas no formato ISO para o formato pt-br.
 *
 * @param {string | Date} date - Data a ser formatada.
 *
 * @return {string} Data formatada para o formato pt-br.
 */
export function formatViewDate(date: string | Date): string {
    if (date) {
        if (date instanceof Date) {
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
    return "";
}

/**
 * Formata valores monetários para a moeda especificada.
 *
 * @param {number} value    - Valor da moeda
 * @param {string} currency - Tipo da moeda.
 *
 * @return {string} Valor formatado com o tipo de moeda solicitado.
 */
export function formatCurrency(value: number, currency: string): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: currency,
    });
}

/**
 * Calcula o somatório de um campo numérico.
 *
 * @param {T[]} array - Array de objetos
 * @param {keyof T} field  - Campo a ser somado
 *
 * @return {number} O somatório.
 */
export function sum<T>(array: T[], field: keyof T): number {
    return array.reduce((tot: number, p: T) => {
        const value = p[field];
        if (typeof value == "number") return tot + value;
        return 0;
    }, 0);
}

/**
 * Altera o theme da aplicação
 *
 * @param {string} theme - Novo tema
 *
 */
export function changeTheme(theme: string) {
    const themeLink = document.getElementById(
        "theme-link"
    ) as HTMLAnchorElement;
    if (themeLink) themeLink.href = `/themes/${theme}/theme.css`;
}

export function getUniqueValues<T>(arr: Array<T>): Array<T> {
    return [...new Set(arr)];
}

export const options = [
    { label: "Sim", value: "S" },
    { label: "Não", value: "N" },
];

