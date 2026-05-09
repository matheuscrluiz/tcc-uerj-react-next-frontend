// React
import React, { ReactElement } from "react";
// Primereact
import classNames from "classnames";
import { Chip } from "primereact/chip";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";
import {
    TriStateCheckbox,
    TriStateCheckboxChangeEvent,
} from "primereact/tristatecheckbox";
import { ColumnFilterElementTemplateOptions } from "primereact/column";
// Utils
import { formatCurrency } from "../../utils/utils";
// Components
import AuditButton from "../ColumnCrud/AuditButton";
import DeleteButton from "../ColumnCrud/DeleteButton";
import { DataTableValue } from "primereact/datatable";

// ============== Body Templates ============== \\

export function crudBodyTemplate<T extends DataTableValue>(
    rowData: T,
    audit?: boolean,
    onEdit?: () => void,
    onDelete?: (value: T) => void,
    msgDelete?: React.ReactNode
) {
    return (
        <div className="flex justify-content-center">
            {audit ? <AuditButton target={rowData} alteracao={true} /> : null}
            {onEdit ? (
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text"
                    tooltip="Editar"
                    tooltipOptions={{ position: "left" }}
                    onClick={onEdit}
                />
            ) : null}
            {onDelete ? (
                <DeleteButton
                    target={rowData}
                    onDelete={onDelete}
                    msg={msgDelete}
                />
            ) : null}
        </div>
    );
}
export function dateBodyTemplate<T>(
    rowData: T,
    field: keyof T,
    hour?: boolean
): string {
    const value = rowData[field];
    if (!(value instanceof Date)) return "";

    return formatViewDate(value, hour);
}
/**
 * Formata as datas no formato ISO para o formato pt-br.
 *
 * @param {string | Date} date - Data a ser formatada.
 * @param {boolean | undefined} hour - Booleano para adicionar horário
 *
 * @return {string} Data formatada para o formato pt-br.
 */
export function formatViewDate(date: string | Date, hour?: boolean): string {
    if (date) {
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        };
        if (hour)
            Object.assign(options, {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            });
        if (date instanceof Date) {
            return date.toLocaleDateString("pt-BR", options);
        }
        return new Date(date).toLocaleDateString("pt-BR", options);
    }
    return "";
}

export function currencyBodyTemplate<T>(
    rowData: T,
    field: keyof T,
    currency: string,
    color = true,
    type?: string
): ReactElement {
    const number = rowData[field];
    if (typeof number != "number") return <></>;

    if (!color) return <span>{formatCurrency(number, currency)}</span>;
    return (
        <span
            style={
                type === "receita"
                    ? { color: "green" }
                    : type === "despesa"
                      ? { color: "red" }
                      : {}
            }
        >
            {formatCurrency(number, currency)}
        </span>
    );
}
export function statusBodyTemplate<T extends { status: string }>(
    rowData: T,
    statusMap: { [key: string]: { descricao: string; color: string } }
): JSX.Element {
    const statusKey = rowData.status;
    const statusData = statusMap[statusKey];

    return (
        <Chip
            style={{
                backgroundColor: `var(--${statusData?.color || "gray-200"})`,
            }}
            label={statusData?.descricao || "Status Desconhecido"}
        />
    );
}

export function textElipsisBodyTemplate(value: string) {
    return (
        <>
            {/* <Copy value={value} /> */}
            <span className="ml-2">{value}</span>
        </>
    );
}
export function statusGenericBodyTemplate<T extends Record<string, any>>(
    rowData: T,
    statusMap: { [key: number]: { descricao: string; color: string } },
    fieldName: keyof T // passa a string com o nome do campo
): JSX.Element {
    const statusKey = rowData[fieldName] as number;
    const statusData = statusMap[statusKey];

    return (
        <Chip
            style={{
                backgroundColor: `var(--${statusData?.color || "gray-200"})`,
            }}
            label={statusData?.descricao || "Status Desconhecido"}
        />
    );
}

export function statuIdBodyTemplate<
    T extends { proj_id_status?: number; id_status?: number },
>(
    rowData: T,
    statusMap: { [key: number]: { descricao: string; color: string } }
): JSX.Element {
    const statusKey = rowData.proj_id_status ?? rowData.id_status;
    const statusData = statusMap[statusKey as number];

    return (
        <Chip
            style={{
                backgroundColor: `var(--${statusData?.color || "gray-200"})`,
            }}
            label={statusData?.descricao || "Status Desconhecido"}
        />
    );
}

export function verifiedBodyTemplate<T>(rowData: T, field: keyof T) {
    const value = rowData[field];

    return (
        <i
            style={{
                color: value ? `var(--green-500)` : `var(--red-500)`,
            }}
            className={classNames("pi", {
                "true-icon pi-check-circle": value, // 'S'
                "false-icon pi-times-circle": !value, // 'N'
            })}
        />
    );
}

export function pdfBodyTemplate(downloadFunc: () => void, boleto_id: number) {
    return (
        <Button
            icon="pi pi-file-pdf"
            tooltip="Baixar PDF"
            tooltipOptions={{ position: "bottom" }}
            className="p-button-rounded p-button-danger p-button-text"
            onClick={downloadFunc}
            disabled={boleto_id == undefined}
        />
    );
}

// ============== Filter Templates ============== \\

export function dateFilterTemplate(
    options: ColumnFilterElementTemplateOptions
): ReactElement {
    return (
        <Calendar
            value={options.value}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            placeholder="dd/mm/aaaa"
            mask="99/99/9999"
        />
    );
}

export function uniqueFilterTemplate<T>(
    options: ColumnFilterElementTemplateOptions,
    values: T[]
): ReactElement {
    const valuesObj = values.map((item) => ({ name: item }));
    return (
        <MultiSelect
            value={options.value}
            options={valuesObj}
            optionLabel="name"
            optionValue="name"
            filter
            display="chip"
            onChange={(e) => options.filterCallback(e.value)}
            className="p-column-filter"
        />
    );
}

export function multiSelectFilterTemplate<T>(
    options: ColumnFilterElementTemplateOptions,
    values: T[],
    field?: keyof T & string
): ReactElement {
    if (field) {
        return (
            <MultiSelect
                value={options.value}
                options={values}
                optionValue={field}
                optionLabel={field}
                display="chip"
                onChange={(e) => options.filterCallback(e.value)}
                className="p-column-filter"
            />
        );
    }
    return (
        <MultiSelect
            value={options.value}
            options={values}
            display="chip"
            onChange={(e) => options.filterCallback(e.value)}
            className="p-column-filter"
        />
    );
}

export function verifiedFilterTemplate(
    options: ColumnFilterElementTemplateOptions
) {
    return (
        <div className="flex align-items-center justify-content-center">
            <label className="font-bold mr-2">Flag</label>
            <TriStateCheckbox
                checkIcon="pi pi-check-circle"
                uncheckIcon="pi pi-times-circle"
                value={options.value}
                onChange={(e: TriStateCheckboxChangeEvent) =>
                    options.filterCallback(e.value)
                }
            />
        </div>
    );
}

export function valorFilterTemplate(
    options: ColumnFilterElementTemplateOptions
): ReactElement {
    return (
        <InputNumber
            value={options.value}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            mode="currency"
            currency="BRL"
            placeholder="R$ 1.000,00"
            locale="pt-BR"
        />
    );
}
