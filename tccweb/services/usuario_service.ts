import { Users } from "../models/usuario_model";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/usuario";
    public controller = new AbortController();

    async getUser(id?: number) {
        const response = await axiosClient.get(this.endpoint, {
            params: { id: id },
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
    async deleteUser(id: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { id: id },
        });

        return response.data;
    }
}
