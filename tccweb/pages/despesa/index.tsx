import { Toast } from "primereact/toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Service from "../../services/despesa_service";
import CategoryService from "../../services/categoria_service";
import PaymentMethodService from "../../services/meio_pagamento_service";
import {
    DataTable,
    DataTableExpandedRows,
    DataTableFilterMeta,
    DataTableFilterMetaData,
    DataTableRowToggleEvent,
} from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import {
    convertColumnToDate,
    formatViewDate,
    getUniqueValues,
    showMessageError,
    showMessageResponse,
    options,
    formatCurrency,
    sum,
} from "../../utils/utils";
import C from "../../utils/constants";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import {
    crudBodyTemplate,
    currencyBodyTemplate,
    dateBodyTemplate,
    dateFilterTemplate,
    uniqueFilterTemplate,
    valorFilterTemplate,
    verifiedBodyTemplate,
    verifiedFilterTemplate,
} from "../../components/Templates/templates";
import { Dialog } from "primereact/dialog";
import { clearNumber } from "../../utils/configs";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import {
    newDespesas,
    DespesasParametros,
    Despesas,
    TipoFiltroData,
} from "../../models/despesa_model";
import { useSession } from "next-auth/react";
import { Panel } from "primereact/panel";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { createReceitaParametros } from "../../models/receitaParametros.factory";
import { Category } from "../../models/biblioteca";
import {
    InputNumber,
    InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import useWindowSize from "../../hooks/useWindow";
import { MeioPagamento } from "../../models/meio_pagamento_models";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

interface UserProps {
    loading(b: boolean): void;
    toast: React.RefObject<Toast>;
}

const initfilter = {
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.IN },
    ch_rede: { value: null, matchMode: FilterMatchMode.IN },
    despesa_recorrente_booleano: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
    },
    pago_booleano: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
    },
    parcelado_booleano: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
    },
    dsc_despesa: { value: null, matchMode: FilterMatchMode.IN },
    valor_total: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    dsc_categoria: { value: null, matchMode: FilterMatchMode.IN },
    data_despesa: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
    data_meio_pagamento: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
};
export default function UserScreen({ loading, toast }: UserProps) {
    const [expenses, setExpenses] = useState<Despesas[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<MeioPagamento[]>([]);
    const [currentExpense, setCurrentExpense] = useState<Despesas>(newDespesas);
    const [parameters, setParameters] = useState<DespesasParametros>(
        createReceitaParametros
    );
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        ...initfilter,
    });
    const [hasInitialized, setHasInitialized] = useState(false);
    const [filteredExpenses, setFilteredExpenses] = useState<Despesas[]>([]);
    const size = useWindowSize();
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    const DateTypeFilterOptions: { label: string; value: TipoFiltroData }[] = [
        { label: "Dia", value: "DIA" },
        { label: "Mês", value: "MES" },
        { label: "Ano", value: "ANO" },
    ];
    const [groupMode, setGroupMode] = useState(false);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>();
    const [groupedExpenses, setGroupedExpenses] = useState<any[]>([]);

    const service = new Service();
    const categoryService = new CategoryService();
    const payMethodService = new PaymentMethodService();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (session && !hasInitialized) {
            fetchExpenseSearch();
            setHasInitialized(true);
        }
    }, [status, session]);

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
    const AddExpense = async () => {
        const response = await categoryService.getCategory(undefined, 3);
        const method = await payMethodService.getPaymentMethod();
        setPaymentMethod(method.data_return);
        setCategories(response.data_return);
        setIsDialogVisible(true);
    };

    const showGroupByCategory = () => {
        if (!groupMode) {
            const grouped = showGroupByCategoryData();
            setGroupedExpenses(grouped);
        }
        setGroupMode((prev) => !prev);
    };

    const showGroupByCategoryData = () => {
        let groupedData = getUniqueValues(
            expenses.map((data) =>
                JSON.stringify({
                    id_categoria: data.id_categoria,
                    dsc_categoria: data.dsc_categoria,
                })
            )
        );

        return groupedData.map((group) => {
            const transf = JSON.parse(group);

            const despesas = expenses.filter(
                (mod) =>
                    mod.dsc_categoria === transf.dsc_categoria &&
                    mod.id_categoria === transf.id_categoria
            );

            return {
                ...transf,
                despesas,
                total: despesas.reduce(
                    (s, r) => s + (r.valor_total as number),
                    0
                ),
            };
        });
    };

    const tableHeader = (
        <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:justify-content-between">
            <div className="p-inputgroup w-full md:w-1">
                <Button
                    className="mr-0 md:mr-2 sm: w-full"
                    outlined
                    label="Adicionar"
                    icon="pi pi-plus"
                    onClick={AddExpense}
                />
            </div>
            <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:align-items-center">
                <SelectButton
                    value={viewMode}
                    onChange={(e) => setViewMode(e.value)}
                    options={[
                        {
                            label: "Tabela",
                            value: "table",
                            icon: "pi pi-table",
                        },
                        {
                            label: "Cards",
                            value: "card",
                            icon: "pi pi-th-large",
                        },
                    ]}
                    className="mr-0 md:mr-2"
                />
                <Button
                    className="mr-0 md:mr-2 text-indigo-400"
                    outlined
                    label={"Agrupar por Categoria"}
                    icon="pi pi-arrow-up-right-and-arrow-down-left-from-center"
                    onClick={showGroupByCategory}
                />

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
    const CardView = () => {
        const displayExpenses = groupMode ? groupedExpenses : expenses;

        return (
            <div className="grid">
                {displayExpenses.map((expense: Despesas) => (
                    <div
                        key={expense.id_despesa}
                        className="col-12 md:col-6 lg:col-4"
                    >
                        <Card className="shadow-2">
                            <div className="flex justify-content-between align-items-start mb-3">
                                <div>
                                    <Tag
                                        value={expense.dsc_categoria}
                                        severity="info"
                                        className="mb-2"
                                    />
                                    <h3 className="mt-0 mb-2">
                                        {expense.dsc_despesa}
                                    </h3>
                                </div>
                                <Dropdown
                                    options={[
                                        {
                                            label: "Editar",
                                            icon: "pi pi-pencil",
                                        },
                                        {
                                            label: "Excluir",
                                            icon: "pi pi-trash",
                                        },
                                    ]}
                                    placeholder="..."
                                />
                            </div>

                            <div className="grid">
                                <div className="col-6">
                                    <small className="text-500">Data</small>
                                    <p className="mt-1 mb-0 font-semibold">
                                        {dateBodyTemplate(
                                            expense,
                                            "data_despesa"
                                        )}
                                    </p>
                                </div>
                                <div className="col-6">
                                    <small className="text-500">
                                        Pagamento
                                    </small>
                                    <p className="mt-1 mb-0 font-semibold">
                                        {expense.dsc_meio_pagamento}
                                    </p>
                                </div>
                                <div className="col-6 mt-2">
                                    <small className="text-500">Status</small>
                                    <div className="mt-1">
                                        {verifiedBodyTemplate(
                                            expense,
                                            "pago_booleano"
                                        )}
                                    </div>
                                </div>
                                <div className="col-6 mt-2">
                                    <small className="text-500">Valor</small>
                                    <p className="mt-1 mb-0 font-semibold text-xl">
                                        {currencyBodyTemplate(
                                            expense,
                                            "valor_total",
                                            "BRL",
                                            true,
                                            "despesa"
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                {expense.despesa_recorrente_booleano && (
                                    <Tag
                                        icon="pi pi-refresh"
                                        severity="warning"
                                        value="Recorrente"
                                    />
                                )}
                                {expense.parcelado_booleano && (
                                    <Tag
                                        icon="pi pi-credit-card"
                                        severity="info"
                                        value="Parcelado"
                                    />
                                )}
                            </div>

                            {groupMode && expense.despesas && (
                                <Button
                                    label={`Ver ${expense.despesas.length} itens`}
                                    icon="pi pi-angle-down"
                                    className="w-full mt-3"
                                    outlined
                                    onClick={() => {
                                        /* expandir */
                                    }}
                                />
                            )}
                        </Card>
                    </div>
                ))}
            </div>
        );
    };
    const optionsBodyTemplate = (data: Despesas) => {
        const onEdit = async () => {
            try {
                const response = await categoryService.getCategory(
                    undefined,
                    3
                );
                const method = await payMethodService.getPaymentMethod();
                setPaymentMethod(method.data_return);
                setCategories(response.data_return);
                setCurrentExpense(data);
                console.log("data: ", data);
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
                    Você irá remover a seguinte despesa:
                </span>

                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-tag text-primary" />
                        <span className="font-medium">Tipo da Despesa:</span>
                        <b className="text-lg">{data.dsc_categoria}</b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-file-edit text-primary" />
                        <span className="font-medium">Descrição:</span>
                        <b className="text-lg">{data.dsc_despesa}</b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-dollar text-primary" />
                        <span className="font-medium">Valor Total:</span>
                        <b className="text-lg">
                            {currencyBodyTemplate(
                                data,
                                "valor_total",
                                "BRL",
                                false
                            )}
                        </b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-calendar text-primary" />
                        <span className="font-medium">Data:</span>
                        <b className="text-lg">
                            {dateBodyTemplate(data, "data_despesa")}
                        </b>
                    </span>
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-credit-card text-primary" />
                        <span className="font-medium">Rede/Meio:</span>
                        <b className="text-lg">{data.dsc_meio_pagamento}</b>
                    </span>
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-refresh text-primary" />
                        <span className="font-medium">Recorrente:</span>
                        <b className="text-lg">
                            {verifiedBodyTemplate(
                                data,
                                "despesa_recorrente_booleano"
                            )}
                        </b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-shopping-cart text-primary" />
                        <span className="font-medium">Parcelada:</span>
                        <b className="text-lg">
                            {verifiedBodyTemplate(data, "parcelado_booleano")}
                        </b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-check-circle text-primary" />
                        <span className="font-medium">Pago:</span>
                        <b className="text-lg">
                            {verifiedBodyTemplate(data, "pago_booleano")}
                        </b>
                    </span>
                </div>
            </>
        );

        return crudBodyTemplate(data, false, onEdit, onDelete, msgDelete);
    };

    const handleDelete = async (user: Despesas) => {
        try {
            const response = await service.deleteExpense(
                user.ch_rede,
                user.id_despesa
            );
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            fetchExpenseSearch();
        }
    };
    const onHide = () => {
        setIsDialogVisible(false);
        setCurrentExpense(newDespesas);
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
                    currentExpense.id_despesa === clearNumber
                        ? "Criar"
                        : "Editar"
                }
                icon="pi pi-check"
                form="form"
                type="submit"
                disabled={
                    !(
                        currentExpense.id_categoria &&
                        currentExpense.dsc_despesa &&
                        currentExpense.valor_total &&
                        currentExpense.data_despesa &&
                        currentExpense.despesa_recorrente
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
            const updateExpense = {
                ...currentExpense,
                ch_rede: session?.user.ch_rede as string,
                nome: session?.user.nome as string,
                dsc_categoria: categories.find(
                    (inc) => inc.id_categoria === currentExpense.id_categoria
                )?.dsc_categoria as string,
            };
            if (currentExpense.id_despesa === clearNumber) {
                response = await service.createExpense(updateExpense);
            } else {
                response = await service.updateExpense(updateExpense);
            }
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            onHide();
            fetchExpenseSearch();
        }
    };

    const onSearchSubmit = async (event: FormEvent) => {
        try {
            event.preventDefault();
            fetchExpenseSearch();
        } catch (error) {
            showMessageError(error, toast);
        }
    };

    const fetchExpenseSearch = async () => {
        try {
            loading(true);
            const updateSearch: DespesasParametros = {
                tipoFiltro: parameters.tipoFiltro,
                dataDia: formatViewDate(parameters.dataDia as Date),
                mesInicial: formatViewDate(parameters.mesInicial as Date),
                mesFinal: formatViewDate(parameters.mesFinal as Date),
                ano: formatViewDate(parameters.ano as Date),
                ch_rede: session?.user.ch_rede as string,
            };
            const response = await service.getExpenses(updateSearch);
            const _response = convertColumnToDate(response.data_return, [
                "data_despesa",
            ]) as Despesas[];

            const formatIncome = _response.map((inc) => ({
                ...inc,
                despesa_recorrente_booleano: inc.despesa_recorrente === "S",
                pago_booleano: inc.pago === "S",
                parcelado_booleano: inc.parcelada === "S",
            }));
            setExpenses(formatIncome);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            loading(false);
        }
    };

    const dataForTotal =
        filteredExpenses.length > 0 ? filteredExpenses : expenses;

    const footerTabela = (data?: Despesas) => (
        <ColumnGroup>
            <Row>
                <Column
                    footer="Total R$:"
                    footerStyle={{
                        textAlign: "right",
                    }}
                    colSpan={!groupMode ? 7 : 4}
                />
                <Column
                    footer={formatCurrency(
                        sum(
                            !groupMode
                                ? dataForTotal
                                : (data?.despesas as Despesas[]),
                            "valor_total"
                        ),
                        "BRL"
                    )}
                    footerStyle={{
                        textAlign: "right",
                    }}
                />
                {!groupMode && <Column />}
            </Row>
        </ColumnGroup>
    );

    const rowExpansionTemplate = (data: Despesas) => {
        return (
            <div className="p-3 surface-100 border-round">
                <DataTable
                    value={data.despesas}
                    stripedRows
                    showGridlines
                    removableSort
                    rowsPerPageOptions={[5, 10, 15]}
                    paginator
                    rows={5}
                    footerColumnGroup={groupMode && footerTabela(data)}
                >
                    <Column
                        field="dsc_despesa"
                        header="Descrição"
                        align="center"
                    />
                    <Column
                        field="ch_rede"
                        header="Rede/Origem"
                        align="center"
                    />
                    <Column
                        field="data_despesa"
                        header="Data"
                        align="center"
                        body={(rowData) =>
                            dateBodyTemplate(rowData, "data_despesa")
                        }
                    />
                    <Column
                        field="despesa_recorrente_booleano"
                        header="Recorrente"
                        align="center"
                        body={(rowData) =>
                            verifiedBodyTemplate(
                                rowData,
                                "despesa_recorrente_booleano"
                            )
                        }
                    />
                    <Column
                        field="valor_total"
                        header="valor_total"
                        align="center"
                        body={(rowData) =>
                            currencyBodyTemplate(
                                rowData,
                                "valor_total",
                                "BRL",
                                true,
                                "despesa"
                            )
                        }
                    />
                </DataTable>
            </div>
        );
    };
    return (
        <>
            <div className="grid p-fluid">
                <Panel
                    toggleable
                    className="col"
                    header={
                        <div className="flex align-items-center">
                            Filtros de datas
                        </div>
                    }
                >
                    <form
                        className="grid"
                        id="searchForm"
                        onSubmit={onSearchSubmit}
                    >
                        <div className="field col-12 md:col-2">
                            <label htmlFor="nome_aluno">
                                Filtrar por período
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Dropdown
                                value={parameters.tipoFiltro}
                                style={{ lineHeight: "1.23" }}
                                onChange={(e) =>
                                    setParameters({
                                        ...parameters,
                                        tipoFiltro: e.value,
                                    })
                                }
                                options={DateTypeFilterOptions}
                                placeholder="Selecione o tipo de filtro"
                                showClear
                                filter
                            />
                        </div>
                        <Divider
                            layout={
                                size?.width &&
                                size?.width <= 720 &&
                                size?.width >= 300
                                    ? "horizontal"
                                    : "vertical"
                            }
                        ></Divider>
                        {parameters.tipoFiltro === "DIA" && (
                            <div className="field col-12 md:col-2">
                                <label>Dia</label>
                                <Calendar
                                    value={parameters.dataDia as Date}
                                    onChange={(e) =>
                                        setParameters((prev) => ({
                                            ...prev,
                                            dataDia: e.value,
                                        }))
                                    }
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                />
                            </div>
                        )}

                        {parameters.tipoFiltro === "MES" && (
                            <>
                                <div className="field col-12 md:col-2">
                                    <label>Mês Inicial</label>
                                    <Calendar
                                        value={parameters.mesInicial as Date}
                                        onChange={(e) =>
                                            setParameters((prev) => ({
                                                ...prev,
                                                mesInicial: e.value,
                                            }))
                                        }
                                        view="month"
                                        dateFormat="mm/yy"
                                        showIcon
                                    />
                                </div>
                                <div className="field col-12 md:col-2">
                                    <label>Mês Final</label>
                                    <Calendar
                                        value={parameters.mesFinal as Date}
                                        onChange={(e) =>
                                            setParameters((prev) => ({
                                                ...prev,
                                                mesFinal: e.value,
                                            }))
                                        }
                                        view="month"
                                        dateFormat="mm/yy"
                                        showIcon
                                    />
                                </div>
                            </>
                        )}

                        {parameters.tipoFiltro === "ANO" && (
                            <div className="field col-12 md:col-2">
                                <label>Ano</label>
                                <Calendar
                                    value={parameters.ano as Date}
                                    onChange={(e) =>
                                        setParameters((prev) => ({
                                            ...prev,
                                            ano: e.value,
                                        }))
                                    }
                                    view="year"
                                    dateFormat="yy"
                                    showIcon
                                />
                            </div>
                        )}
                        <div className="field col-12 md:col-2 md:mt-4 md:ml-6">
                            <Button
                                label="Buscar"
                                outlined
                                type="submit"
                                icon="pi pi-search"
                            />
                        </div>
                    </form>
                </Panel>
            </div>
            {viewMode === "card" ? (
                <CardView />
            ) : (
                <DataTable
                    value={groupMode ? groupedExpenses : expenses}
                    header={tableHeader}
                    showGridlines
                    stripedRows
                    filters={filters}
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginator
                    removableSort
                    onValueChange={(e) => setFilteredExpenses(e)}
                    footerColumnGroup={!groupMode && footerTabela()}
                    rowExpansionTemplate={rowExpansionTemplate}
                    onRowToggle={(e: DataTableRowToggleEvent) => {
                        setExpandedRows(e.data as DataTableExpandedRows);
                    }}
                    expandedRows={expandedRows}
                    emptyMessage={C.MSG_NENHUM_RESULTADO_ENCONTRADO}
                >
                    {groupMode && <Column expander style={{ width: "3rem" }} />}

                    <Column
                        sortable
                        header="Categoria"
                        field="dsc_categoria"
                        align="center"
                        filter
                        filterField="dsc_categoria"
                        showFilterMenuOptions={false}
                        filterMenuStyle={{ width: "16rem" }}
                        filterElement={(
                            options: ColumnFilterElementTemplateOptions
                        ) =>
                            uniqueFilterTemplate(
                                options,
                                getUniqueValues(
                                    expenses
                                        .map(
                                            (element: Despesas) =>
                                                element.dsc_categoria
                                        )
                                        .sort()
                                )
                            )
                        }
                    />
                    <Column
                        sortable
                        header="Dsc. Despesa"
                        field="dsc_despesa"
                        align="center"
                        filter
                        filterField="dsc_despesa"
                        showFilterMenuOptions={false}
                        filterMenuStyle={{ width: "16rem" }}
                        hidden={groupMode}
                        filterElement={(
                            options: ColumnFilterElementTemplateOptions
                        ) =>
                            uniqueFilterTemplate(
                                options,
                                getUniqueValues(
                                    expenses
                                        .map(
                                            (element: Despesas) =>
                                                element.dsc_despesa
                                        )
                                        .sort()
                                )
                            )
                        }
                    />

                    <Column
                        align="center"
                        alignHeader="center"
                        field="data_despesa"
                        header="Data Despesa"
                        filter
                        dataType="date"
                        hidden={groupMode}
                        body={(rowData) =>
                            dateBodyTemplate(rowData, "data_despesa")
                        }
                        filterElement={dateFilterTemplate}
                    />
                    <Column
                        sortable
                        align="center"
                        alignHeader="center"
                        header="Recorrente"
                        field="despesa_recorrente_booleano"
                        filter
                        filterField="despesa_recorrente_booleano"
                        filterMenuStyle={{ width: "16rem" }}
                        hidden={groupMode}
                        filterElement={verifiedFilterTemplate}
                        showFilterMenuOptions={false}
                        body={(boleto: Despesas) =>
                            verifiedBodyTemplate(
                                boleto,
                                "despesa_recorrente_booleano"
                            )
                        }
                    />
                    <Column
                        sortable
                        align="center"
                        alignHeader="center"
                        header="Parcelado"
                        field="parcelado_booleano"
                        filter
                        filterField="parcelado_booleano"
                        filterMenuStyle={{ width: "16rem" }}
                        hidden={groupMode}
                        filterElement={verifiedFilterTemplate}
                        showFilterMenuOptions={false}
                        body={(boleto: Despesas) =>
                            verifiedBodyTemplate(boleto, "parcelado_booleano")
                        }
                    />
                    <Column
                        sortable
                        header="Forma Pagamento"
                        field="dsc_meio_pagamento"
                        align="center"
                        filter
                        filterField="dsc_meio_pagamento"
                        showFilterMenuOptions={false}
                        filterMenuStyle={{ width: "16rem" }}
                        hidden={groupMode}
                        filterElement={(
                            options: ColumnFilterElementTemplateOptions
                        ) =>
                            uniqueFilterTemplate(
                                options,
                                getUniqueValues(
                                    expenses
                                        .map(
                                            (element: Despesas) =>
                                                element.dsc_meio_pagamento
                                        )
                                        .sort()
                                )
                            )
                        }
                    />
                    <Column
                        sortable
                        align="center"
                        alignHeader="center"
                        header="Pago"
                        field="pago_booleano"
                        filter
                        filterField="pago_booleano"
                        filterMenuStyle={{ width: "16rem" }}
                        hidden={groupMode}
                        filterElement={verifiedFilterTemplate}
                        showFilterMenuOptions={false}
                        body={(boleto: Despesas) =>
                            verifiedBodyTemplate(boleto, "pago_booleano")
                        }
                    />
                    <Column
                        sortable
                        filter
                        dataType="numeric"
                        filterField="valor_total"
                        header="Valor Total"
                        align="center"
                        body={(rowData) =>
                            currencyBodyTemplate(
                                rowData,
                                "valor_total",
                                "BRL",
                                true,
                                "despesa"
                            )
                        }
                        filterElement={valorFilterTemplate}
                    />
                    <Column
                        align="center"
                        alignHeader="center"
                        sortable
                        header="Opções"
                        hidden={groupMode}
                        body={optionsBodyTemplate}
                    />
                </DataTable>
            )}
            <Dialog
                visible={isDialogVisible}
                header={
                    currentExpense.id_despesa === clearNumber
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
                            <label htmlFor="dsc_categoria">
                                Origem
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Dropdown
                                value={currentExpense.id_categoria}
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        id_categoria: e.value,
                                    });
                                }}
                                showClear
                                filter
                                optionValue="id_categoria"
                                optionLabel="dsc_categoria"
                                options={categories}
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="nome">
                                Descrição
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                value={currentExpense.dsc_despesa}
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        dsc_despesa: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="valor_total">
                                Valor
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputNumber
                                value={currentExpense.valor_total}
                                useGrouping={false}
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                mode="currency"
                                locale="pt-BR"
                                currency="BRL"
                                placeholder="Ex: R$ 150,00"
                                showButtons
                                min={0}
                                buttonLayout="horizontal"
                                step={10}
                                onValueChange={(
                                    e: InputNumberValueChangeEvent
                                ) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        valor_total: e.value as number,
                                    });
                                }}
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="data_despesa">
                                Data da Despesa
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Calendar
                                value={currentExpense.data_despesa as Date}
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        data_despesa: e.value as Date,
                                    });
                                }}
                                dateFormat="dd/mm/yy"
                                showIcon
                                maxDate={new Date()}
                                showButtonBar
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="id_meio_pagamento">
                                Forma de Pagamento
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Dropdown
                                value={currentExpense.id_meio_pagamento}
                                filter
                                showClear
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        id_meio_pagamento: e.value,
                                    });
                                }}
                                optionLabel="dsc_meio_pagamento"
                                optionValue="id_meio_pagamento"
                                options={paymentMethod}
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="pago">Pago</label>
                            <SelectButton
                                value={currentExpense.pago}
                                onChange={(e: SelectButtonChangeEvent) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        pago: e.value,
                                    });
                                }}
                                options={options}
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="receita_recorrente">
                                Reccorente
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <SelectButton
                                value={currentExpense.despesa_recorrente}
                                onChange={(e: SelectButtonChangeEvent) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        despesa_recorrente: e.value,
                                    });
                                }}
                                options={options}
                            />
                        </div>

                        <div className="field col-12 md:col-12">
                            <label htmlFor="parcelada">Parcelada</label>
                            <SelectButton
                                value={currentExpense.parcelada}
                                onChange={(e: SelectButtonChangeEvent) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        parcelada: e.value,
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
