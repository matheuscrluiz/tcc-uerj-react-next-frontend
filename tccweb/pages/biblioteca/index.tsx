import { Toast } from "primereact/toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Service from "../../services/biblioteca";
import {
    DataTable,
    DataTableFilterMeta,
    DataTableFilterMetaData,
} from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import {
    getUniqueValues,
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
import { Library, newLibrary } from "../../models/biblioteca";
import { useSession } from "next-auth/react";

interface LibraryScreenProps {
    loading(b: boolean): void;
    toast: React.RefObject<Toast>;
}

const initfilter = {
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.IN },
    descricao: { value: null, matchMode: FilterMatchMode.IN },
};

export default function LibraryScreen({ loading, toast }: LibraryScreenProps) {
    const [libraries, setLibraries] = useState<Library[]>([]);
    const [currentLibrary, setCurrentLibrary] = useState<Library>(newLibrary);
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        ...initfilter,
    });
    const { data: session } = useSession();

    const service = new Service();

    useEffect(() => {
        fetchLibraries();
    }, []);

    const fetchLibraries = async () => {
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

    const resetFilters = () => {
        (filters.global as DataTableFilterMetaData).value = "";
        setFilters({ ...filters });
        setGlobalFilter("");
    };

    const onAddLibrary = () => {
        setCurrentLibrary(newLibrary);
        setIsDialogVisible(true);
    };

    const tableHeader = (
        <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:justify-content-between">
            <div className="p-inputgroup w-full md:w-1">
                <Button
                    className="mr-0 md:mr-2"
                    outlined
                    label="Adicionar"
                    icon="pi pi-plus"
                    onClick={onAddLibrary}
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

    const optionsBodyTemplate = (data: Library) => {
        const onEdit = () => {
            setCurrentLibrary(data);
            setIsDialogVisible(true);
        };
        const onDelete = () => {
            handleDelete(data);
        };
        const msgDelete = (
            <>
                <span className="text-lg font-medium">
                    Você irá remover a seguinte biblioteca:
                </span>
                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-book text-primary" />
                        <span className="font-medium">Nome:</span>
                        <b className="text-lg">{data.nome}</b>
                    </span>
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-file-edit text-primary" />
                        <span className="font-medium">Descrição:</span>
                        <b className="text-lg">{data.descricao}</b>
                    </span>
                </div>
            </>
        );
        return crudBodyTemplate(data, true, onEdit, onDelete, msgDelete);
    };

    const handleDelete = async (library: Library) => {
        try {
            const response = await service.deleteLibrary(library.id);
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            fetchLibraries();
        }
    };

    const onHide = () => {
        setIsDialogVisible(false);
        setCurrentLibrary(newLibrary);
    };

    const DialogFooter = (
        <>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={onHide}
                text
                className="p-button-text p-button-danger"
            />
            <Button
                label={currentLibrary.id === clearNumber ? "Criar" : "Editar"}
                icon="pi pi-check"
                form="librarForm"
                type="submit"
                disabled={!currentLibrary.nome}
                className="p-button-text"
            />
        </>
    );

    const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            let response;

            if (currentLibrary.id === clearNumber) {
                response = await service.createLibrary({
                    ...currentLibrary,
                    ch_usuario_inclusao: session?.user.ch_rede as string,
                });
            } else {
                response = await service.updateLibrary({
                    ...currentLibrary,
                    ch_usuario_alteracao: session?.user.ch_rede,
                });
            }
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            onHide();
            fetchLibraries();
        }
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
                    header="ID"
                    field="id"
                    align="center"
                    filter
                    filterField="id"
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
                    header="Nome"
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
                    header="Descrição"
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
                header={
                    currentLibrary.id === clearNumber
                        ? "Adicionar Biblioteca"
                        : "Editar Biblioteca"
                }
                onHide={onHide}
                modal
                footer={DialogFooter}
                breakpoints={{ "960px": "50vw", "641px": "100vw" }}
                style={{ width: "30vw" }}
            >
                <form id="librarForm" onSubmit={onFormSubmit}>
                    <div className="p-fluid">
                        <div className="field col-12 md:col-12">
                            <label htmlFor="nome">
                                Nome
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                id="nome"
                                value={currentLibrary.nome}
                                onChange={(e) => {
                                    setCurrentLibrary({
                                        ...currentLibrary,
                                        nome: e.target.value,
                                    });
                                }}
                                placeholder="Digite o nome da biblioteca"
                            />
                        </div>
                        <div className="field col-12 md:col-12 mt-3">
                            <label htmlFor="descricao">Descrição</label>
                            <InputText
                                id="descricao"
                                value={currentLibrary.descricao}
                                onChange={(e) => {
                                    setCurrentLibrary({
                                        ...currentLibrary,
                                        descricao: e.target.value,
                                    });
                                }}
                                placeholder="Digite a descrição da biblioteca"
                            />
                        </div>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
