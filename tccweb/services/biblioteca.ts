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
    // async createCategoryType(CategoryType: CategoryType) {
    //     const response = await axiosClient.post(this.endpoint, {
    //         ...CategoryType,
    //     });

    //     return response.data;
    // }
    // async updateCategoryType(CategoryType: CategoryType) {
    //     const response = await axiosClient.put(this.endpoint, {
    //         ...CategoryType,
    //     });

    //     return response.data;
    // }
    // async deleteCategoryType(id_tipo_categoria: number) {
    //     const response = await axiosClient.delete(this.endpoint, {
    //         params: { id_tipo_categoria: id_tipo_categoria },
    //     });

    //     return response.data;
    // }
}
