import { MeioPagamento } from "../models/meio_pagamento_models";
import { axiosClient } from "./axios";

export default class Service {
    private endpoint = "/controlei-meio-pagemento";
    public controller = new AbortController();

    async getPaymentMethod(id_meio_pagamento?: string) {
        const response = await axiosClient.get(this.endpoint, {
            params: { id_meio_pagamento: id_meio_pagamento },
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
