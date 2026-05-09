import React, { useRef } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { DataTable, DataTableValue } from "primereact/datatable";
import C from "../../utils/constants";

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
        return <div className="ml-3">{rowData.dat_incl_reg}</div>;
    };

    const usrInclBodyTemplate = (rowData: T) => {
        return <div className="ml-3">{rowData.ch_usr_incl_reg}</div>;
    };

    const dataAltlBodyTemplate = (rowData: T) => {
        return <div className="ml-3">{rowData.dat_alt_reg}</div>;
    };

    const usrAltlBodyTemplate = (rowData: T) => {
        return <div className="ml-3">{rowData.ch_usr_alt_reg}</div>;
    };

    const columns = [
        {
            field: "dat_incl_reg",
            header: C.DATA_INCLUSAO,
            body: dataInclBodyTemplate,
        },
        {
            field: "ch_usr_incl_reg",
            header: C.USUARIO_INCLUSAO,
            body: usrInclBodyTemplate,
        },
    ];
    if (alteracao) {
        columns.push(
            {
                field: "dat_alt_reg",
                header: C.DATA_ALTERACAO,
                body: dataAltlBodyTemplate,
            },
            {
                field: "ch_usr_alt_reg",
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
