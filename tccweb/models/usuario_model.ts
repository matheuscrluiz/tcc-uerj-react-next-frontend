import { clearNumber } from "../utils/configs";
import { Auditoria } from "./service_model";

export interface Users extends Auditoria {
    id: number;
    ativo: string | boolean;
    ch_rede: string;
    codigo: string;
    descricao: string;
    email: string;
    matricula: string;
    nome: string;
    senha_hash: string;
    tipo_usuario_id: number;
}

export const newUsers: Users = {
    id: clearNumber,
    ativo: "",
    ch_rede: "",
    ch_usuario_inclusao: "",
    codigo: "",
    descricao: "",
    data_inclusao: "",
    email: "",
    matricula: "",
    nome: "",
    senha_hash: "",
    tipo_usuario_id: clearNumber,
};
