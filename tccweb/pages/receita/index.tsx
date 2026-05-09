import { Toast } from "primereact/toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Service from "../../services/receita_service";
import CategoryService from "../../services/categoria_service";
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
    newReceitas,
    ReceitaParametros,
    Receitas,
    TipoFiltroData,
} from "../../models/receita_model";
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

interface UserProps {
    loading(b: boolean): void;
    toast: React.RefObject<Toast>;
}

const initfilter = {
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.IN },
    ch_rede: { value: null, matchMode: FilterMatchMode.IN },
    receita_recorrente_booleano: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
    },
    dsc_receita: { value: null, matchMode: FilterMatchMode.IN },
    valor: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    dsc_categoria: { value: null, matchMode: FilterMatchMode.IN },
    data_recebimento: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
};
export default function UserScreen({ loading, toast }: UserProps) {
    const [incomes, setIncomes] = useState<Receitas[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentIncome, setCurrentIncome] = useState<Receitas>(newReceitas);
    const [parameters, setParameters] = useState<ReceitaParametros>(
        createReceitaParametros
    );
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        ...initfilter,
    });
    const [hasInitialized, setHasInitialized] = useState(false);
    const [filteredIncomes, setFilteredIncomes] = useState<Receitas[]>([]);
    const size = useWindowSize();

    const DateTypeFilterOptions: { label: string; value: TipoFiltroData }[] = [
        { label: "Dia", value: "DIA" },
        { label: "Mês", value: "MES" },
        { label: "Ano", value: "ANO" },
    ];
    const [groupMode, setGroupMode] = useState(false);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>();
    const [groupedIncomes, setGroupedIncomes] = useState<any[]>([]);

    const service = new Service();
    const categoryService = new CategoryService();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (session && !hasInitialized) {
            fetchIncomeSearch();
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
    const AddIncome = async () => {
        const response = await categoryService.getCategory(undefined, 1);
        setCategories(response.data_return);
        setIsDialogVisible(true);
    };

    const showGroupByCategory = () => {
        if (!groupMode) {
            const grouped = showGroupByCategoryData();
            setGroupedIncomes(grouped);
        }
        setGroupMode((prev) => !prev);
    };

    const showGroupByCategoryData = () => {
        let groupedData = getUniqueValues(
            incomes.map((data) =>
                JSON.stringify({
                    id_categoria: data.id_categoria,
                    dsc_categoria: data.dsc_categoria,
                })
            )
        );

        return groupedData.map((group) => {
            const transf = JSON.parse(group);

            const receitas = incomes.filter(
                (mod) =>
                    mod.dsc_categoria === transf.dsc_categoria &&
                    mod.id_categoria === transf.id_categoria
            );

            return {
                ...transf,
                receitas,
                total: receitas.reduce((s, r) => s + (r.valor as number), 0),
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
                    onClick={AddIncome}
                />
            </div>
            <div className="flex flex-column gap-2 md:gap-0 md:flex-row md:align-items-center">
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

    const optionsBodyTemplate = (data: Receitas) => {
        const onEdit = async () => {
            try {
                const response = await categoryService.getCategory(
                    undefined,
                    1
                );
                setCategories(response.data_return);
                setCurrentIncome(data);
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
                    Você irá remover a seguinte receita:
                </span>

                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-user text-primary" />
                        <span className="font-medium">Nome:</span>
                        <b className="text-lg">{data.nome}</b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-tag text-primary" />
                        <span className="font-medium">Tipo da Receita:</span>
                        <b className="text-lg">{data.dsc_categoria}</b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-file-edit text-primary" />
                        <span className="font-medium">Descrição:</span>
                        <b className="text-lg">{data.dsc_receita}</b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-dollar text-primary" />
                        <span className="font-medium">Valor:</span>
                        <b className="text-lg">
                            {currencyBodyTemplate(data, "valor", "BRL", false)}
                        </b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-calendar text-primary" />
                        <span className="font-medium">Data:</span>
                        <b className="text-lg">
                            {dateBodyTemplate(data, "data_recebimento")}
                        </b>
                    </span>

                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-refresh text-primary" />
                        <span className="font-medium">Recorrente:</span>
                        <b className="text-lg">
                            {verifiedBodyTemplate(
                                data,
                                "receita_recorrente_booleano"
                            )}
                        </b>
                    </span>
                </div>
            </>
        );

        return crudBodyTemplate(data, false, onEdit, onDelete, msgDelete);
    };

    const handleDelete = async (user: Receitas) => {
        try {
            const response = await service.deleteIncome(
                user.ch_rede,
                user.id_receita
            );
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            fetchIncomeSearch();
        }
    };
    const onHide = () => {
        setIsDialogVisible(false);
        setCurrentIncome(newReceitas);
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
                    currentIncome.id_receita === clearNumber
                        ? "Criar"
                        : "Editar"
                }
                icon="pi pi-check"
                form="form"
                type="submit"
                disabled={
                    !(
                        currentIncome.id_categoria &&
                        currentIncome.dsc_receita &&
                        currentIncome.valor &&
                        currentIncome.data_recebimento &&
                        currentIncome.receita_recorrente
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
            const updateIncome = {
                ...currentIncome,
                ch_rede: session?.user.ch_rede as string,
                nome: session?.user.nome as string,
                dsc_categoria: categories.find(
                    (inc) => inc.id_categoria === currentIncome.id_categoria
                )?.dsc_categoria as string,
            };
            if (currentIncome.id_receita === clearNumber) {
                response = await service.createIncome(updateIncome);
            } else {
                response = await service.updateIncome(updateIncome);
            }
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            onHide();
            fetchIncomeSearch();
        }
    };

    const onSearchSubmit = async (event: FormEvent) => {
        try {
            event.preventDefault();
            fetchIncomeSearch();
        } catch (error) {
            showMessageError(error, toast);
        }
    };

    const fetchIncomeSearch = async () => {
        try {
            loading(true);
            const updateSearch: ReceitaParametros = {
                tipoFiltro: parameters.tipoFiltro,
                dataDia: formatViewDate(parameters.dataDia as Date),
                mesInicial: formatViewDate(parameters.mesInicial as Date),
                mesFinal: formatViewDate(parameters.mesFinal as Date),
                ano: formatViewDate(parameters.ano as Date),
                ch_rede: session?.user.ch_rede as string,
            };
            const response = await service.getIncomes(updateSearch);
            const _response = convertColumnToDate(response.data_return, [
                "data_recebimento",
            ]) as Receitas[];

            const formatIncome = _response.map((inc) => ({
                ...inc,
                receita_recorrente_booleano: inc.receita_recorrente === "S",
            }));
            setIncomes(formatIncome);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            loading(false);
        }
    };

    const dataForTotal = filteredIncomes.length > 0 ? filteredIncomes : incomes;

    const footerTabela = (data?: Receitas) => (
        <ColumnGroup>
            <Row>
                <Column
                    footer="Total R$:"
                    footerStyle={{
                        textAlign: "right",
                    }}
                    colSpan={!groupMode ? 5 : 4}
                />
                <Column
                    footer={formatCurrency(
                        sum(
                            !groupMode
                                ? dataForTotal
                                : (data?.receitas as Receitas[]),
                            "valor"
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

    const rowExpansionTemplate = (data: Receitas) => {
        return (
            <div className="p-3 surface-100 border-round">
                <DataTable
                    value={data.receitas}
                    stripedRows
                    showGridlines
                    removableSort
                    rowsPerPageOptions={[5, 10, 15]}
                    paginator
                    rows={5}
                    footerColumnGroup={groupMode && footerTabela(data)}
                >
                    <Column
                        field="dsc_receita"
                        header="Descrição"
                        align="center"
                    />
                    <Column
                        field="origem_receita"
                        header="Origem"
                        align="center"
                    />
                    <Column
                        field="data_recebimento"
                        header="Data"
                        align="center"
                        body={(rowData) =>
                            dateBodyTemplate(rowData, "data_recebimento")
                        }
                    />
                    <Column
                        field="receita_recorrente_booleano"
                        header="Recorrente"
                        align="center"
                        body={(rowData) =>
                            verifiedBodyTemplate(
                                rowData,
                                "receita_recorrente_booleano"
                            )
                        }
                    />
                    <Column
                        field="valor"
                        header="Valor"
                        align="center"
                        body={(rowData) =>
                            currencyBodyTemplate(
                                rowData,
                                "valor",
                                "BRL",
                                true,
                                "receita"
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
            <DataTable
                value={groupMode ? groupedIncomes : incomes}
                header={tableHeader}
                showGridlines
                stripedRows
                filters={filters}
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginator
                removableSort
                onValueChange={(e) => setFilteredIncomes(e)}
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
                                incomes
                                    .map(
                                        (element: Receitas) =>
                                            element.dsc_categoria
                                    )
                                    .sort()
                            )
                        )
                    }
                />
                <Column
                    sortable
                    header="Descrição"
                    field="dsc_receita"
                    align="center"
                    filter
                    filterField="dsc_receita"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    hidden={groupMode}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                incomes
                                    .map(
                                        (element: Receitas) =>
                                            element.dsc_receita
                                    )
                                    .sort()
                            )
                        )
                    }
                />

                <Column
                    align="center"
                    alignHeader="center"
                    field="data_recebimento"
                    header="Data Recebimento"
                    filter
                    dataType="date"
                    hidden={groupMode}
                    body={(rowData) =>
                        dateBodyTemplate(rowData, "data_recebimento")
                    }
                    filterElement={dateFilterTemplate}
                />
                <Column
                    sortable
                    align="center"
                    alignHeader="center"
                    header="Receita Recorrente"
                    field="receita_recorrente_booleano"
                    filter
                    filterField="receita_recorrente_booleano"
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={verifiedFilterTemplate}
                    showFilterMenuOptions={false}
                    hidden={groupMode}
                    body={(boleto: Receitas) =>
                        verifiedBodyTemplate(
                            boleto,
                            "receita_recorrente_booleano"
                        )
                    }
                />
                <Column
                    sortable
                    header="Origem"
                    field="origem_receita"
                    align="center"
                    filter
                    filterField="origem_receita"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    hidden={groupMode}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                incomes
                                    .map(
                                        (element: Receitas) =>
                                            element.origem_receita
                                    )
                                    .sort()
                            )
                        )
                    }
                />
                <Column
                    sortable
                    filter
                    dataType="numeric"
                    filterField="valor"
                    header="Valor"
                    align="center"
                    body={(rowData) =>
                        currencyBodyTemplate(
                            rowData,
                            "valor",
                            "BRL",
                            true,
                            "receita"
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
            <Dialog
                visible={isDialogVisible}
                header={
                    currentIncome.id_receita === clearNumber
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
                                value={currentIncome.id_categoria}
                                onChange={(e) => {
                                    setCurrentIncome({
                                        ...currentIncome,
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
                                value={currentIncome.dsc_receita}
                                onChange={(e) => {
                                    setCurrentIncome({
                                        ...currentIncome,
                                        dsc_receita: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="valor">
                                Valor
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputNumber
                                value={currentIncome.valor}
                                useGrouping={false}
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                mode="currency"
                                currency="BRL"
                                locale="pt-BR"
                                placeholder="Ex: R$ 150,90"
                                showButtons
                                min={0}
                                buttonLayout="horizontal"
                                step={10}
                                onValueChange={(
                                    e: InputNumberValueChangeEvent
                                ) => {
                                    setCurrentIncome({
                                        ...currentIncome,
                                        valor: e.value as number,
                                    });
                                }}
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="data_recebimento">
                                Data do Recebimento
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Calendar
                                value={currentIncome.data_recebimento as Date}
                                onChange={(e) => {
                                    setCurrentIncome({
                                        ...currentIncome,
                                        data_recebimento: e.value as Date,
                                    });
                                }}
                                dateFormat="dd/mm/yy"
                                showIcon
                                maxDate={new Date()}
                                showButtonBar
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="receita_recorrente">
                                Reccorente
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <SelectButton
                                value={currentIncome.receita_recorrente}
                                onChange={(e: SelectButtonChangeEvent) => {
                                    setCurrentIncome({
                                        ...currentIncome,
                                        receita_recorrente: e.value,
                                    });
                                }}
                                options={options}
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="origem_receita">
                                Origem/Info. Adicional
                            </label>
                            <InputText
                                value={currentIncome.origem_receita}
                                onChange={(e) => {
                                    setCurrentIncome({
                                        ...currentIncome,
                                        origem_receita: e.target.value,
                                    });
                                }}
                            />
                        </div>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
