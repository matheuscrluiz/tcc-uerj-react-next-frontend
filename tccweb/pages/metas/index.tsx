// import { useSession } from "next-auth/react";
// import { FilterMatchMode } from "primereact/api";
// import { Toast } from "primereact/toast";
// import { useEffect, useState } from "react";
// import Service from "../../services/meta_service";
// import { Meta } from "../../models/meta_models";

// interface UserProps {
//     loading(b: boolean): void;
//     toast: React.RefObject<Toast>;
// }

// const initfilter = {
//     global: { value: "", matchMode: FilterMatchMode.CONTAINS },
//     id_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
//     dsc_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
//     codigo_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
// };
// export default function GoalScreen({ loading, toast }: UserProps) {
//     const [hasInitialized, setHasInitialized] = useState(false);
//     const [goals, setGoals] = useState<Meta[]>([]);

//     const service = new Service();
//     const { data: session, status } = useSession();

//     useEffect(() => {
//         if (session && !hasInitialized) {
//             init();
//             setHasInitialized(true);
//         }
//     }, [status, session]);

//     const init = async () => {
//         try {
//             const response = await service.getGoals(
//                 session?.user.ch_rede as string
//             );

//             setGoals(response.data_return);
//         } catch (error) {}
//     };
// }
// import { useSession } from "next-auth/react";
// import { FilterMatchMode } from "primereact/api";
// import { Toast } from "primereact/toast";
// import { useEffect, useState } from "react";
// import Service from "../../services/meta_service";
// import { Meta } from "../../models/meta_models";

// interface UserProps {
//     loading(b: boolean): void;
//     toast: React.RefObject<Toast>;
// }

// const initfilter = {
//     global: { value: "", matchMode: FilterMatchMode.CONTAINS },
//     id_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
//     dsc_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
//     codigo_tipo_categoria: { value: null, matchMode: FilterMatchMode.IN },
// };
// export default function GoalScreen({ loading, toast }: UserProps) {
//     const [hasInitialized, setHasInitialized] = useState(false);
//     const [goals, setGoals] = useState<Meta[]>([]);

//     const service = new Service();
//     const { data: session, status } = useSession();

//     useEffect(() => {
//         if (session && !hasInitialized) {
//             init();
//             setHasInitialized(true);
//         }
//     }, [status, session]);

//     const init = async () => {
//         try {
//             const response = await service.getGoals(
//                 session?.user.ch_rede as string
//             );

//             setGoals(response.data_return);
//         } catch (error) {}
//     };
// }
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useState, useRef, FormEvent, useMemo } from "react";
import Service from "../../services/meta_service";
import InjectionService from "../../services/meta_movimentacao_service";
import {
    AporteMeta,
    Meta,
    newAporte,
    newMeta,
    RelatorySaldoMensal,
} from "../../models/meta_models";
import RelatorySaldoCarousel from "../../components/RelatorySaldoCarousel";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import {
    InputNumber,
    InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Skeleton } from "primereact/skeleton";
import { SelectButton } from "primereact/selectbutton";
import { Divider } from "primereact/divider";
import {
    showMessage,
    showMessageError,
    showMessageResponse,
} from "../../utils/utils";
import { clearNumber } from "../../utils/configs";
import { Calendar } from "primereact/calendar";
import Image from "next/image";
import { Message } from "primereact/message";

interface UserProps {
    loading(b: boolean): void;
    toast: React.RefObject<Toast>;
}

const priorityOptions = [
    { label: "Prioridade 1", value: 1 },
    { label: "Prioridade 2", value: 2 },
    { label: "Prioridade 3", value: 3 },
    { label: "Prioridade 4", value: 4 },
    { label: "Prioridade 5", value: 5 },
];

export default function GoalScreen({ loading, toast }: UserProps) {
    const [hasInitialized, setHasInitialized] = useState(false);
    const [goals, setGoals] = useState<Meta[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

    // aporte dialog
    const [aporteVisible, setAporteVisible] = useState(false);
    const [aporte, setAporte] = useState<AporteMeta>(newAporte);
    const [currentGoal, setCurrentGoal] = useState<Meta>(newMeta);
    const [viewMode, setViewMode] = useState<"todas" | "ativas" | "concluidas">(
        "todas"
    );

    // relatory states
    const [relatorySaldoData, setRelatorySaldoData] = useState<
        RelatorySaldoMensal[]
    >([]);
    const [relatorySaldoLoading, setRelatorySaldoLoading] = useState(false);

    const service = new Service();
    const injService = new InjectionService();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (session && !hasInitialized) {
            init();
            setHasInitialized(true);
        }
    }, [status, session]);

    useEffect(() => {
        if (session && hasInitialized) {
            loadRelatorySaldoMensal();
        }
    }, [session, hasInitialized]);

    const init = async () => {
        try {
            setIsLoadingData(true);
            const response = await service.getGoals(
                session?.user.ch_rede as string
            );
            const _response = response.data_return.map((data: Meta) => ({
                ...data,
                ativa_booleano: data.ativa === "S",
                concluida_booleano:
                    data.valor_atual >= (data.valor_meta as number),
            }));
            setGoals(_response);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            setIsLoadingData(false);
        }
    };

    const loadRelatorySaldoMensal = async () => {
        try {
            setRelatorySaldoLoading(true);
            const response = await service.getRelatorySaldoMensal(
                session?.user.ch_rede as string
            );
            setRelatorySaldoData(response.data_return);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            setRelatorySaldoLoading(false);
        }
    };
    const filteredGoals = useMemo(() => {
        switch (viewMode) {
            case "ativas":
                return goals.filter(
                    (meta) => meta.ativa_booleano && !meta.concluida_booleano
                );

            case "concluidas":
                return goals.filter((meta) => meta.concluida_booleano);

            case "todas":
            default:
                return goals;
        }
    }, [goals, viewMode]);

    const openNewDialog = () => {
        setCurrentGoal(newMeta);
        setDialogVisible(true);
    };

    const openEditDialog = (goal: Meta) => {
        setCurrentGoal(goal);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
        setCurrentGoal(newMeta);
    };

    const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        try {
            loading(true);
            event.preventDefault();
            let response;
            const updateGoal = {
                ...currentGoal,
                ativa: currentGoal.ativa_booleano ? "S" : "N",
                ch_rede: session?.user.ch_rede as string,
            };
            if (currentGoal.id_meta === clearNumber) {
                response = await service.createGoals(updateGoal);
            } else {
                response = await service.updateGoals(updateGoal);
            }
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            hideDialog();
            init();
            loading(false);
        }
    };
    const onInjectionFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        try {
            loading(true);
            event.preventDefault();

            // Validar dados antes de enviar
            if (
                !aporte.valor ||
                aporte.valor <= 0 ||
                !aporte.data_movimentacao
            ) {
                showMessageError(
                    {
                        message: "Valor e data são obrigatórios",
                    },
                    toast
                );
                return;
            }

            let response;
            const updateAporte = {
                ...aporte,
                ch_rede: session?.user.ch_rede as string,
            };

            response = await injService.createGoalsInjection(updateAporte);
            showMessageResponse(response, toast);
            setAporteVisible(false);
            setAporte(newAporte);
            init();
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            loading(false);
        }
    };

    const confirmDelete = (goal: Meta) => {
        confirmDialog({
            message: `Tem certeza que deseja excluir a meta "${goal.dsc_meta}"?`,
            header: "Confirmar Exclusão",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Sim, excluir",
            rejectLabel: "Cancelar",
            acceptClassName: "p-button-danger",
            accept: () => deleteGoal(goal.id_meta),
        });
    };

    const deleteGoal = async (id: number) => {
        try {
            loading(true);
            const response = await service.deleteGoals(
                session?.user.ch_rede as string,
                id
            );
            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            init();
            loading(false);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (dropIndex: number) => {
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newGoals = [...goals];
        const draggedGoal = {
            ...newGoals[draggedIndex],
            prioridade: dropIndex + 1,
            ch_rede: session?.user.ch_rede as string,
        };

        // Remove o item da posição original
        newGoals.splice(draggedIndex, 1);
        // Insere na nova posição
        newGoals.splice(dropIndex, 0, draggedGoal);

        // Atualiza as prioridades baseado na nova ordem
        const updatedGoals = newGoals.map((goal, index) => ({
            ...goal,
            prioridade: index + 1,
        }));

        setGoals(updatedGoals);
        setDraggedIndex(null);

        try {
            loading(true);
            await service.updateGoals(draggedGoal);
            showMessage(
                {
                    severity: "success",
                    summary: "Sucesso!",
                    detail: "Prioridades atualizadas",
                },
                toast
            );
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            loading(false);
            setDropTargetIndex(null);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const calculateProgress = (atual: number, meta: number) => {
        return meta > 0 ? Math.min((atual / meta) * 100, 100) : 0;
    };

    const getProgressGradient = (progress: number) => {
        if (progress >= 75)
            return "linear-gradient(90deg, #10b981 0%, #059669 100%)";
        if (progress >= 50)
            return "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)";
        if (progress >= 25)
            return "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)";
        return "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)";
    };

    const dialogFooter = (
        <div>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={hideDialog}
                text
                className="p-button-text p-button-danger"
            />
            <Button
                label={currentGoal.id_meta === clearNumber ? "Criar" : "Editar"}
                icon="pi pi-check"
                type="submit"
                form="form"
                disabled={
                    !(
                        currentGoal.dsc_meta &&
                        currentGoal.valor_meta &&
                        currentGoal.prioridade
                    )
                }
                className="p-button-text"
            />
        </div>
    );

    const sameMonth = (d1: Date, d2: Date) =>
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    const saldoDisponivelMes = (() => {
        if (!aporte.data_movimentacao || !relatorySaldoData) return null;

        const relatorio = relatorySaldoData.find((r: any) =>
            sameMonth(new Date(r.mes), aporte.data_movimentacao as Date)
        );

        return relatorio?.disponivel ?? null;
    })();
    const aporteMaiorQueSaldo =
        saldoDisponivelMes !== null && (aporte.valor ?? 0) > saldoDisponivelMes;

    if (isLoadingData) {
        return (
            <div className="goals-container">
                <style jsx>{`
                    .goals-container {
                        padding: 2rem 1.5rem;
                        max-width: 1400px;
                        margin: 0 auto;
                    }
                `}</style>
                <div className="grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="col-12 md:col-6 lg:col-4">
                            <Skeleton
                                width="100%"
                                height="300px"
                                borderRadius="20px"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <ConfirmDialog />
            <div>
                <h3 className="ml-6"> Saldo disponível para aporte</h3>
                <RelatorySaldoCarousel
                    items={relatorySaldoData}
                    loading={relatorySaldoLoading}
                    goals={goals}
                    onAporteSubmit={async (aporte) => {
                        try {
                            loading(true);
                            const updateAporte = {
                                ...aporte,
                                ch_rede: session?.user.ch_rede as string,
                            };
                            const response =
                                await injService.createGoalsInjection(
                                    updateAporte
                                );
                            showMessageResponse(response, toast);
                            init();
                        } catch (error) {
                            showMessageError(error, toast);
                            throw error;
                        } finally {
                            loading(false);
                        }
                    }}
                    isLoadingAporte={false}
                />
            </div>
            <Divider className="mb-2"></Divider>

            <style jsx>{`
                .goals-container {
                    // padding: 2rem 1.5rem;
                    // max-width: 1400px;
                    margin: 0 auto;
                    background: linear-gradient(
                        180deg,
                        #fafafa 0%,
                        #ffffff 100%
                    );
                    // min-height: 100vh;
                }

                .header-section {
                    margin-bottom: 1rem;
                    position: relative;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                }

                .header-left h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(
                        135deg,
                        #0f766e 0%,
                        #16a34a 100%
                    );
                    background-clip: text;
                    margin: 0 0 0.5rem 0;
                    letter-spacing: -0.5px;
                }

                .header-left p {
                    color: #64748b;
                    font-size: 1.1rem;
                    margin: 0;
                    font-weight: 500;
                }

                .drag-hint {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(15, 118, 110, 0.1);
                    border: 2px dashed rgba(15, 118, 110, 0.3);
                    border-radius: 12px;
                    color: #0f766e;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .completed-section {
                    margin-top: 2rem;
                }

                .completed-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .completed-title {
                    font-weight: 800;
                    color: #001c43;
                }

                .goal-card {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    max-width: 460px;
                    box-shadow:
                        0 4px 6px rgba(0, 0, 0, 0.05),
                        0 10px 15px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: grab;
                    // border: 2px solid black;
                    margin: 0.25rem;
                    position: relative;
                }

                .goal-card:active {
                    cursor: grabbing;
                }

                .goal-card.dragging {
                    opacity: 0.5;
                    transform: scale(0.95);
                }

                .goal-card.drag-over {
                    border-color: #0f766e;
                    transform: scale(1.02);
                    box-shadow:
                        0 20px 25px -5px rgba(15, 118, 110, 0.2),
                        0 10px 10px -5px rgba(15, 118, 110, 0.1);
                }

                .goal-card:hover:not(.dragging) {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow:
                        0 20px 25px -5px rgba(0, 0, 0, 0.1),
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .priority-badge {
                    position: absolute;
                    // top: 1rem;
                    right: 1rem;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(
                        135deg,
                        #0f766e 0%,
                        #16a34a 100%
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: white;
                    box-shadow: 0 4px 12px rgba(15, 118, 110, 0.4);
                    z-index: 10;
                }

                .drag-handle {
                    position: absolute;
                    // top: 1rem;
                    // left: 1rem;
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: rgba(15, 118, 110, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: grab;
                    z-index: 10;
                    transition: all 0.2s;
                }

                .drag-handle:hover {
                    background: rgba(15, 118, 110, 0.2);
                    transform: scale(1.1);
                }

                .drag-handle:active {
                    cursor: grabbing;
                }

                .goal-header {
                    border-radius: 12px;
                    padding: 0rem 3rem;
                    background: linear-gradient(
                        135deg,
                        #f0fdf4 0%,
                        #dcfce7 100%
                    );
                    position: relative;
                }

                .goal-header.inactive {
                    background: linear-gradient(
                        135deg,
                        #fee2e2 0%,
                        #fecaca 100%
                    );
                }

                .goal-header.completed {
                    background: linear-gradient(
                        135deg,
                        #fef3c7 0%,
                        #fde68a 100%
                    );
                }

                .goal-header-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }

                .goal-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #001c43;
                    margin-top: 1rem;
                    word-break: break-word;
                }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    white-space: nowrap;
                    border: 2px solid transparent;
                }

                .status-pill.active {
                    background: rgba(5, 150, 105, 0.12);
                    color: #065f46;
                    border-color: rgba(5, 150, 105, 0.25);
                }

                .status-pill.inactive {
                    background: rgba(239, 68, 68, 0.12);
                    color: #7f1d1d;
                    border-color: rgba(239, 68, 68, 0.25);
                }

                .status-pill.completed {
                    background: rgba(22, 163, 74, 0.12);
                    color: #14532d;
                    border-color: rgba(22, 163, 74, 0.25);
                }

                .goal-body {
                    margin-top: 0.5rem;
                }

                .values-display {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .value-box {
                    text-align: center;
                    padding: 1rem;
                    border-radius: 16px;
                    background: linear-gradient(
                        135deg,
                        #f8fafc 0%,
                        #f1f5f9 100%
                    );
                    transition: all 0.2s;
                }

                .value-box:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .value-label {
                    font-size: 0.75rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .value-amount {
                    font-size: 1.125rem;
                    font-weight: 800;
                }

                .value-amount.current {
                    background: linear-gradient(
                        135deg,
                        #0f766e 0%,
                        #14b8a6 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .value-amount.target {
                    background: linear-gradient(
                        135deg,
                        #16a34a 0%,
                        #22c55e 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .value-amount.remaining {
                    background: linear-gradient(
                        135deg,
                        #ea580c 0%,
                        #f97316 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .progress-section {
                    margin-bottom: 1rem;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .progress-label {
                    font-size: 0.875rem;
                    color: #3f454d;
                    font-weight: 600;
                }

                .progress-percentage {
                    font-size: 1.25rem;
                    font-weight: 800;
                    background: linear-gradient(
                        135deg,
                        #0f766e 0%,
                        #16a34a 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .custom-progress {
                    height: 12px;
                    border-radius: 20px;
                    background: #e2e8f0;
                    overflow: hidden;
                    position: relative;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 20px;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .progress-fill::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.3),
                        transparent
                    );
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                .actions-row {
                    display: flex;
                    gap: 0.5rem;
                }

                .action-btn {
                    flex: 1;
                    padding: 0.75rem;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .action-btn:hover {
                    border-color: #0f766e;
                    color: #0f766e;
                    transform: translateY(-2px);
                }

                .action-btn.danger:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .action-btn.success:hover {
                    border-color: #10b981;
                    color: #10b981;
                }

                .empty-state {
                    text-align: center;
                    // padding: 4rem 2rem;
                }

                .empty-icon {
                    font-size: 5rem;
                    color: #cbd5e1;
                    // margin-bottom: 1.5rem;
                }

                .empty-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #001c43;
                    margin-bottom: 0.75rem;
                }

                .empty-text {
                    color: #3f454d;
                    font-size: 1.125rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .goals-container {
                        padding: 1.5rem 1rem;
                    }

                    .header-left h1 {
                        font-size: 2rem;
                    }

                    .goals-grid {
                        grid-template-columns: 1fr;
                    }

                    .values-display {
                        grid-template-columns: 1fr;
                        gap: 0.75rem;
                    }
                }
            `}</style>

            <div className="goals-container">
                <div className="header-section">
                    <div className="header-content">
                        <div className="header-left">
                            <h2>
                                Gerencie suas conquistas e acompanhe seu
                                progresso
                            </h2>
                            <div className="drag-hint">
                                <i className="pi pi-arrows-alt"></i>
                                Arraste os cards para reordenar prioridades
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <SelectButton
                                value={viewMode}
                                options={[
                                    { label: "Todas", value: "todas" },
                                    { label: "Ativas", value: "ativas" },
                                    {
                                        label: "Concluídas",
                                        value: "concluidas",
                                    },
                                ]}
                                onChange={(e) => setViewMode(e.value)}
                                aria-label="Filtrar metas"
                            />
                            <Button
                                label="Nova Meta"
                                icon="pi pi-plus"
                                onClick={openNewDialog}
                                className="p-button p-button-lg"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #0f766e 0%, #16a34a 100%)",
                                    border: "none",
                                    padding: "0.75rem 2rem",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {filteredGoals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Image
                                src="/images/motivation.png"
                                width={50}
                                height={50}
                                alt="Aporte"
                            />
                            {/* <i className="pi pi-inbox text-5xl"></i> */}
                        </div>
                        <h2 className="empty-title">Nenhuma meta cadastrada</h2>
                        <p className="empty-text">
                            Comece criando sua primeira meta financeira e
                            acompanhe seu progresso
                        </p>
                        <Button
                            label="Criar Primeira Meta"
                            icon="pi pi-plus"
                            onClick={openNewDialog}
                            className="p-button-rounded p-button-lg"
                            style={{
                                background:
                                    "linear-gradient(135deg, #0f766e 0%, #16a34a 100%)",
                                border: "none",
                                padding: "0.75rem 2rem",
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="p-fluid">
                            <div className="grid justify-content-space-evenly">
                                {filteredGoals.map((goal, index) => {
                                    const isCompleted = goal.concluida_booleano;
                                    const progress = calculateProgress(
                                        goal.valor_atual,
                                        goal.valor_meta as number
                                    );
                                    const gradient =
                                        getProgressGradient(progress);

                                    return (
                                        <div
                                            key={goal.id_meta}
                                            className={`field col-12 md:col-3 goal-card ${
                                                draggedIndex === index
                                                    ? "dragging"
                                                    : ""
                                            } ${dropTargetIndex === index ? "drag-over" : ""}`}
                                            draggable={
                                                viewMode === "todas" &&
                                                !isCompleted
                                            }
                                            onDragStart={() =>
                                                handleDragStart(index)
                                            }
                                            onDragOver={handleDragOver}
                                            onDragEnter={() =>
                                                setDropTargetIndex(index)
                                            }
                                            onDragLeave={() =>
                                                setDropTargetIndex(null)
                                            }
                                            onDrop={() => handleDrop(index)}
                                        >
                                            <div className="drag-handle">
                                                <i
                                                    className="pi pi-bars"
                                                    style={{
                                                        color: "#0f766e",
                                                        fontSize: "1.25rem",
                                                    }}
                                                ></i>
                                            </div>

                                            <div className="priority-badge">
                                                {goal.prioridade}
                                            </div>

                                            <div
                                                className={`goal-header ${
                                                    isCompleted
                                                        ? "completed"
                                                        : goal.ativa_booleano
                                                          ? ""
                                                          : "inactive"
                                                }`}
                                            >
                                                <div className="goal-header-row">
                                                    <h3 className="goal-title">
                                                        {goal.dsc_meta}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="goal-body">
                                                <div className="values-display">
                                                    <div className="value-box">
                                                        <div className="value-label">
                                                            Atual
                                                        </div>
                                                        <div className="value-amount current">
                                                            {formatCurrency(
                                                                goal.valor_atual
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="value-box">
                                                        <div className="value-label">
                                                            Meta
                                                        </div>
                                                        <div className="value-amount target">
                                                            {formatCurrency(
                                                                goal.valor_meta as number
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="value-box">
                                                        <div className="value-label">
                                                            Falta
                                                        </div>
                                                        <div className="value-amount remaining">
                                                            {formatCurrency(
                                                                goal.falta
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="progress-section">
                                                    <div className="progress-header">
                                                        <span className="progress-percentage justify-content-end">
                                                            {progress.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </span>
                                                    </div>

                                                    <div className="custom-progress">
                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${progress}%`,
                                                                background:
                                                                    gradient,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="actions-row">
                                                    <button
                                                        type="button"
                                                        className="action-btn"
                                                        onClick={() =>
                                                            openEditDialog(goal)
                                                        }
                                                    >
                                                        <i className="pi pi-pencil"></i>
                                                        Editar
                                                    </button>

                                                    {!isCompleted &&
                                                        viewMode !==
                                                            "concluidas" && (
                                                            <button
                                                                type="button"
                                                                className="action-btn success"
                                                                onClick={() => {
                                                                    setCurrentGoal(
                                                                        goal
                                                                    );
                                                                    setAporte({
                                                                        ...newAporte,
                                                                        id_meta:
                                                                            goal.id_meta,
                                                                    });
                                                                    setAporteVisible(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <i className="pi pi-wallet"></i>
                                                                Adicionar
                                                            </button>
                                                        )}

                                                    <button
                                                        type="button"
                                                        className="action-btn danger"
                                                        onClick={() =>
                                                            confirmDelete(goal)
                                                        }
                                                    >
                                                        <i className="pi pi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Dialog
                visible={dialogVisible}
                header={
                    currentGoal.id_meta === clearNumber
                        ? "Nova Meta"
                        : "Editar Meta"
                }
                modal
                breakpoints={{ "960px": "50vw", "641px": "100vw" }}
                style={{ width: "30vw" }}
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <form id="form" onSubmit={onFormSubmit}>
                    <div className="p-fluid">
                        <div className="field col-12 md:col-12">
                            <label htmlFor="dsc_meta">
                                Descrição da Meta
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputText
                                id="dsc_meta"
                                value={currentGoal.dsc_meta}
                                onChange={(e) =>
                                    setCurrentGoal({
                                        ...currentGoal,
                                        dsc_meta: e.target.value,
                                    })
                                }
                                placeholder="Ex: Comprar um notebook novo"
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="valor_meta">
                                Valor da Meta
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputNumber
                                value={currentGoal.valor_meta}
                                onValueChange={(
                                    e: InputNumberValueChangeEvent
                                ) => {
                                    setCurrentGoal({
                                        ...currentGoal,
                                        valor_meta: e.value as number,
                                    });
                                }}
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
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="prioridade">
                                Prioridade da Meta
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Dropdown
                                id="prioridade"
                                value={currentGoal.prioridade}
                                options={priorityOptions}
                                onChange={(e) =>
                                    setCurrentGoal({
                                        ...currentGoal,
                                        prioridade: e.value,
                                    })
                                }
                                placeholder="Selecione a prioridade"
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="ativa_meta">Status da Meta</label>
                            <SelectButton
                                id="ativa_meta"
                                value={currentGoal.ativa_booleano}
                                options={[
                                    { label: "Ativa", value: true },
                                    { label: "Inativa", value: false },
                                ]}
                                onChange={(e) =>
                                    setCurrentGoal({
                                        ...currentGoal,
                                        ativa_booleano: e.value,
                                    })
                                }
                                aria-label="Status da meta"
                            />
                        </div>
                    </div>
                </form>
            </Dialog>

            {/* Aportar Valor */}
            <Dialog
                visible={aporteVisible}
                header="Adicionar Aporte"
                breakpoints={{ "960px": "50vw", "641px": "100vw" }}
                style={{ width: "30vw" }}
                modal
                onHide={() => setAporteVisible(false)}
                footer={
                    <div>
                        <Button
                            label="Cancelar"
                            className="p-button-text"
                            onClick={() => setAporteVisible(false)}
                        />
                        <Button
                            label="Confirmar"
                            icon="pi pi-check"
                            type="submit"
                            form="injForm"
                            disabled={
                                !aporte.valor ||
                                aporte.valor <= 0 ||
                                !aporte.data_movimentacao
                            }
                        />
                    </div>
                }
            >
                <form id="injForm" onSubmit={onInjectionFormSubmit}>
                    <div className="p-fluid">
                        <div className="field col-12 md:col-12">
                            <label htmlFor="dsc_categoria">
                                Valor do Aporte
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <InputNumber
                                value={aporte.valor}
                                onValueChange={(e) =>
                                    setAporte((prev) => ({
                                        ...prev,
                                        valor: e.value as number,
                                    }))
                                }
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
                            />
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="dsc_categoria">
                                Mês Referência
                                <span style={{ color: "red" }}> *</span>
                            </label>
                            <Calendar
                                value={aporte.data_movimentacao as Date}
                                onChange={(e) => {
                                    setAporte({
                                        ...aporte,
                                        data_movimentacao: e.value as Date,
                                    });
                                }}
                                view="month"
                                dateFormat="mm/yy"
                                showIcon
                                maxDate={new Date()}
                                showButtonBar
                            />
                        </div>
                        {aporteMaiorQueSaldo && (
                            <Message
                                severity="warn"
                                text={`O aporte é maior que o saldo disponível
                                do mês (${saldoDisponivelMes.toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    }
                                )})`}
                            />
                        )}
                    </div>
                </form>
            </Dialog>
        </>
    );
}
