import React, { FormEvent, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import {
    InputNumber,
    InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import Image from "next/image";
import { Aporte, Investimentos, newAporte } from "../models/investimento_model";
import InjectionService from "../services/aporte_investimento_service";
import { clearNumber } from "../utils/configs";
import { showMessageError, showMessageResponse } from "../utils/utils";
import { useSession } from "next-auth/react";

interface AporteInvestimentoProps {
    visible: boolean;
    currentInvestment: Investimentos;
    currentAporte?: Aporte;
    onHide: () => void;
    onSuccess: () => void;
    toast: React.RefObject<Toast>;
}

export default function AporteInvestimento({
    visible,
    currentInvestment,
    currentAporte,
    onHide,
    onSuccess,
    toast,
}: AporteInvestimentoProps) {
    const [currentInjection, setCurrentInjection] = useState<Aporte>(newAporte);
    const injectionService = new InjectionService();
    const { data: session } = useSession();

    useEffect(() => {
        if (visible) {
            if (currentAporte) {
                setCurrentInjection(currentAporte);
            } else {
                setCurrentInjection(newAporte);
            }
        }
    }, [visible, currentAporte]);

    const handleHide = () => {
        setCurrentInjection(newAporte);
        onHide();
    };

    const AporteDialogFooter = (
        <>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={handleHide}
                text
                className="p-button-text p-button-danger"
            />
            <Button
                label={
                    currentInjection.id_aporte === clearNumber
                        ? "Criar"
                        : "Editar"
                }
                icon="pi pi-check"
                form="injectionForm"
                type="submit"
                disabled={
                    !(
                        currentInjection.valor_aporte !== 0 &&
                        currentInjection.data_aporte
                    )
                }
                className="p-button-text"
            />
        </>
    );

    const onInjectionFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const updateInjection = {
                ...currentInjection,
                id_investimento: currentInvestment.id_investimento,
                ch_rede: session?.user.ch_rede as string,
            };
            let response;

            if (currentInjection.id_aporte === clearNumber) {
                response =
                    await injectionService.createInvestimentInjection(
                        updateInjection
                    );
            } else {
                response =
                    await injectionService.updateInvestimentInjection(
                        updateInjection
                    );
            }

            showMessageResponse(response, toast);
        } catch (error) {
            showMessageError(error, toast);
        } finally {
            handleHide();
            onSuccess();
        }
    };

    return (
        <Dialog
            visible={visible}
            header={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Image
                        src="/images/cash-machine.png"
                        width={28}
                        height={28}
                        alt="Aporte"
                    />
                    <span className="ml-2">
                        {currentInjection.id_aporte === clearNumber
                            ? "Novo Aporte"
                            : "Editar Aporte"}{" "}
                        - ({currentInvestment.nome_investimento})
                    </span>
                </div>
            }
            onHide={handleHide}
            modal
            footer={AporteDialogFooter}
            breakpoints={{ "960px": "50vw", "641px": "100vw" }}
            style={{ width: "30vw" }}
        >
            <form id="injectionForm" onSubmit={onInjectionFormSubmit}>
                <div className="p-fluid">
                    <div className="field col-12 md:col-12">
                        <label htmlFor="valor_aporte">
                            Valor Aporte
                            <span style={{ color: "red" }}> *</span>
                        </label>
                        <InputNumber
                            value={currentInjection.valor_aporte}
                            useGrouping={false}
                            incrementButtonIcon="pi pi-plus"
                            decrementButtonIcon="pi pi-minus"
                            mode="currency"
                            currency="BRL"
                            showButtons
                            min={0}
                            buttonLayout="horizontal"
                            step={0.25}
                            onValueChange={(e: InputNumberValueChangeEvent) => {
                                setCurrentInjection({
                                    ...currentInjection,
                                    valor_aporte: e.value as number,
                                });
                            }}
                        />
                    </div>
                    <div className="field col-12 md:col-12">
                        <label htmlFor="data_aporte">
                            Data do Aporte
                            <span style={{ color: "red" }}> *</span>
                        </label>
                        <Calendar
                            value={currentInjection.data_aporte as Date}
                            onChange={(e) => {
                                setCurrentInjection({
                                    ...currentInjection,
                                    data_aporte: e.value as Date,
                                });
                            }}
                            dateFormat="dd/mm/yy"
                            showIcon
                            maxDate={new Date()}
                            showButtonBar
                        />
                    </div>
                </div>
            </form>
        </Dialog>
    );
}
