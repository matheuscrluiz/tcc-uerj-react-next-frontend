import { Users } from "../models/usuario_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/usuario";
    public controller = new AbortController();

    async getUser(ch_rede?: string) {
        const response = await axiosClient.get(this.endpoint, {
            params: { ch_rede: ch_rede },
        });

        return response.data;
    }
    async createUser(user: Users) {
        const response = await axiosClient.post(this.endpoint, {
            ...user,
        });

        return response.data;
    }
    async updateUser(user: Users) {
        const response = await axiosClient.put(this.endpoint, {
            ...user,
        });

        return response.data;
    }
    async deleteUser(ch_rede: string, id_usuario: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { ch_rede: ch_rede, id_usuario: id_usuario },
        });

        return response.data;
    }
}
