import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/login";
    public controller = new AbortController();

    async login(ch_rede: string, senha: string) {
        const response = await axiosClient.post(this.endpoint, {
            ch_rede: ch_rede,
            senha: senha,
        });

        return response.data;
    }
}
