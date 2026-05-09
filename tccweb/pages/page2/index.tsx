export default function Page2(){
  return <>OI!</>

}
// import React, { useState, useEffect, FormEvent } from "react";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { Category } from "../../models/category_models";
// import { Button } from "primereact/button";
// import { Dialog } from "primereact/dialog";
// import { InputText } from "primereact/inputtext";
// import C from "../../utils/constants";
// import { IconField } from "primereact/iconfield";
// import { InputIcon } from "primereact/inputicon";
// import Service from "../../services/categoria_service";
// import { TabPanel, TabView } from "primereact/tabview";


// export default function Page2() {
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [income, setIncome] = useState<Category[]>([]);
//     const [expense, setExpense] = useState<Category[]>([]);
//     const [globalFilter, setGlobalFilter] = useState<string>("");
//     const [visible, setVisible] = useState<boolean>(false);
//     const service = new Service()

//     useEffect(() => {
//         init()
//     }, []);

//     const init = async () => {
//         try {
//             const response = await service.getData()
//             const {income, outgoing} = FilterCategoryByType(response.data_return)
//             setIncome(income)
//             setExpense(outgoing)
//         } catch (error) {

//         }
//     }

//     const FilterCategoryByType = (data: Category[]) => {
//         const income = data.filter((inc => inc.tipo_categoria === 'Receita'))
//         const outgoing = data.filter((inc => inc.tipo_categoria === 'Despesa'))

//         return {income, outgoing}
//     }
//     const onFormSubmit = (e: FormEvent) => {
//         try {
//             e.preventDefault();
//         } catch (error) {
//             // Erro
//         }
//     };

//     const onDialogHide = () => setVisible(false);

//     const dialogFooter = (
//         <>
//             <Button
//                 label={C.CANCELAR}
//                 icon="pi pi-times"
//                 className="p-button-danger"
//                 onClick={onDialogHide}
//             />
//             <Button
//                 label={C.SALVAR}
//                 icon="pi pi-check"
//                 type="submit"
//                 form="editForm"
//             />
//         </>
//     );

//     const tableHeader = (
//         <div className="flex justify-content-between align-items-center">
//             <span>Pessoas</span>
//             <div className="flex">
//                 <Button
//                     label={C.ADICIONAR}
//                     icon="pi pi-plus"
//                     iconPos="right"
//                     rounded
//                     className="mr-2"
//                     onClick={() => setVisible(true)}
//                 />
//                 <IconField iconPosition="left">
//                     <InputIcon className="pi pi-search"> </InputIcon>
//                     <InputText
//                         type="search"
//                         value={globalFilter}
//                         onInput={(e) =>
//                             setGlobalFilter(
//                                 (e.target as HTMLInputElement).value
//                             )
//                         }
//                         placeholder={C.BUSCAR}
//                     />
//                 </IconField>
//             </div>
//         </div>
//     );

//     return (
//         <TabView>
//             <TabPanel header="Entradas" leftIcon="pi pi-book mr-1">
//                 <DataTable
//                 value={income}
//                 header={tableHeader}
//                 globalFilter={globalFilter}
//                 rows={5}
//                 paginator
//                 rowsPerPageOptions={[5, 10, 25, 50]}
//             >
//                 <Column field="id_categoria" header="Name" />
//                 <Column field="dsc_categoria" header="Country" />
//                 <Column field="tipo_categoria" header="Company" />
//                 <Column field="representative" header="Representative" />
//             </DataTable>
//             </TabPanel>
//             <TabPanel header='Despesas'>

//             <DataTable
//                 value={expense}
//                 header={tableHeader}
//                 globalFilter={globalFilter}
//                 rows={5}
//                 paginator
//                 rowsPerPageOptions={[5, 10, 25, 50]}
//             >
//                 <Column field="id_categoria" header="Name" />
//                 <Column field="dsc_categoria" header="Country" />
//                 <Column field="tipo_categoria" header="Company" />
//                 <Column field="representative" header="Representative" />
//             </DataTable>
//             </TabPanel>
//             <Dialog
//                 onHide={onDialogHide}
//                 visible={visible}
//                 header="Nova pessoa"
//                 footer={dialogFooter}
//             >
//                 <form onSubmit={onFormSubmit} className="formgrid grid">
//                     <div className="field p-fluid col-6">
//                         <label htmlFor="name">Name</label>
//                         <InputText id="name" />
//                     </div>
//                     <div className="field p-fluid col-6">
//                         <label htmlFor="country">Country</label>
//                         <InputText id="country" />
//                     </div>
//                     <div className="field p-fluid col-6">
//                         <label htmlFor="company">Company</label>
//                         <InputText id="company" />
//                     </div>
//                     <div className="field p-fluid col-6">
//                         <label htmlFor="representative">Representative</label>
//                         <InputText id="representative" />
//                     </div>
//                 </form>
//             </Dialog>
//         </TabView>
//     );
// }
