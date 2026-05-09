import { Aporte } from "../models/investimento_model";
import { Meta, AporteMeta } from "../models/meta_models";
import { Users } from "../models/usuario_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-meta-movimentacao";
    public controller = new AbortController();

    async getGoalsInjection(ch_rede: string, id_movimentacao?: number) {
        const response = await axiosClient.get(this.endpoint, {
            params: { ch_rede, id_movimentacao },
        });

        return response.data;
    }
    async createGoalsInjection(Income: AporteMeta) {
        const response = await axiosClient.post(this.endpoint, {
            ...Income,
        });

        return response.data;
    }
    async updateGoals(Income: Meta) {
        const response = await axiosClient.put(this.endpoint, {
            ...Income,
        });

        return response.data;
    }
    async deleteGoals(ch_rede: string, id_meta: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { ch_rede: ch_rede, id_meta: id_meta },
        });

        return response.data;
    }

    async getRelatorySaldoMensal(ch_rede: string) {
        const response = await axiosClient.get(
            `${this.endpoint}/relatorio-saldo-mensal`,
            {
                params: { ch_rede },
            }
        );
        return response.data;
    }
}
