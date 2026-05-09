import { clearNumber } from "../utils/configs";

export interface Users {
    ch_rede: string;
    nome: string;
    email: string;
    cpf: string;
    id_usuario: number;
    matricula: string;
    senha: string;
}

export const newUsers: Users = {
    ch_rede: "",
    nome: "",
    email: "",
    cpf: "",
    id_usuario: clearNumber,
    senha: "",
    matricula: "",
};
