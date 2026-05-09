export type serverityTypes = "success" | "info" | "warn" | "error";
export interface Response<T> {
    data_return: T;
    resp_server: {
        msg_retorno: string;
        tip_retorno: serverityTypes;
    };
}

export interface Auditoria {
    data_inclusao: Date | string | null;
    data_alteracao?: Date | string | null;
    ch_usuario_inclusao: string;
    ch_usuario_alteracao?: string;
}
