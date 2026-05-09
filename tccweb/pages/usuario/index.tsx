import { Toast } from "primereact/toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Service from "../../services/usuario_service";
import { newUsers, Users } from "../../models/usuario_model";
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
    verifiedBodyTemplate,
    verifiedFilterTemplate,
} from "../../components/Templates/templates";
import { Dialog } from "primereact/dialog";
import { clearNumber } from "../../utils/configs";
import { InputTextarea } from "primereact/inputtextarea";
import { FilterMatchMode } from "primereact/api";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import { options } from "../../utils/utils";

interface UserProps {
    loading(b: boolean): void;
    toast: React.RefObject<Toast>;
}

const initfilter = {
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.IN },
    ch_rede: { value: null, matchMode: FilterMatchMode.IN },
    email: { value: null, matchMode: FilterMatchMode.IN },
    matricula: { value: null, matchMode: FilterMatchMode.IN },
    codigo: { value: null, matchMode: FilterMatchMode.IN },
    ativo: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
    },
};

export default function UserScreen({ loading, toast }: UserProps) {
    const [users, setUsers] = useState<Users[]>([]);
    const [currentUser, setCurrentUser] = useState<Users>(newUsers);
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        ...initfilter,
    });
    const service = new Service();

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        try {
            loading(true);
            const response = await service.getUser();
            const formattedUsers = response.data_return.map((data: Users) => ({
                ...data,
                ativo: data.ativo === "S",
            }));
            setUsers(formattedUsers);
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

    const AddUser = () => {
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
                    onClick={AddUser}
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

    const optionsBodyTemplate = (data: Users) => {
        const onEdit = async () => {
            try {
                setCurrentUser(data);
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
                <span className="text-lg font-medium">
                    Você irá remover o seguinte usuário:
                </span>
                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-user text-primary" />
                        <span className="font-medium">Nome:</span>
                        <b className="text-lg">{data.nome}</b>
                    </span>
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-tag text-primary" />
                        <span className="font-medium">Chave de rede:</span>
                        <b className="text-lg">{data.ch_rede}</b>
                    </span>
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-envelope text-primary" />
                        <span className="font-medium">E-mail:</span>
                        <b className="text-lg">{data.email}</b>
                    </span>
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-id-card text-primary" />
                        <span className="font-medium">Matrícula:</span>
                        <b className="text-lg">{data.matricula}</b>
                    </span>
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-check-circle text-primary" />
                        <span className="font-medium">Ativo:</span>
                        <b className="text-lg">
                            {verifiedBodyTemplate(data, "ativo")}
                        </b>
                    </span>
                </div>
            </>
        );
        return crudBodyTemplate(data, true, onEdit, onDelete, msgDelete);
    };

    const handleDelete = async (user: Users) => {
        try {
            const response = await service.deleteUser(user.id);
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            init();
        }
    };

    const onHide = () => {
        setIsDialogVisible(false);
        setCurrentUser(newUsers);
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
                label={currentUser.id === clearNumber ? "Criar" : "Editar"}
                icon="pi pi-check"
                form="form"
                type="submit"
                disabled={
                    !(
                        currentUser.ch_rede &&
                        currentUser.nome &&
                        currentUser.email &&
                        currentUser.matricula &&
                        currentUser.tipo_usuario_id
                    )
                }
                className="p-button-text"
            ></Button>
        </>
    );

    const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            let response;
            const userToSubmit: Users = {
                ...(currentUser as Users),
                ativo: currentUser.ativo ? "S" : "N",
            };
            if (currentUser.id === clearNumber) {
                response = await service.createUser(userToSubmit);
            } else {
                response = await service.updateUser(userToSubmit);
            }
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            onHide();
            init();
        }
    };

    return (
        <>
            <DataTable
                value={users}
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
                    header="Chave de rede"
                    field="ch_rede"
                    align="center"
                    filter
                    filterField="ch_rede"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                users
                                    .map((element: Users) => element.ch_rede)
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
                                users
                                    .map((element: Users) => element.nome)
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
                    filterField="email"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                users
                                    .map((element: Users) => element.email)
                                    .sort()
                            )
                        )
                    }
                    sortable
                    header="E-mail"
                    field="email"
                />
                <Column
                    align="center"
                    filter
                    filterField="matricula"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                users
                                    .map((element: Users) => element.matricula)
                                    .sort()
                            )
                        )
                    }
                    sortable
                    header="Matrícula"
                    field="matricula"
                />
                <Column
                    align="center"
                    filter
                    filterField="codigo"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                users
                                    .map((element: Users) => element.codigo)
                                    .sort()
                            )
                        )
                    }
                    sortable
                    header="Código"
                    field="codigo"
                />
                <Column
                    sortable
                    align="center"
                    alignHeader="center"
                    header="Ativo"
                    field="ativo"
                    filter
                    filterField="ativo"
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={verifiedFilterTemplate}
                    showFilterMenuOptions={false}
                    body={(rowData: Users) =>
                        verifiedBodyTemplate(rowData, "ativo")
                    }
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
                header={currentUser.id === clearNumber ? "Adicionar" : "Editar"}
                onHide={onHide}
                modal
                footer={DialogFooter}
                breakpoints={{ "960px": "50vw", "641px": "100vw" }}
                style={{ width: "30vw" }}
            >
                <form id="form" onSubmit={onFormSubmit}>
                    <div className="grid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="nome">
                                Nome
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                id="nome"
                                value={currentUser.nome}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        nome: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="ch_rede">
                                Chave de rede
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                id="ch_rede"
                                value={currentUser.ch_rede}
                                maxLength={4}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        ch_rede: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="email">
                                E-mail
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                id="email"
                                value={currentUser.email}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        email: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="matricula">
                                Matrícula
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                id="matricula"
                                value={currentUser.matricula}
                                keyfilter="int"
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        matricula: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="codigo">Código</label>
                            <InputText
                                id="codigo"
                                value={currentUser.codigo}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        codigo: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="tipo_usuario_id">
                                Tipo de Usuário
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                id="tipo_usuario_id"
                                type="number"
                                value={currentUser.tipo_usuario_id.toString()}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        tipo_usuario_id:
                                            parseInt(e.target.value) ||
                                            clearNumber,
                                    });
                                }}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="descricao">Descrição</label>
                            <InputTextarea
                                id="descricao"
                                value={currentUser.descricao}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        descricao: e.target.value,
                                    });
                                }}
                                rows={3}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="ativo">
                                Ativo
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <SelectButton
                                id="ativo"
                                value={currentUser.ativo}
                                onChange={(e: SelectButtonChangeEvent) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        ativo: e.value as boolean,
                                    });
                                }}
                                options={options}
                            />
                        </div>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
