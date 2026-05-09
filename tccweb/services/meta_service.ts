import { Meta, RelatorySaldoMensal } from "../models/meta_models";
import { Users } from "../models/usuario_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-meta";
    public controller = new AbortController();

    async getGoals(ch_rede: string, id_meta?: number) {
        const response = await axiosClient.get(this.endpoint, {
            params: { ch_rede, id_meta },
        });

        return response.data;
    }
    async createGoals(Income: Meta) {
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
