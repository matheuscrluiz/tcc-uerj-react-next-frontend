import React, { useState, useEffect } from "react";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import C from "../../utils/constants";

interface EditDialogProps {
    onSave: Function;
    data: TipoDocumentoReferencia;
    body: Function;
    type: string;
}

interface TipoDocumentoReferencia {
    tip_doc_ref_id: number;
    dsc_doc_ref: string;
    dat_incl_reg: string;
    ch_usr_incl_reg: string;
}

function EditDialog({ data, onSave, type, body }: EditDialogProps) {
    const [rowData, setRowData] = useState(data);
    const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true);
    const [corpo, setCorpo] = useState(null);

    // useEffect(()=> console.log(body?.props.children) ,[]);

    useEffect(() => {
        setCorpo(body(rowData, setRowData));
    });

    useEffect(() => {
        setIsSaveDisabled(rowData.dsc_doc_ref.trim() == "");
    }, [rowData]);

    const editDialogFooter = (
        <React.Fragment>
            <Button
                label={C.CANCELAR}
                icon="pi pi-times"
                className="p-button-text p-button-danger"
                onClick={() => {
                    // Teste sem redux
                    setIsEditDialogVisible(false);
                }}
            />
            <Button
                label={C.SALVAR}
                icon="pi pi-check"
                className="p-button-text"
                disabled={isSaveDisabled}
                onClick={() => onSave(rowData)}
            />
        </React.Fragment>
    );

    return (
        <React.Fragment>
            {type === "edit" ? (
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text p-d-sm-inline-flex"
                    // style={styleButtons}
                    onClick={() => {
                        setIsEditDialogVisible(true);
                    }}
                />
            ) : (
                <Button
                    className="p-button-text"
                    label={C.ADICIONAR}
                    icon="pi pi-plus"
                    onClick={() => setIsEditDialogVisible(true)}
                />
            )}
            <Dialog
                visible={isEditDialogVisible}
                breakpoints={{ "960px": "75vw", "640px": "95vw" }}
                style={{ width: "50vw" }}
                header={C.TIPO_DOCUMENTO_DE_REFERENCIA}
                modal
                className="p-fluid"
                footer={editDialogFooter}
                onHide={() => setIsEditDialogVisible(false)}
            >
                {corpo || null}
                {/* <div className="my-2">{C.DESC_DOCUMENTO_DE_REFERENCIA}</div>
        <InputTextarea
          value={rowData.dsc_doc_ref}
          autoResize
          onChange={(e) => {setRowData({...rowData, dsc_doc_ref: e.target.value})}}
          placeholder={C.SELECIONE_DESC_DOCUMENTO_DE_REFERENCIA}
          maxLength={100}
          /> */}
            </Dialog>
        </React.Fragment>
    );
}

export default EditDialog;
