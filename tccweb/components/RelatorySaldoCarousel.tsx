import React, { useState, useEffect } from "react";
import { Carousel } from "primereact/carousel";
import {
    RelatorySaldoMensal,
    Meta,
    newAporte,
    AporteMeta,
} from "../models/meta_models";
import styles from "../styles/relatory_carousel.module.css";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Tooltip } from "primereact/tooltip";
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import {
    InputNumber,
    InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Message } from "primereact/message";

interface RelatorySaldoCarouselProps {
    items: RelatorySaldoMensal[];
    loading?: boolean;
    goals?: Meta[];
    onAporteSubmit?: (aporte: AporteMeta) => Promise<void>;
    isLoadingAporte?: boolean;
}

const RelatorySaldoCarousel: React.FC<RelatorySaldoCarouselProps> = ({
    items,
    loading = false,
    goals = [],
    onAporteSubmit,
    isLoadingAporte = false,
}) => {
    const [aporteVisible, setAporteVisible] = useState(false);
    const [selectedMes, setSelectedMes] = useState<RelatorySaldoMensal | null>(
        null
    );
    const [aporte, setAporte] = useState<AporteMeta>(newAporte);

    const handleAporteClick = (item: RelatorySaldoMensal) => {
        setSelectedMes(item);
        setAporte({
            ...newAporte,
            data_movimentacao: new Date(item.mes),
        });
        setAporteVisible(true);
    };

    const handleAporteSubmit = async () => {
        if (onAporteSubmit && selectedMes) {
            try {
                await onAporteSubmit(aporte);
                setAporteVisible(false);
                setSelectedMes(null);
                setAporte(newAporte);
            } catch (error) {
                console.error("Erro ao registrar aporte:", error);
            }
        }
    };
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatMonth = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric",
        }).format(date);
    };

    const isCurrentMonth = (date: string) => {
        const today = new Date();
        const currentDate = new Date(date);

        return (
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear()
        );
    };
    const itemTemplate = (item: RelatorySaldoMensal) => {
        return (
            <div className={styles.carouselItem}>
                <div className={styles.cardContainer}>
                    <div className="flex flex-column md:flex-row justify-content-between">
                        <div className={styles.monthHeader}>
                            {formatMonth(item.mes)}
                        </div>
                        <Button
                            label="Aportar"
                            className="mb-1"
                            outlined
                            onClick={() => handleAporteClick(item)}
                            disabled={item.disponivel <= 0}
                        />
                    </div>

                    <Divider />

                    <div className={styles.metricsGrid}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>Saldo</div>

                            {/* <div className={styles.metricValue}>
                                {formatCurrency(item.saldo)}
                            </div> */}
                            <div
                                className={styles.metricValue}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                {isCurrentMonth(item.mes) && (
                                    <Badge
                                        value={"Provisório"}
                                        style={{
                                            color: "#92400E",
                                            backgroundColor: "#FEF3C7",
                                        }}
                                    />
                                    // <span
                                    //     style={{
                                    //         fontSize: "10px",
                                    //         padding: "2px 6px",
                                    //         backgroundColor: "#FEF3C7",
                                    //         color: "#92400E",
                                    //         borderRadius: "8px",
                                    //         fontWeight: 500,
                                    //     }}
                                    // >
                                    //     provisório
                                    // </span>
                                )}
                                {formatCurrency(item.saldo)}
                            </div>
                        </div>

                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>Aportado</div>
                            <div
                                className={`${styles.metricValue} ${styles.aportado}`}
                            >
                                {formatCurrency(item.aportado)}
                            </div>
                        </div>

                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>Disponível</div>
                            <div
                                className={`${styles.metricValue} ${styles.disponivel}`}
                            >
                                {formatCurrency(item.disponivel)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading || items.length === 0) {
        return null;
    }

    return (
        <div className={styles.carouselWrapper}>
            <Carousel
                value={items}
                itemTemplate={itemTemplate}
                numVisible={4}
                numScroll={1}
                responsiveOptions={[
                    {
                        breakpoint: "1024px",
                        numVisible: 2,
                        numScroll: 1,
                    },
                    {
                        breakpoint: "640px",
                        numVisible: 1,
                        numScroll: 1,
                    },
                ]}
                // circular
                // autoplayInterval={5000}
                showIndicators={true}
                showNavigators={true}
            />

            {/* Dialog de Aporte do Carousel */}
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
                            onClick={handleAporteSubmit}
                            disabled={
                                !aporte.valor ||
                                aporte.valor <= 0 ||
                                !aporte.id_meta ||
                                isLoadingAporte
                            }
                            loading={isLoadingAporte}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="field col-12 md:col-12">
                        <label htmlFor="meta_carousel">
                            Selecione a Meta
                            <span style={{ color: "red" }}> *</span>
                        </label>
                        <Dropdown
                            id="meta_carousel"
                            value={aporte.id_meta}
                            options={goals.map((goal) => ({
                                label: goal.dsc_meta,
                                value: goal.id_meta,
                            }))}
                            onChange={(e) =>
                                setAporte((prev) => ({
                                    ...prev,
                                    id_meta: e.value,
                                }))
                            }
                            placeholder="Selecione uma meta"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>

                    <div className="field col-12 md:col-12">
                        <label htmlFor="valor_aporte_carousel">
                            Valor do Aporte
                            <span style={{ color: "red" }}> *</span>
                        </label>
                        <InputNumber
                            id="valor_aporte_carousel"
                            value={aporte.valor}
                            onValueChange={(e: InputNumberValueChangeEvent) =>
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
                            max={selectedMes?.disponivel ?? 0}
                            buttonLayout="horizontal"
                            step={10}
                        />
                    </div>

                    {selectedMes && (
                        <Message
                            severity="info"
                            text={`Saldo disponível para aporte: ${new Intl.NumberFormat(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency: "BRL",
                                }
                            ).format(selectedMes.disponivel)}`}
                        />
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default RelatorySaldoCarousel;
