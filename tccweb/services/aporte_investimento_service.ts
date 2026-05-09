import {
    InvestimentosParametros,
    Investimentos,
    Aporte,
} from "../models/investimento_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-aporte-investimento";
    public controller = new AbortController();

    async getInvestiment(ch_rede: string) {
        const response = await axiosClient.get(this.endpoint, {
            params: { ch_rede: ch_rede },
        });

        return response.data;
    }
    async createInvestimentInjection(Investiment: Aporte) {
        const response = await axiosClient.post(this.endpoint, {
            ...Investiment,
        });

        return response.data;
    }
    async updateInvestimentInjection(Investiment: Aporte) {
        const response = await axiosClient.put(this.endpoint, {
            ...Investiment,
        });

        return response.data;
    }
    async deleteInvestimentInjection(ch_rede: string, id_aporte: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { ch_rede: ch_rede, id_aporte: id_aporte },
        });

        return response.data;
    }
}
