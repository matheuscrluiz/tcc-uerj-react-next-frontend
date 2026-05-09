import React, { useState } from "react";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import C from "../../utils/constants";
import { DataTableValue } from "primereact/datatable";

interface DeleteDialogProps<T> {
    onDelete: (rowData: T) => void;
    msg: React.ReactNode;
    target: T;
}

function DeleteDialog<T extends DataTableValue>({
    target,
    msg,
    onDelete,
}: DeleteDialogProps<T>) {
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

    const deleteDialogFooter = (
        <React.Fragment>
            <Button
                aria-label={C.CANCELAR}
                label={C.CANCELAR}
                icon="pi pi-times"
                className="p-button-text p-button-danger"
                onClick={() => setIsDeleteDialogVisible(false)}
            />
            <Button
                aria-label={C.EXCLUIR}
                label={C.EXCLUIR}
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    onDelete(target);
                    setIsDeleteDialogVisible(false);
                }}
            />
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <Button
                aria-label={C.EXCLUIR}
                icon="pi pi-trash"
                className="p-button-rounded p-button-text p-button-danger flex"
                tooltip="Remover"
                tooltipOptions={{ position: "left" }}
                onClick={() => setIsDeleteDialogVisible(true)}
            />

            <Dialog
                visible={isDeleteDialogVisible}
                header={C.ATENCAO}
                breakpoints={{ "960px": "75vw", "640px": "95vw" }}
                style={{ width: "50vw" }}
                modal
                footer={deleteDialogFooter}
                onHide={() => setIsDeleteDialogVisible(false)}
            >
                <div className="confirmation-content">
                    {msg}
                    {/* {C.MSG_APAGAR} <span className="font-bold">{msg}</span> ? */}
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default DeleteDialog;
