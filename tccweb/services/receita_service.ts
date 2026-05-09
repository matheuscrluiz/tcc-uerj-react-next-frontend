import { ReceitaParametros, Receitas } from "../models/receita_model";
import { Users } from "../models/usuario_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-receita";
    public controller = new AbortController();

    async getIncomes(filtro: ReceitaParametros) {
        const response = await axiosClient.get(this.endpoint, {
            params: filtro,
        });

        return response.data;
    }
    async createIncome(Income: Receitas) {
        const response = await axiosClient.post(this.endpoint, {
            ...Income,
        });

        return response.data;
    }
    async updateIncome(Income: Receitas) {
        const response = await axiosClient.put(this.endpoint, {
            ...Income,
        });

        return response.data;
    }
    async deleteIncome(ch_rede: string, id_receita: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { ch_rede: ch_rede, id_receita: id_receita },
        });

        return response.data;
    }
}
