import { Library } from "../models/biblioteca";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/biblioteca";
    public controller = new AbortController();

    async getLibraries(id?: number) {
        const response = await axiosClient.get(this.endpoint, {
            params: { id: id },
        });

        return response.data;
    }

    async createLibrary(library: Library) {
        const response = await axiosClient.post(this.endpoint, {
            ...library,
        });

        return response.data;
    }

    async updateLibrary(library: Library) {
        const response = await axiosClient.put(this.endpoint, {
            ...library,
        });

        return response.data;
    }

    async deleteLibrary(id: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: { id: id },
        });

        return response.data;
    }
}
