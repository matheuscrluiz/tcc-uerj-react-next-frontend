import {
    InvestimentosParametros,
    Investimentos,
} from "../models/investimento_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-investimento";
    public controller = new AbortController();

    async getInvestiment(ch_rede: string) {
        const response = await axiosClient.get(this.endpoint, {
            params: { ch_rede: ch_rede },
        });

        return response.data;
    }
    async createInvestiment(Investiment: Investimentos) {
        const response = await axiosClient.post(this.endpoint, {
            ...Investiment,
        });

        return response.data;
    }
    async updateInvestiment(Investiment: Investimentos) {
        const response = await axiosClient.put(this.endpoint, {
            ...Investiment,
        });

        return response.data;
    }
    async deleteInvestiment(ch_rede: string, id_investimento: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { ch_rede: ch_rede, id_investimento: id_investimento },
        });

        return response.data;
    }
}
