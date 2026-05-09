import {
    InvestimentosParametros,
    Investimentos,
    Rendimento,
} from "../models/investimento_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-rendimento-investimento";
    public controller = new AbortController();

    async getInvestimentYield(ch_rede: string) {
        const response = await axiosClient.get(this.endpoint, {
            params: { ch_rede: ch_rede },
        });

        return response.data;
    }
    async createInvestimentYield(Investiment: Rendimento) {
        const response = await axiosClient.post(this.endpoint, {
            ...Investiment,
        });

        return response.data;
    }
    async updateInvestimentYield(Investiment: Rendimento) {
        const response = await axiosClient.put(this.endpoint, {
            ...Investiment,
        });

        return response.data;
    }
    async deleteInvestimentYield(ch_rede: string, id_rendimento: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { ch_rede: ch_rede, id_rendimento: id_rendimento },
        });

        return response.data;
    }
}
