import { Toast } from "primereact/toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Service from "../../services/biblioteca";
import CatService from "../../services/categoria_service";
import {
    DataTable,
    DataTableFilterMeta,
    DataTableFilterMetaData,
    DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import {
    getUniqueValues,
    showMessage,
    showMessageError,
    showMessageResponse,
} from "../../utils/utils";
import C from "../../utils/constants";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import {
    crudBodyTemplate,
    uniqueFilterTemplate,
} from "../../components/Templates/templates";
import { Dialog } from "primereact/dialog";
import { clearNumber } from "../../utils/configs";
import { FilterMatchMode } from "primereact/api";
import { Library } from "../../models/biblioteca";

interface UserProps {
    loading(b: boolean): void;
    toast: React.RefObject<Toast>;
}

const initfilter = {
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    id_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
    dsc_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
    codigo_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
};
export default function UserScreen({ loading, toast }: UserProps) {
    const [libraries, setLibraries] = useState<Library[]>([]);

    // const [currentCategory, setCurrentCategory] =
    //     useState<Library>(newCategory);
    // const [selectedCategoryType, setSelectedCategoryType] =
    //     useState<Library>(newCategory);
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
    const [isCatDialogVisible, setIsCatDialogVisible] =
        useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [catGlobalFilter, setCatGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        ...initfilter,
    });
    const service = new Service();
    const catService = new CatService();
    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        try {
            loading(true);
            const response = await service.getLibraries();
            setLibraries(response.data_return);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            loading(false);
        }
    };
    const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const _filters = { ...filters };
        (_filters.global as DataTableFilterMetaData).value = value;
        setFilters(_filters);
        setGlobalFilter(value);
    };

    const resetFilters = async () => {
        (filters.global as DataTableFilterMetaData).value = "";
        setFilters({ ...filters });
        setGlobalFilter("");
    };

    const AddCategoryType = () => {
        setIsDialogVisible(true);
    };
    const AddCategory = () => {
        // if (selectedCategoryType.id_tipo_categoria === clearNumber) {
        //     showMessage(
        //         {
        //             severity: "warn",
        //             summary: "Atenção",
        //             detail: "Selecione um tipo de categoria primeiro",
        //         },
        //         toast
        //     );
        //     return;
        // }
        setIsCatDialogVisible(true);
    };
    const tableHeader = (
        <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:justify-content-between">
            <div className="p-inputgroup w-full md:w-1  ">
                <Button
                    className="mr-0 md:mr-2"
                    outlined
                    label="Adicionar"
                    icon="pi pi-plus"
                    onClick={AddCategoryType}
                />
            </div>
            <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:align-items-center">
                <Button
                    className="mr-0 md:mr-2"
                    severity="danger"
                    outlined
                    label="Limpar Filtros"
                    icon="pi pi-filter-slash"
                    onClick={resetFilters}
                />
                <IconField>
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        className="w-full"
                        value={globalFilter}
                        onChange={onGlobalFilterChange}
                        onInput={(e) =>
                            setGlobalFilter(
                                (e.target as HTMLInputElement).value
                            )
                        }
                        placeholder={C.BUSCAR}
                    />
                </IconField>
            </div>
        </div>
    );
    const tableHeaderCategory = (
        <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:justify-content-between">
            <div className="p-inputgroup w-full md:w-1  ">
                <Button
                    className="mr-0 md:mr-2"
                    outlined
                    label="Adicionar"
                    icon="pi pi-plus"
                    onClick={AddCategory}
                />
            </div>
            <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:align-items-center">
                {/* <Button
                    className="mr-0 md:mr-2"
                    severity="danger"
                    outlined
                    label="Limpar Filtros"
                    icon="pi pi-filter-slash"
                    onClick={resetFilters}
                /> */}
                <IconField>
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        className="w-full"
                        value={catGlobalFilter}
                        onInput={(e) =>
                            setCatGlobalFilter(
                                (e.target as HTMLInputElement).value
                            )
                        }
                        placeholder={C.BUSCAR}
                    />
                </IconField>
            </div>
        </div>
    );

    const optionsBodyTemplate = (data: Library) => {
        const onEdit = async () => {
            try {
                setIsDialogVisible(true);
            } catch (error) {
                showMessageError(error, toast);
            }
        };
        const onDelete = () => {
            handleDelete(data);
        };
        const msgDelete = (
            <>
                <span className="text-lg">
                    Você irá remover o seguinte tipo de categoria:
                </span>
                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    {/* <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Id do tipo de categoria:
                        <b> {data.id_tipo_categoria}</b>
                    </span>
                    <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Códgido do tipo de despesa:
                        <b> {data.codigo_tipo_categoria}</b>
                    </span>
                    <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Descrição do tipo de categoria:
                        <b> {data.dsc_tipo_categoria}</b>
                    </span> */}
                    {/* <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Flag de config. de Desenvolvimento:
                        <b>
                            {verifiedBodyTemplate(
                                data,
                                "flag_determ_config_desenv_boolean"
                            )}
                        </b>
                    </span> */}
                </div>
            </>
        );
        return crudBodyTemplate(data, false, onEdit, onDelete, msgDelete);
    };
    const catOptionsBodyTemplate = (data: Library) => {
        const onEdit = async () => {
            try {
                // setCurrentCategory(data);
                setIsCatDialogVisible(true);
            } catch (error) {
                showMessageError(error, toast);
            }
        };
        const onDelete = () => {
            handleCategoryDelete(data);
        };
        const msgDelete = (
            <>
                <span className="text-lg">
                    Você irá remover o seguinte registro de categoria:
                </span>
                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    {/* <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Tipo:
                        <b> {data.codigo_tipo_categoria}</b>
                    </span>
                    <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Descrição da categoria:
                        <b> {data.dsc_categoria}</b>
                    </span> */}

                    {/* <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Flag de config. de Desenvolvimento:
                        <b>
                            {verifiedBodyTemplate(
                                data,
                                "flag_determ_config_desenv_boolean"
                            )}
                        </b>
                    </span> */}
                </div>
            </>
        );
        return crudBodyTemplate(data, false, onEdit, onDelete, msgDelete);
    };

    const handleDelete = async (cat: Library) => {
        try {
            // const response = await service.deleteCategoryType(
            //     cat.id_tipo_categoria
            // );
            // showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            init();
        }
    };
    const handleCategoryDelete = async (cat: Library) => {
        try {
            // const response = await catService.deleteCategory(
            //     cat.id_categoria,
            //     cat.id_tipo_categoria
            // );
            // showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            // getCategoryFromSelectedCatType(
            //     selectedCategoryType.id_tipo_categoria
            // );
        }
    };
    const onHide = () => {
        setIsDialogVisible(false);
        // setCurrentCatType(newCategoryType);
    };
    const onCatHide = () => {
        setIsCatDialogVisible(false);
        // setCurrentCategory(newCategory);
    };
    const DialogFooter = (
        <>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={onHide}
                text
                className="p-button-text p-button-danger"
            ></Button>
            <Button
                // label={
                //     currentCatType.id_tipo_categoria === clearNumber
                //         ? "Criar"
                //         : "Editar"
                // }
                icon="pi pi-check"
                form="form"
                type="submit"
                // disabled={!currentCatType.codigo_tipo_categoria}
                className="p-button-text"
            ></Button>
        </>
    );
    const catDialogFooter = (
        <>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={onCatHide}
                text
                className="p-button-text p-button-danger"
            ></Button>
            <Button
                // label={
                //     currentCategory.id_categoria === clearNumber
                //         ? "Criar"
                //         : "Editar"
                // }
                icon="pi pi-check"
                form="Catform"
                type="submit"
                className="p-button-text"
            ></Button>
        </>
    );

    const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            let response;
            // if (currentCatType.id_tipo_categoria === clearNumber) {
            //     response = await service.createCategoryType(currentCatType);
            // } else {
            //     response = await service.updateCategoryType(currentCatType);
            // }
            // showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            onHide();
            init();
        }
    };
    const onCatFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            let response;
            // let updateCategory = {
            //     ...currentCategory,
            //     id_tipo_categoria: selectedCategoryType.id_tipo_categoria,
            // };
            // if (currentCategory.id_categoria === clearNumber) {
            //     response = await catService.createCategory(updateCategory);
            // } else {
            //     response = await catService.updateCategory(updateCategory);
            // }
            // showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            onCatHide();
            // getCategoryFromSelectedCatType(
            //     selectedCategoryType.id_tipo_categoria
            // );
        }
    };
    const onSelectionChange = async (
        e: DataTableSelectionSingleChangeEvent<Library[]>
    ) => {
        try {
            if (!e.value) {
                // setSelectedCategoryType(newCategory);
                return;
            }
            // setIsLoading({ ...isLoading, temp_etapas_table: true });
            // setSelectedCategoryType(e.value as Library);
            // await getCategoryFromSelectedCatType(e.value.id_tipo_categoria);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            // setIsLoading({ ...isLoading, temp_etapas_table: false });
        }
    };

    const getCategoryFromSelectedCatType = async (
        id_tipo_categoria: number
    ) => {
        try {
            const response = await catService.getCategory(
                undefined,
                id_tipo_categoria
            );
            // setCategory(response.data_return);
        } catch (error) {}
    };
    return (
        <>
            <DataTable
                value={libraries}
                header={tableHeader}
                showGridlines
                stripedRows
                filters={filters}
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginator
                removableSort
                emptyMessage={C.MSG_NENHUM_RESULTADO_ENCONTRADO}
            >
                <Column
                    sortable
                    header="ID tipo categoria"
                    field="id_tipo_categoria"
                    align="center"
                    filter
                    filterField="id_tipo_categoria"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                libraries
                                    .map((element: Library) => element.id)
                                    .sort()
                            )
                        )
                    }
                />
                <Column
                    align="center"
                    filter
                    filterField="nome"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                libraries
                                    .map((element: Library) => element.nome)
                                    .sort()
                            )
                        )
                    }
                    sortable
                    header="Cód. Tipo categoria"
                    field="nome"
                />
                <Column
                    align="center"
                    filter
                    filterField="descricao"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                libraries
                                    .map(
                                        (element: Library) => element.descricao
                                    )
                                    .sort()
                            )
                        )
                    }
                    sortable
                    header="Dsc. Tipo categoria"
                    field="descricao"
                />
                <Column
                    align="center"
                    alignHeader="center"
                    sortable
                    header="Opções"
                    body={optionsBodyTemplate}
                />
            </DataTable>
            <Dialog
                visible={isDialogVisible}
                // header={
                //     currentCatType.id_tipo_categoria === clearNumber
                //         ? "Adicionar"
                //         : "Editar"
                // }
                onHide={onHide}
                modal
                footer={DialogFooter}
                breakpoints={{ "960px": "50vw", "641px": "100vw" }}
                style={{ width: "30vw" }}
            >
                <form id="form" onSubmit={onFormSubmit}>
                    <div className="p-fluid">
                        <div className="field col-12 md:col-12">
                            <label htmlFor="codigo_tipo_categoria">
                                Código do tipo de Categoria
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            {/* <InputText
                                value={currentCatType.codigo_tipo_categoria}
                                onChange={(e) => {
                                    setCurrentCatType({
                                        ...currentCatType,
                                        codigo_tipo_categoria: e.target.value,
                                    });
                                }}
                            ></InputText> */}
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="nome_aluno">
                                Dsc. Tipo de Categoria
                                {/* <span style={{ color: "red" }}> *</span> */}
                            </label>
                            {/* <InputText
                                value={currentCatType.dsc_tipo_categoria}
                                onChange={(e) => {
                                    setCurrentCatType({
                                        ...currentCatType,
                                        dsc_tipo_categoria: e.target.value,
                                    });
                                }}
                            ></InputText> */}
                        </div>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
