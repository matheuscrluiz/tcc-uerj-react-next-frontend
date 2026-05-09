import React, { useRef } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { DataTable, DataTableValue } from "primereact/datatable";
import C from "../../utils/constants";
import { formatViewDate } from "../Templates/templates";

interface AuditPanelProps<T> {
    target: T;
    alteracao: boolean;
}

function AuditButton<T extends DataTableValue>({
    target,
    alteracao,
}: AuditPanelProps<T>) {
    const audit = useRef(null);

    const dataInclBodyTemplate = (rowData: T) => {
        return (
            <div className="ml-3">
                {formatViewDate(rowData.data_inclusao, true)}
            </div>
        );
    };

    const usrInclBodyTemplate = (rowData: T) => {
        return <div className="ml-3">{rowData.ch_usuario_inclusao}</div>;
    };

    const dataAltlBodyTemplate = (rowData: T) => {
        return (
            <div className="ml-3">
                {formatViewDate(rowData.data_alteracao, true)}
            </div>
        );
    };

    const usrAltlBodyTemplate = (rowData: T) => {
        return <div className="ml-3">{rowData.ch_usuario_alteracao}</div>;
    };

    const columns = [
        {
            field: "data_inclusao",
            header: C.DATA_INCLUSAO,
            body: dataInclBodyTemplate,
        },
        {
            field: "ch_usuario_inclusao",
            header: C.USUARIO_INCLUSAO,
            body: usrInclBodyTemplate,
        },
    ];
    if (alteracao) {
        columns.push(
            {
                field: "data_alteracao",
                header: C.DATA_ALTERACAO,
                body: dataAltlBodyTemplate,
            },
            {
                field: "ch_usuario_alteracao",
                header: C.USUARIO_ALTERACAO,
                body: usrAltlBodyTemplate,
            }
        );
    }

    const dynamicColumns = columns.map((obj, i) => {
        return (
            <Column
                key={i}
                field={obj.field}
                header={obj.header}
                body={obj.body}
            />
        );
    });

    return (
        <React.Fragment>
            <div>
                <Button
                    aria-label="Campos de auditoria"
                    icon="pi pi-info-circle"
                    className="p-button-rounded p-button-success p-button-text"
                    tooltip="Informações adicionais"
                    tooltipOptions={{ position: "left" }}
                    // @ts-ignore: Object is possibly 'null'. PrimeReact limitation.
                    onClick={(e) => audit.current.toggle(e)}
                />
            </div>
            <OverlayPanel
                ref={audit}
                breakpoints={{ "960px": "75vw", "640px": "95vw" }}
                style={{ width: "50vw" }}
            >
                <DataTable className="p-datatable-sm" value={[target]}>
                    {dynamicColumns}
                </DataTable>
            </OverlayPanel>
        </React.Fragment>
    );
}

export default AuditButton;
