import { Toast } from "primereact/toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Service from "../../services/investimento_service";
import CategoryService from "../../services/categoria_service";
import InjectionService from "../../services/aporte_investimento_service";
import BanksService from "../../services/instituicao_service";
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
import C, { BANK_ICONS } from "../../utils/constants";
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
import {
    Aging,
    Aporte,
    Investimentos,
    newAging,
    newAporte,
    newInvestimentos,
} from "../../models/investimento_model";
import { instituicao } from "../../models/instituicao_models";
import { AutoComplete } from "primereact/autocomplete";
import Image from "next/image";
import AporteInvestimento from "../../components/AporteInvestimento";
import { TabView, TabPanel } from "primereact/tabview";
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
    const [investiments, setInvestiments] = useState<Investimentos[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<MeioPagamento[]>([]);
    const [banks, setBanks] = useState<instituicao[]>([]);
    const [currentExpense, setCurrentExpense] =
        useState<Investimentos>(newInvestimentos);
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        ...initfilter,
    });
    const [hasInitialized, setHasInitialized] = useState(false);
    const [filteredExpenses, setFilteredExpenses] = useState<Investimentos[]>(
        []
    );
    const [dialogAporteVisible, setDialogAporteVisible] = useState(false);
    const [dialogRendimentoVisible, setDialogRendimentoVisible] =
        useState(false);

    const [groupMode, setGroupMode] = useState(false);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>();
    const [selectedAporte, setSelectedAporte] = useState<Aporte>(newAporte);

    const service = new Service();
    const categoryService = new CategoryService();
    const payMethodService = new PaymentMethodService();
    const bankService = new BanksService();
    const injectionService = new InjectionService();
    const { data: session, status } = useSession();
    const [aging, setAging] = useState<Aging>(newAging);
    useEffect(() => {
        if (session && !hasInitialized) {
            init();
            setHasInitialized(true);
        }
    }, [status, session]);

    const init = async () => {
        try {
            loading(true);

            const response = await service.getInvestiment(
                session?.user.ch_rede as string
            );

            const groupedInvest = showGroupedInvestiments(response.data_return);

            const investimentos = convertColumnToDate(groupedInvest, [
                "data_inicio",
                "data_fim",
            ]) as Investimentos[];

            // 🔹 converter datas dos aportes
            const aportes = investimentos.flatMap((inv) => inv.aportes ?? []);
            const aportesConvertidos = convertColumnToDate(aportes, [
                "data_aporte",
            ]);

            // 🔹 converter datas dos rendimentos
            const rendimentos = investimentos.flatMap(
                (inv) => inv.rendimentos ?? []
            );
            const rendimentosConvertidos = convertColumnToDate(rendimentos, [
                "mes_referencia",
            ]);

            const investimentsFinal = investimentos.map((inv) => ({
                ...inv,
                aportes: inv.aportes?.map(
                    (ap) =>
                        aportesConvertidos.find(
                            (c) => c.id_aporte === ap.id_aporte
                        ) ?? ap
                ),
                rendimentos: inv.rendimentos?.map(
                    (r) =>
                        rendimentosConvertidos.find(
                            (c) => c.id_rendimento === r.id_rendimento
                        ) ?? r
                ),
            }));

            const investimentsComTotal = investimentsFinal.map((inv) => {
                const totalAportes =
                    inv.aportes?.reduce(
                        (sum, ap) => sum + (ap.valor_aporte ?? 0),
                        0
                    ) ?? 0;

                return {
                    ...inv,
                    valor_total_investido: inv.valor_inicial + totalAportes,
                };
            });

            setAging(calcAging(investimentsComTotal));
            setInvestiments(investimentsComTotal);
            console.log("investimentsComTotal: ", investimentsComTotal);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            loading(false);
        }
    };

    const calcAging = (arr: Investimentos[]): Aging => {
        const aging: Aging = {
            data_inicial: 0,
            "1_a_5_dias": 0,
            "6_a_30_dias": 0,
            "31_a_90_dias": 0,
            "91_a_180_dias": 0,
            mais_180_dias: 0,
        };

        const hoje = new Date().getTime();

        arr.forEach((inv) => {
            // 🔹 VALOR INICIAL (usa data_inicio)
            if (inv.data_inicio) {
                const diffDays = Math.floor(
                    (hoje - new Date(inv.data_inicio).getTime()) /
                        (1000 * 60 * 60 * 24)
                );

                const valor = inv.valor_inicial;

                addToAging(aging, diffDays, valor);
            }

            // 🔹 APORTES (usa data_aporte)
            inv.aportes?.forEach((ap) => {
                if (!ap.data_aporte) return;

                const diffDays = Math.floor(
                    (hoje - new Date(ap.data_aporte).getTime()) /
                        (1000 * 60 * 60 * 24)
                );

                addToAging(aging, diffDays, ap.valor_aporte ?? 0);
            });
        });

        return aging;
    };
    const addToAging = (aging: Aging, diffDays: number, valor: number) => {
        if (diffDays <= 0) {
            aging.data_inicial += valor;
        } else if (diffDays <= 5) {
            aging["1_a_5_dias"] += valor;
        } else if (diffDays <= 30) {
            aging["6_a_30_dias"] += valor;
        } else if (diffDays <= 90) {
            aging["31_a_90_dias"] += valor;
        } else if (diffDays <= 180) {
            aging["91_a_180_dias"] += valor;
        } else {
            aging.mais_180_dias += valor;
        }
    };

    // const calcAging = (arr: Investimentos[]): Aging => {
    //     const aging: Aging = {
    //         data_inicial: 0,
    //         "1_a_5_dias": 0,
    //         "6_a_30_dias": 0,
    //         "31_a_90_dias": 0,
    //         "91_a_180_dias": 0,
    //         mais_180_dias: 0,
    //     };

    //     const hoje = new Date().getTime();

    //     arr.forEach((inv) => {
    //         if (!inv.data_inicio) return;

    //         const dataInicio = new Date(inv.data_inicio).getTime();

    //         // diferença em dias
    //         const diffDays = Math.floor(
    //             (hoje - dataInicio) / (1000 * 60 * 60 * 24)
    //         );

    //         // valor total do investimento
    //         const totalAportes =
    //             inv.aportes?.reduce(
    //                 (sum, ap) => sum + (ap.valor_aporte ?? 0),
    //                 0
    //             ) ?? 0;

    //         const valorTotal = inv.valor_inicial + totalAportes;

    //         if (diffDays <= 0) {
    //             aging.data_inicial += valorTotal;
    //         } else if (diffDays <= 5) {
    //             aging["1_a_5_dias"] += valorTotal;
    //         } else if (diffDays <= 30) {
    //             aging["6_a_30_dias"] += valorTotal;
    //         } else if (diffDays <= 90) {
    //             aging["31_a_90_dias"] += valorTotal;
    //         } else if (diffDays <= 180) {
    //             aging["91_a_180_dias"] += valorTotal;
    //         } else {
    //             aging.mais_180_dias += valorTotal;
    //         }
    //     });

    //     console.log("aging: ", aging);
    //     return aging;
    // };

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
        const response = await categoryService.getCategory(undefined, 4);
        const method = await payMethodService.getPaymentMethod();
        const banks = await bankService.getBanks();
        setBanks(banks.data_return);
        setPaymentMethod(method.data_return);
        setCategories(response.data_return);
        setIsDialogVisible(true);
    };
    const normalizeBankKey = (name: string) =>
        name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "");

    const getBankIcon = (name: string) => {
        const key = normalizeBankKey(name);

        if (key.includes("itau")) return BANK_ICONS.itau;
        if (key.includes("bradesco")) return BANK_ICONS.bradesco;
        if (key.includes("santander")) return BANK_ICONS.santander;
        if (key.includes("nubank")) return BANK_ICONS.nubank;
        if (key.includes("btg")) return BANK_ICONS.btg;
        if (key.includes("bb")) return BANK_ICONS.bb;
        if (key.includes("caixa")) return BANK_ICONS.caixa;
        if (key.includes("xp")) return BANK_ICONS.xp;

        return "/banks/default.svg";
    };

    const showGroupedInvestiments = (data: Investimentos[]) => {
        const groupedData = getUniqueValues(
            data.map((item) =>
                JSON.stringify({
                    id_investimento: item.id_investimento,
                    id_categoria: item.id_categoria,
                    dsc_categoria: item.dsc_categoria,
                    ch_rede: item.ch_rede,
                    dsc_instituicao: item.dsc_instituicao,
                    id_instituicao: item.id_instituicao,
                    nome_investimento: item.nome_investimento,
                    data_inicio: item.data_inicio,
                    data_fim: item.data_fim,
                })
            )
        );

        return groupedData.map((group) => {
            const transf = JSON.parse(group);

            const registros = data.filter(
                (r) =>
                    r.id_investimento === transf.id_investimento &&
                    r.id_categoria === transf.id_categoria
            );

            const aportes = registros
                .filter((r) => r.id_aporte)
                .map((r) => ({
                    id_aporte: r.id_aporte,
                    valor_aporte: r.valor_aporte,
                    data_aporte: r.data_aporte,
                }));

            const rendimentos = getUniqueValues(
                registros
                    .filter((r) => r.id_rendimento)
                    .map((r) =>
                        JSON.stringify({
                            id_rendimento: r.id_rendimento,
                            valor_rendimento: r.valor_rendimento,
                            mes_referencia: r.mes_referencia,
                        })
                    )
            ).map((r) => JSON.parse(r));

            return {
                ...transf,
                valor_inicial: registros[0]?.valor_inicial ?? 0,

                aportes,
                rendimentos,

                total_aportado: aportes.reduce(
                    (s, a) => s + (a.valor_aporte ?? 0),
                    0
                ),

                total_rendimentos: rendimentos.reduce(
                    (s, r) => s + (r.valor_rendimento ?? 0),
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

    const expansionOptionsBodyTemplate = (data: Investimentos) => {
        const onEdit = async () => {
            setSelectedAporte(data as Aporte);
            setDialogAporteVisible(true);
        };

        const onDelete = async () => {
            try {
                const response =
                    await injectionService.deleteInvestimentInjection(
                        session?.user.ch_rede as string,
                        data.id_aporte
                    );
                showMessageResponse(response, toast);
            } catch (error) {
                showMessageError(error, toast);
            } finally {
                init();
            }
        };

        const msgDelete = (
            <>
                <span className="text-lg font-medium">
                    Você irá remover o seguinte aporte:{" "}
                </span>{" "}
                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-dollar text-primary" />{" "}
                        <span className="font-medium">Valor:</span>{" "}
                        <b className="text-lg">
                            {currencyBodyTemplate(
                                data,
                                "valor_aporte",
                                "BRL",
                                false
                            )}{" "}
                        </b>{" "}
                    </span>{" "}
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-calendar text-primary" />{" "}
                        <span className="font-medium">Data:</span>{" "}
                        <b className="text-lg">
                            {dateBodyTemplate(data, "data_aporte")}{" "}
                        </b>{" "}
                    </span>{" "}
                </div>{" "}
            </>
        );
        return crudBodyTemplate(data, false, onEdit, onDelete, msgDelete);
    };

    const optionsBodyTemplate = (data: Investimentos) => {
        const onAddAporte = () => {
            setCurrentExpense(data);
            setDialogAporteVisible(true);
        };

        const onAddRendimento = () => {
            setCurrentExpense(data);
            setDialogRendimentoVisible(true);
        };

        const onEdit = async () => {
            try {
                const response = await categoryService.getCategory(
                    undefined,
                    4
                );
                const method = await payMethodService.getPaymentMethod();
                const banks = await bankService.getBanks();
                setBanks(banks.data_return);
                setPaymentMethod(method.data_return);
                setCategories(response.data_return);
                setCurrentExpense(data);
                setIsDialogVisible(true);
            } catch (error) {
                showMessageError(error, toast);
            }
        };

        const onDelete = () => handleDelete(data);
        const msgDelete = (
            <>
                <span className="text-lg font-medium">
                    Você irá remover o seguinte investimento:{" "}
                </span>{" "}
                <div className="flex flex-column gap-2 mt-3 p-2 border-400 border-solid border-1 border-round-sm">
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-tag text-primary" />{" "}
                        <span className="font-medium">Categoria:</span>{" "}
                        <b className="text-lg">{data.dsc_categoria}</b>{" "}
                    </span>{" "}
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-file-edit text-primary" />{" "}
                        <span className="font-medium">
                            Nome do Investimento:{" "}
                        </span>{" "}
                        <b className="text-lg">{data.nome_investimento}</b>{" "}
                    </span>{" "}
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-dollar text-primary" />{" "}
                        <span className="font-medium">Valor Inicial:</span>{" "}
                        <b className="text-lg">
                            {currencyBodyTemplate(
                                data,
                                "valor_inicial",
                                "BRL",
                                false
                            )}{" "}
                        </b>{" "}
                    </span>{" "}
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-calendar text-primary" />{" "}
                        <span className="font-medium">Data de Início:</span>{" "}
                        <b className="text-lg">
                            {dateBodyTemplate(data, "data_inicio")}{" "}
                        </b>{" "}
                    </span>{" "}
                    <span className="flex align-items-center gap-2 text-sm text-lg">
                        <i className="pi pi-building text-primary" />{" "}
                        <span className="font-medium">Instituição:</span>{" "}
                        <b className="text-lg">{data.dsc_instituicao}</b>{" "}
                    </span>{" "}
                </div>{" "}
            </>
        );
        return (
            <div className="flex align-items-center justify-content-center">
                <Button
                    icon="pi pi-plus-circle"
                    severity="success"
                    text
                    tooltip="Adicionar Aporte"
                    onClick={onAddAporte}
                />
                <Button
                    icon="pi pi-chart-line"
                    severity="info"
                    text
                    tooltip="Adicionar Rendimento"
                    onClick={onAddRendimento}
                />

                {crudBodyTemplate(data, false, onEdit, onDelete, msgDelete)}
            </div>
        );
    };

    const handleDelete = async (inv: Investimentos) => {
        try {
            const response = await service.deleteInvestiment(
                inv.ch_rede,
                inv.id_investimento
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
        setCurrentExpense(newInvestimentos);
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
                    currentExpense.id_investimento === clearNumber
                        ? "Criar"
                        : "Editar"
                }
                icon="pi pi-check"
                form="form"
                type="submit"
                // disabled={
                //     !(
                //         currentExpense.id_categoria &&
                //         currentExpense.dsc_despesa &&
                //         currentExpense.valor_total &&
                //         currentExpense.data_despesa &&
                //         currentExpense.despesa_recorrente
                //     )
                // }
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
            if (currentExpense.id_investimento === clearNumber) {
                response = await service.createInvestiment(updateExpense);
            } else {
                const _update = {
                    ...updateExpense,
                    data_fim: !currentExpense.data_fim
                        ? ""
                        : currentExpense.data_fim,
                    dsc_instituicao: banks.find(
                        (e) =>
                            currentExpense.id_instituicao === e.id_instituicao
                    )?.dsc_instituicao as string,
                };
                response = await service.updateInvestiment(_update);
            }
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            onHide();
            init();
        }
    };

    const dataForTotal =
        filteredExpenses.length > 0 ? filteredExpenses : investiments;

    const footerTabela = (data?: Investimentos) => (
        <ColumnGroup>
            <Row>
                <Column
                    footer="Total R$:"
                    footerStyle={{
                        textAlign: "right",
                    }}
                    colSpan={!groupMode ? 6 : 3}
                />
                <Column
                    footer={formatCurrency(
                        sum(
                            !groupMode
                                ? dataForTotal
                                : (data?.aportes as Investimentos[]),
                            "valor_inicial"
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

    const rowExpansionTemplate = (data: Investimentos) => {
        return (
            <div className="p-3 surface-100 border-round">
                <TabView>
                    {/* 🔹 ABA APORTES */}
                    <TabPanel
                        header={
                            <span className="flex align-items-center gap-2">
                                <i className="pi pi-plus-circle" />
                                Aportes
                                <Tag
                                    value={data.aportes?.length ?? 0}
                                    severity="info"
                                    rounded
                                />
                            </span>
                        }
                    >
                        <DataTable
                            value={data.aportes}
                            stripedRows
                            showGridlines
                            removableSort
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 15]}
                            emptyMessage="Nenhum aporte encontrado"
                        >
                            <Column
                                field="id_aporte"
                                header="Id"
                                align="center"
                            />

                            <Column
                                align="center"
                                field="data_aporte"
                                sortable
                                header="Data"
                                dataType="date"
                                body={(rowData) =>
                                    dateBodyTemplate(rowData, "data_aporte")
                                }
                            />

                            <Column
                                align="center"
                                field="valor_aporte"
                                sortable
                                header="Valor do Aporte"
                                body={(rowData) =>
                                    currencyBodyTemplate(
                                        rowData,
                                        "valor_aporte",
                                        "BRL"
                                    )
                                }
                            />

                            <Column
                                header="Opções"
                                align="center"
                                body={expansionOptionsBodyTemplate}
                            />
                        </DataTable>
                    </TabPanel>

                    {/* 🔹 ABA RENDIMENTOS */}
                    <TabPanel
                        header={
                            <span className="flex align-items-center gap-2">
                                <i className="pi pi-chart-line" />
                                Rendimentos
                                <Tag
                                    value={data.rendimentos?.length ?? 0}
                                    severity="success"
                                    rounded
                                />
                            </span>
                        }
                    >
                        <DataTable
                            value={data.rendimentos}
                            stripedRows
                            showGridlines
                            removableSort
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 15]}
                            emptyMessage="Nenhum rendimento encontrado"
                        >
                            <Column
                                field="mes_referencia"
                                header="Mês Referência"
                                align="center"
                                sortable
                                body={(rowData) =>
                                    dateBodyTemplate(rowData, "mes_referencia")
                                }
                            />

                            <Column
                                field="valor_rendimento"
                                header="Valor do Rendimento"
                                align="center"
                                sortable
                                body={(rowData) =>
                                    currencyBodyTemplate(
                                        rowData,
                                        "valor_rendimento",
                                        "BRL"
                                    )
                                }
                            />
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>
        );
    };

    return (
        <>
            <div
                className="m-2 mt-0"
                style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    borderTopLeftRadius: "0px",
                    borderTopRightRadius: "0px",
                }}
            >
                <h3>Em breve informações sobre rendimentos....</h3>
                <Divider align="left">
                    <span
                        className="font-bold"
                        style={{ backgroundColor: "white" }}
                    >
                        Valores Aplicados por Período
                    </span>
                </Divider>
                <div className="p-fluid grid flex justify-content-evenly w-full p-2">
                    <div className="field col-12 md:col-2">
                        <label
                            htmlFor="aVencerInput"
                            className="font-bold pl-1"
                        >
                            Hoje:
                        </label>
                        <InputNumber
                            id="aVencerInput"
                            mode="currency"
                            className="p-fluid"
                            locale="pt-BR"
                            currency="BRL"
                            value={aging.data_inicial}
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label htmlFor="aging2Input" className="font-bold pl-1">
                            1 - 5 dias:
                        </label>
                        <InputNumber
                            id="aging2Input"
                            mode="currency"
                            className="p-fluid"
                            locale="pt-BR"
                            currency="BRL"
                            value={aging["1_a_5_dias"]}
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label
                            htmlFor="6-30diasInput"
                            className="font-bold pl-1"
                        >
                            6 - 30 dias:
                        </label>
                        <InputNumber
                            id="6-30diasInput"
                            mode="currency"
                            className="p-fluid"
                            locale="pt-BR"
                            currency="BRL"
                            value={aging["6_a_30_dias"]}
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label
                            htmlFor="31-90diasInput"
                            className="font-bold pl-1"
                        >
                            31 - 90 dias:
                        </label>
                        <InputNumber
                            id="31-90diasInput"
                            mode="currency"
                            className="p-fluid"
                            locale="pt-BR"
                            currency="BRL"
                            value={aging["31_a_90_dias"]}
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label
                            htmlFor="91-180diasInput"
                            className="font-bold pl-1"
                        >
                            91 - 180 dias:
                        </label>
                        <InputNumber
                            id="91-180diasInput"
                            mode="currency"
                            className="p-fluid"
                            locale="pt-BR"
                            currency="BRL"
                            value={aging["91_a_180_dias"]}
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label
                            htmlFor="180diasInput"
                            className="font-bold pl-1"
                        >
                            {"> 180 dias:"}
                        </label>
                        <InputNumber
                            id="180diasInput"
                            mode="currency"
                            className="p-fluid"
                            locale="pt-BR"
                            currency="BRL"
                            value={aging.mais_180_dias}
                            readOnly
                        />
                    </div>
                </div>
            </div>
            <DataTable
                value={investiments}
                header={tableHeader}
                showGridlines
                stripedRows
                filters={filters}
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginator
                removableSort
                onValueChange={(e) => setFilteredExpenses(e)}
                footerColumnGroup={footerTabela()}
                rowExpansionTemplate={rowExpansionTemplate}
                onRowToggle={(e: DataTableRowToggleEvent) => {
                    setExpandedRows(e.data as DataTableExpandedRows);
                }}
                expandedRows={expandedRows}
                emptyMessage={C.MSG_NENHUM_RESULTADO_ENCONTRADO}
            >
                <Column expander style={{ width: "3rem" }} />

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
                                investiments
                                    .map(
                                        (element: Investimentos) =>
                                            element.dsc_categoria
                                    )
                                    .sort()
                            )
                        )
                    }
                />
                <Column
                    sortable
                    header="Nome Investimento"
                    field="nome_investimento"
                    align="center"
                    filter
                    filterField="nome_investimento"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                investiments
                                    .map(
                                        (element: Investimentos) =>
                                            element.nome_investimento
                                    )
                                    .sort()
                            )
                        )
                    }
                />

                <Column
                    align="center"
                    alignHeader="center"
                    field="data_inicio"
                    header="Data de Início"
                    filter
                    dataType="date"
                    body={(rowData) => dateBodyTemplate(rowData, "data_inicio")}
                    filterElement={dateFilterTemplate}
                />
                <Column
                    align="center"
                    alignHeader="center"
                    field="data_fim"
                    header="Data de Fim"
                    filter
                    dataType="date"
                    body={(rowData) => dateBodyTemplate(rowData, "data_fim")}
                    filterElement={dateFilterTemplate}
                />

                <Column
                    sortable
                    header="Instituição"
                    field="dsc_instituicao"
                    align="center"
                    filter
                    filterField="dsc_instituicao"
                    showFilterMenuOptions={false}
                    filterMenuStyle={{ width: "16rem" }}
                    filterElement={(
                        options: ColumnFilterElementTemplateOptions
                    ) =>
                        uniqueFilterTemplate(
                            options,
                            getUniqueValues(
                                investiments
                                    .map(
                                        (element: Investimentos) =>
                                            element.dsc_instituicao
                                    )
                                    .sort()
                            )
                        )
                    }
                    body={(rowData: Investimentos) => (
                        <div className="flex align-items-center gap-2 justify-content-center">
                            <img
                                src={getBankIcon(rowData.dsc_instituicao)}
                                alt={rowData.dsc_instituicao}
                                style={{
                                    height: 32,
                                    background: "transparent",
                                }}
                            />
                        </div>
                    )}
                />

                <Column
                    sortable
                    filter
                    dataType="numeric"
                    filterField="valor_inicial"
                    header="Valor Inicial"
                    align="center"
                    body={(rowData) =>
                        currencyBodyTemplate(rowData, "valor_inicial", "BRL")
                    }
                    filterElement={valorFilterTemplate}
                />
                {/* <Column
                    sortable
                    filter
                    dataType="numeric"
                    filterField="valor_total_investido"
                    header="Valor Total"
                    align="center"
                    body={(rowData) =>
                        currencyBodyTemplate(
                            rowData,
                            "valor_total_investido",
                            "BRL"
                        )
                    }
                    filterElement={valorFilterTemplate}
                /> */}
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
                    currentExpense.id_investimento === clearNumber
                        ? "Adicionar Investimento"
                        : "Editar Investimento"
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
                            <label htmlFor="id_categoria">
                                Categoria
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
                            <label htmlFor="nome_investimento">
                                Nome do Investimento
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                value={currentExpense.nome_investimento}
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        nome_investimento: e.target.value,
                                    });
                                }}
                            ></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="valor_inicial">
                                Valor Inicial
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputNumber
                                value={currentExpense.valor_inicial}
                                useGrouping={false}
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                mode="currency"
                                currency="BRL"
                                showButtons
                                min={0}
                                buttonLayout="horizontal"
                                step={0.25}
                                onValueChange={(
                                    e: InputNumberValueChangeEvent
                                ) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        valor_inicial: e.value as number,
                                    });
                                }}
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="data_inicio">
                                Data de Início
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Calendar
                                value={currentExpense.data_inicio as Date}
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        data_inicio: e.value as Date,
                                    });
                                }}
                                dateFormat="dd/mm/yy"
                                showIcon
                                maxDate={new Date()}
                                showButtonBar
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="data_fim">Data de Fim</label>
                            <Calendar
                                value={currentExpense.data_fim as Date}
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        data_fim: e.value as Date,
                                    });
                                }}
                                dateFormat="dd/mm/yy"
                                showIcon
                                showButtonBar
                            />
                        </div>
                        <div className="field col-12">
                            <label className="mb-2 block">Instituição</label>

                            <div className="grid">
                                {banks.map((bank) => {
                                    const isSelected =
                                        currentExpense?.id_instituicao ===
                                        bank.id_instituicao;

                                    return (
                                        <div
                                            key={bank.id_instituicao}
                                            className="col-6 md:col-3"
                                        >
                                            <div
                                                className={`
                            surface-card border-round-xl p-3
                            flex flex-column align-items-center
                            cursor-pointer transition-all
                            ${
                                isSelected
                                    ? "border-2 border-primary shadow-3"
                                    : "border-1 surface-border"
                            }
                        `}
                                                onClick={() => {
                                                    setCurrentExpense({
                                                        ...currentExpense,
                                                        id_instituicao:
                                                            bank.id_instituicao,
                                                    });
                                                }}
                                            >
                                                <img
                                                    src={getBankIcon(
                                                        bank.dsc_instituicao
                                                    )}
                                                    alt={bank.dsc_instituicao}
                                                    style={{ height: 40 }}
                                                />
                                                <span className="mt-2 text-sm font-medium text-center">
                                                    {bank.dsc_instituicao}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* <div className="field col-12 md:col-12">
                            <label htmlFor="instituicao">Instituição</label>
                            <Dropdown
                                value={currentExpense.id_instituicao}
                                onChange={(e) => {
                                    setCurrentExpense({
                                        ...currentExpense,
                                        id_instituicao: e.value,
                                    });
                                }}
                                optionLabel="dsc_instituicao"
                                optionValue="id_instituicao"
                                options={banks}
                            />
                        </div> */}
                    </div>
                </form>
            </Dialog>
            <AporteInvestimento
                visible={dialogAporteVisible}
                currentInvestment={currentExpense}
                currentAporte={selectedAporte}
                onHide={() => {
                    setDialogAporteVisible(false);
                    setSelectedAporte(newAporte);
                }}
                onSuccess={init}
                toast={toast}
            />
        </>
    );
}
