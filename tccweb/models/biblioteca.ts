import { clearNumber } from "../utils/configs";

export interface Library {
    id: number;
    nome: string;
    descricao: string;
}
export const newLibrary: Library = {
    id: clearNumber,
    nome: "",
    descricao: "",
};
