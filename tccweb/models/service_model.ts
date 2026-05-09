export type serverityTypes = "success" | "info" | "warn" | "error";
export interface Response<T> {
    data_return: T;
    resp_server: {
        msg_retorno: string;
        tip_retorno: serverityTypes;
    };
}
