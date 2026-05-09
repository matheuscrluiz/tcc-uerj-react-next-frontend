import { instituicao } from "../models/instituicao_models";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-instituicao";
    public controller = new AbortController();

    async getBanks(id_instituicao?: number) {
        const response = await axiosClient.get(this.endpoint, {
            params: { id_instituicao: id_instituicao },
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
