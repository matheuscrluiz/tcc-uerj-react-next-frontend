import { ReceitaParametros } from "./receita_model";

const getMesAtual = (): Date => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
};

export const createReceitaParametros = (): ReceitaParametros => ({
    tipoFiltro: "MES",
    dataDia: null,
    mesInicial: getMesAtual(),
    mesFinal: getMesAtual(),
    ano: new Date(),
});
