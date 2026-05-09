import { clearNumber } from "../utils/configs";
import { Auditoria } from "./service_model";

export interface Library extends Auditoria {
    id: number;
    nome: string;
    descricao: string;
}
export const newLibrary: Library = {
    id: clearNumber,
    nome: "",
    descricao: "",
    ch_usuario_inclusao: "",
    data_inclusao: "",
};
