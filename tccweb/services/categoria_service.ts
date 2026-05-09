import { Category } from "../models/biblioteca";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-categoria";
    public controller = new AbortController();

    async getCategory(id_categoria?: number, id_tipo_categoria?: number) {
        const response = await axiosClient.get(this.endpoint, {
            params: {
                id_categoria: id_categoria,
                id_tipo_categoria: id_tipo_categoria,
            },
        });

        return response.data;
    }

    async createCategory(Category: Category) {
        const response = await axiosClient.post(this.endpoint, {
            ...Category,
        });

        return response.data;
    }
    async updateCategory(Category: Category) {
        const response = await axiosClient.put(this.endpoint, {
            ...Category,
        });

        return response.data;
    }
    async deleteCategory(id_categoria: number, id_tipo_categoria: number) {
        const response = await axiosClient.delete(this.endpoint, {
            params: {
                id_categoria: id_categoria,
                id_tipo_categoria: id_tipo_categoria,
            },
        });

        return response.data;
    }
}
