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
} from "../../components/Templates/templates";
import { Dialog } from "primereact/dialog";
import { clearNumber } from "../../utils/configs";
import { Password } from "primereact/password";
import { FilterMatchMode } from "primereact/api";

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
    cpf: { value: null, matchMode: FilterMatchMode.IN },
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
            setUsers(response.data_return);
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
            <div className="p-inputgroup w-full md:w-1  ">
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
                <span className="text-lg">
                    Você irá remover o seguinte usuário:
                </span>
                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Nome:
                        <b> {data.nome}</b>
                    </span>
                    <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        Chave de rede:
                        <b> {data.ch_rede}</b>
                    </span>
                    <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        E-mail:
                        <b> {data.email}</b>
                    </span>
                    <span>
                        <i className="mr-1 pi pi-exclamation-circle" />
                        CPF:
                        <b> {data.cpf}</b>
                    </span>
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

    const handleDelete = async (user: Users) => {
        try {
            const response = await service.deleteUser(
                user.ch_rede,
                user.id_usuario
            );
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
                label={
                    currentUser.id_usuario === clearNumber ? "Criar" : "Editar"
                }
                icon="pi pi-check"
                form="form"
                type="submit"
                disabled={
                    !(
                        currentUser.ch_rede &&
                        currentUser.nome &&
                        currentUser.email &&
                        currentUser.cpf &&
                        currentUser.matricula &&
                        currentUser.senha
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
            if (currentUser.id_usuario === clearNumber) {
                response = await service.createUser(currentUser);
            } else {
                response = await service.updateUser(currentUser);
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
                    header="Matricula"
                    field="matricula"
                />
                <Column
                    align="center"
                    filter
                    filterField="cpf"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                users
                                    .map((element: Users) => element.cpf)
                                    .sort()
                            )
                        )
                    }
                    sortable
                    header="CPF"
                    field="cpf"
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
                    currentUser.id_usuario === clearNumber
                        ? "Adicionar"
                        : "Editar"
                }
                onHide={onHide}
                modal
                footer={DialogFooter}
                breakpoints={{ "960px": "50vw", "641px": "100vw" }}
                style={{ width: "30vw" }}
            >
                <form id="form" onSubmit={onFormSubmit}>
                    <div className="p-fluid">
                        <div className="field col-12 md:col-12">
                            <label htmlFor="nome_aluno">
                                Nome
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                value={currentUser.nome}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        nome: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="ch_rede">
                                Chave de rede
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                value={currentUser.ch_rede}
                                maxLength={4}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        ch_rede: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="email">
                                E-mail
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                value={currentUser.email}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        email: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="cpf">
                                Cpf
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                value={currentUser.cpf}
                                keyfilter="int"
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        cpf: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="matricula">
                                Matricula
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                value={currentUser.matricula}
                                keyfilter="int"
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        matricula: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        {currentUser.id_usuario === clearNumber && (
                            <div className="field col-12 md:col-12">
                                <label htmlFor="senha">
                                    Senha
                                    <span style={{ color: "red" }}> *</span>
                                </label>
                                <Password
                                    toggleMask
                                    value={currentUser.senha}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        setCurrentUser({
                                            ...currentUser,
                                            senha: e.target.value,
                                        });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </form>
            </Dialog>
        </>
    );
}
