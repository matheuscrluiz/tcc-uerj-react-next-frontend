import { Despesas, DespesasParametros } from "../models/despesa_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-despesa";
    public controller = new AbortController();

    async getExpenses(filtro: DespesasParametros) {
        const response = await axiosClient.get(this.endpoint, {
            params: filtro,
        });

        return response.data;
    }
    async createExpense(Expense: Despesas) {
        const response = await axiosClient.post(this.endpoint, {
            ...Expense,
        });

        return response.data;
    }
    async updateExpense(Expense: Despesas) {
        const response = await axiosClient.put(this.endpoint, {
            ...Expense,
        });

        return response.data;
    }
    async deleteExpense(ch_rede: string, id_despesa: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { ch_rede: ch_rede, id_despesa: id_despesa },
        });

        return response.data;
    }
}
