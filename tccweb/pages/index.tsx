// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import ReceitaService from "../services/receita_service";
// import DespesaService from "../services/despesa_service";
// import { Receitas, ReceitaParametros } from "../models/receita_model";
// import { Despesas, DespesasParametros } from "../models/despesa_model";
// import { createReceitaParametros } from "../models/receitaParametros.factory";
// import {
//     convertColumnToDate,
//     formatCurrency,
//     formatViewDate,
//     showMessageError,
// } from "../utils/utils";
// import { Card } from "primereact/card";
// import { Skeleton } from "primereact/skeleton";
// import { Toast } from "primereact/toast";
// import { Chart } from "primereact/chart";
// import { useRef } from "react";

// export default function Home() {
//     // States de Receita
//     const [incomes, setIncomes] = useState<Receitas[]>([]);
//     const [totalIncome, setTotalIncome] = useState<number>(0);
//     const [loadingIncome, setLoadingIncome] = useState<boolean>(false);
//     const [hasInitializedIncome, setHasInitializedIncome] = useState(false);
//     const [incomeParameters, setIncomeParameters] = useState<ReceitaParametros>(
//         createReceitaParametros
//     );

//     // States de Despesa
//     const [expenses, setExpenses] = useState<Despesas[]>([]);
//     const [totalExpenses, setTotalExpenses] = useState<number>(0);
//     const [loadingExpense, setLoadingExpense] = useState<boolean>(false);
//     const [hasInitializedExpense, setHasInitializedExpense] = useState(false);
//     const [expenseParameters, setExpenseParameters] =
//         useState<DespesasParametros>(createReceitaParametros);

//     const { data: session, status } = useSession();
//     const receitaService = new ReceitaService();
//     const despesaService = new DespesaService();
//     const toast = useRef<Toast>(null);

//     useEffect(() => {
//         if (session && !hasInitializedIncome) {
//             fetchMonthlyIncome();
//             setHasInitializedIncome(true);
//         }
//     }, [status, session, hasInitializedIncome]);

//     useEffect(() => {
//         if (session && !hasInitializedExpense) {
//             fetchMonthlyExpenses();
//             setHasInitializedExpense(true);
//         }
//     }, [status, session, hasInitializedExpense]);

//     const fetchMonthlyIncome = async () => {
//         try {
//             setLoadingIncome(true);
//             const updateSearch: ReceitaParametros = {
//                 tipoFiltro: "MES",
//                 dataDia: formatViewDate(incomeParameters.dataDia as Date),
//                 mesInicial: formatViewDate(incomeParameters.mesInicial as Date),
//                 mesFinal: formatViewDate(incomeParameters.mesFinal as Date),
//                 ano: formatViewDate(incomeParameters.ano as Date),
//                 ch_rede: session?.user.ch_rede as string,
//             };
//             const response = await receitaService.getIncomes(updateSearch);
//             const _response = convertColumnToDate(response.data_return, [
//                 "data_recebimento",
//             ]) as Receitas[];

//             setIncomes(_response);
//             const total = _response.reduce(
//                 (sum, income) => sum + income.valor,
//                 0
//             );
//             setTotalIncome(total);
//         } catch (error) {
//             showMessageError(error, toast);
//         } finally {
//             setLoadingIncome(false);
//         }
//     };

//     const fetchMonthlyExpenses = async () => {
//         try {
//             setLoadingExpense(true);
//             const updateSearch: DespesasParametros = {
//                 tipoFiltro: "MES",
//                 dataDia: formatViewDate(expenseParameters.dataDia as Date),
//                 mesInicial: formatViewDate(
//                     expenseParameters.mesInicial as Date
//                 ),
//                 mesFinal: formatViewDate(expenseParameters.mesFinal as Date),
//                 ano: formatViewDate(expenseParameters.ano as Date),
//                 ch_rede: session?.user.ch_rede as string,
//             };
//             const response = await despesaService.getExpenses(updateSearch);
//             const _response = convertColumnToDate(response.data_return, [
//                 "data_despesa",
//             ]) as Despesas[];

//             setExpenses(_response);
//             const total = _response.reduce(
//                 (sum, expense) => sum + expense.valor_total,
//                 0
//             );
//             setTotalExpenses(total);
//         } catch (error) {
//             showMessageError(error, toast);
//         } finally {
//             setLoadingExpense(false);
//         }
//     };

//     const currentMonth = new Date().toLocaleString("pt-BR", {
//         month: "long",
//         year: "numeric",
//     });

//     const getChartData = () => {
//         const categoriesMap: { [key: string]: number } = {};

//         incomes.forEach((income) => {
//             if (categoriesMap[income.dsc_categoria]) {
//                 categoriesMap[income.dsc_categoria] += income.valor;
//             } else {
//                 categoriesMap[income.dsc_categoria] = income.valor;
//             }
//         });

//         const labels = Object.keys(categoriesMap);
//         const data = Object.values(categoriesMap);

//         return {
//             labels,
//             datasets: [
//                 {
//                     label: "Receita por Categoria (R$)",
//                     data,
//                     backgroundColor: "#3b82f6",
//                     borderColor: "#1e40af",
//                     borderWidth: 1,
//                     borderRadius: 6,
//                     borderSkipped: false,
//                 },
//             ],
//         };
//     };

//     const getExpenseChartData = () => {
//         const categoriesMap: { [key: string]: number } = {};

//         expenses.forEach((expense) => {
//             if (categoriesMap[expense.dsc_categoria]) {
//                 categoriesMap[expense.dsc_categoria] += expense.valor_total;
//             } else {
//                 categoriesMap[expense.dsc_categoria] = expense.valor_total;
//             }
//         });

//         const labels = Object.keys(categoriesMap);
//         const data = Object.values(categoriesMap);

//         return {
//             labels,
//             datasets: [
//                 {
//                     label: "Despesa por Categoria (R$)",
//                     data,
//                     backgroundColor: "#ef4444",
//                     borderColor: "#991b1b",
//                     borderWidth: 1,
//                     borderRadius: 6,
//                     borderSkipped: false,
//                 },
//             ],
//         };
//     };

//     const getAccumulatedChartData = () => {
//         const sortedIncomes = [...incomes].sort((a, b) => {
//             const dateA = new Date(a.data_recebimento || "");
//             const dateB = new Date(b.data_recebimento || "");
//             return dateA.getTime() - dateB.getTime();
//         });

//         const daysMap: { [key: string]: number } = {};
//         let accumulated = 0;

//         sortedIncomes.forEach((income) => {
//             const date = new Date(income.data_recebimento || "");
//             const day = date.getDate();
//             accumulated += income.valor;
//             daysMap[day] = accumulated;
//         });

//         const labels = Object.keys(daysMap).map((day) => `Dia ${day}`);
//         const data = Object.values(daysMap);

//         return {
//             labels,
//             datasets: [
//                 {
//                     label: "Receita Acumulada (R$)",
//                     data,
//                     borderColor: "#10b981",
//                     backgroundColor: "rgba(16, 185, 129, 0.1)",
//                     fill: true,
//                     tension: 0.4,
//                     borderWidth: 3,
//                     pointRadius: 5,
//                     pointBackgroundColor: "#10b981",
//                     pointBorderColor: "#fff",
//                     pointBorderWidth: 2,
//                     pointHoverRadius: 7,
//                 },
//             ],
//         };
//     };

//     const getExpenseAccumulatedChartData = () => {
//         const sortedExpenses = [...expenses].sort((a, b) => {
//             const dateA = new Date(a.data_despesa || "");
//             const dateB = new Date(b.data_despesa || "");
//             return dateA.getTime() - dateB.getTime();
//         });

//         const daysMap: { [key: string]: number } = {};
//         let accumulated = 0;

//         sortedExpenses.forEach((expense) => {
//             const date = new Date(expense.data_despesa || "");
//             const day = date.getDate();
//             accumulated += expense.valor_total;
//             daysMap[day] = accumulated;
//         });

//         const labels = Object.keys(daysMap).map((day) => `Dia ${day}`);
//         const data = Object.values(daysMap);

//         return {
//             labels,
//             datasets: [
//                 {
//                     label: "Despesa Acumulada (R$)",
//                     data,
//                     borderColor: "#f59e0b",
//                     backgroundColor: "rgba(245, 158, 11, 0.1)",
//                     fill: true,
//                     tension: 0.4,
//                     borderWidth: 3,
//                     pointRadius: 5,
//                     pointBackgroundColor: "#f59e0b",
//                     pointBorderColor: "#fff",
//                     pointBorderWidth: 2,
//                     pointHoverRadius: 7,
//                 },
//             ],
//         };
//     };

//     const chartOptions = {
//         responsive: true,
//         maintainAspectRatio: true,
//         plugins: {
//             legend: {
//                 display: true,
//                 position: "top" as const,
//                 labels: {
//                     font: {
//                         size: 12,
//                         weight: "600" as const,
//                     },
//                     padding: 15,
//                     usePointStyle: true,
//                 },
//             },
//             tooltip: {
//                 backgroundColor: "rgba(0, 0, 0, 0.8)",
//                 padding: 12,
//                 titleFont: {
//                     size: 13,
//                     weight: "bold" as const,
//                 },
//                 bodyFont: {
//                     size: 12,
//                 },
//                 borderColor: "#10b981",
//                 borderWidth: 1,
//             },
//         },
//         scales: {
//             y: {
//                 beginAtZero: true,
//                 ticks: {
//                     callback: function (value: any) {
//                         return "R$ " + value.toLocaleString("pt-BR");
//                     },
//                     font: {
//                         size: 11,
//                     },
//                 },
//                 grid: {
//                     color: "rgba(0, 0, 0, 0.05)",
//                     drawBorder: false,
//                 },
//             },
//             x: {
//                 ticks: {
//                     font: {
//                         size: 11,
//                     },
//                 },
//                 grid: {
//                     display: false,
//                     drawBorder: false,
//                 },
//             },
//         },
//     };

//     const cardHeader = (
//         <div className="flex align-items-center justify-content-between p-4 bg-gradient-blue">
//             <div>
//                 <h2 className=" m-0 font-bold">Receitas do Mês</h2>
//                 <p className=" m-0 mt-2 text-sm">
//                     {currentMonth.charAt(0).toUpperCase() +
//                         currentMonth.slice(1)}
//                 </p>
//             </div>
//             <i className="pi pi-dollar " style={{ fontSize: "2rem" }}></i>
//         </div>
//     );

//     const cardHeaderExpense = (
//         <div className="flex align-items-center justify-content-between p-4 bg-gradient-red">
//             <div>
//                 <h2 className=" m-0 font-bold">Despesas do Mês</h2>
//                 <p className=" m-0 mt-2 text-sm">
//                     {currentMonth.charAt(0).toUpperCase() +
//                         currentMonth.slice(1)}
//                 </p>
//             </div>
//             <i className="pi pi-times " style={{ fontSize: "2rem" }}></i>
//         </div>
//     );

//     return (
//         <div className="min-h-screen p-4 md:p-6 bg-gray-50">
//             <Toast ref={toast} />

//             {/* ============= SEÇÃO DE RECEITAS ============= */}
//             <div className="mb-8">
//                 <h1 className="text-3xl font-bold mb-6 text-gray-800">
//                     Dashboard Financeiro
//                 </h1>

//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
//                     <div className="lg:col-span-4">
//                         <Card header={cardHeader} className="shadow-2">
//                             <div className="flex flex-column gap-4">
//                                 {loadingIncome ? (
//                                     <Skeleton
//                                         height="4rem"
//                                         className="mb-2"
//                                     ></Skeleton>
//                                 ) : (
//                                     <div className="flex flex-wrap align-items-center gap-4">
//                                         <div>
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Valor Total
//                                             </p>
//                                             <h1 className="text-4xl font-bold m-0 mt-2 text-green-600">
//                                                 {formatCurrency(
//                                                     totalIncome,
//                                                     "BRL"
//                                                 )}
//                                             </h1>
//                                         </div>
//                                         <div className="ml-auto">
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Quantidade de Receitas
//                                             </p>
//                                             <h2 className="text-3xl font-bold m-0 mt-2 text-blue-600">
//                                                 {incomes.length}
//                                             </h2>
//                                         </div>
//                                         <div className="ml-auto">
//                                             <i
//                                                 className="pi pi-calculator text-blue-600 mb-3"
//                                                 style={{ fontSize: "2rem" }}
//                                             ></i>
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Média
//                                             </p>
//                                             <h2 className="text-3xl font-bold m-0 mt-2 text-blue-600">
//                                                 {formatCurrency(
//                                                     incomes.length > 0
//                                                         ? totalIncome /
//                                                               incomes.length
//                                                         : 0,
//                                                     "BRL"
//                                                 )}
//                                             </h2>
//                                         </div>
//                                         <div className="ml-auto">
//                                             <i
//                                                 className="pi pi-arrow-up text-green-600 mb-3"
//                                                 style={{ fontSize: "2rem" }}
//                                             ></i>
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Maior Receita
//                                             </p>
//                                             <h2 className="text-3xl font-bold m-0 mt-2 text-blue-600">
//                                                 {formatCurrency(
//                                                     incomes.length > 0
//                                                         ? Math.max(
//                                                               ...incomes.map(
//                                                                   (i) => i.valor
//                                                               )
//                                                           )
//                                                         : 0,
//                                                     "BRL"
//                                                 )}
//                                             </h2>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </Card>
//                     </div>
//                 </div>

//                 {!loadingIncome && incomes.length > 0 && (
//                     <div className="grid grid-cols-1 gap-6">
//                         <Card className="shadow-2">
//                             <h3 className="text-xl font-bold mb-4 text-gray-700">
//                                 Receita por Categoria
//                             </h3>
//                             <Chart
//                                 type="bar"
//                                 data={getChartData()}
//                                 options={chartOptions}
//                             />
//                         </Card>

//                         <Card className="shadow-2">
//                             <h3 className="text-xl font-bold mb-4 text-gray-700">
//                                 Receita Acumulada no Mês
//                             </h3>
//                             <Chart
//                                 type="line"
//                                 data={getAccumulatedChartData()}
//                                 options={chartOptions}
//                             />
//                         </Card>

//                         <Card className="shadow-2">
//                             <h3 className="text-xl font-bold mb-4 text-gray-700">
//                                 Detalhes das Receitas
//                             </h3>
//                             <div
//                                 className="flex flex-column gap-3"
//                                 style={{
//                                     maxHeight: "500px",
//                                     overflowY: "auto",
//                                 }}
//                             >
//                                 {incomes.map((income, index) => (
//                                     <div
//                                         key={index}
//                                         className="flex justify-content-between align-items-center p-3 border-bottom-1 border-gray-200 hover:bg-gray-50 transition-all"
//                                     >
//                                         <div className="flex flex-column gap-1">
//                                             <span className="font-semibold text-gray-800">
//                                                 {income.dsc_receita}
//                                             </span>
//                                             <span className="text-sm text-gray-500">
//                                                 {income.dsc_categoria}
//                                             </span>
//                                         </div>
//                                         <span className="font-bold text-green-600">
//                                             {formatCurrency(
//                                                 income.valor,
//                                                 "BRL"
//                                             )}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </Card>
//                     </div>
//                 )}

//                 {!loadingIncome && incomes.length === 0 && (
//                     <div className="text-center p-6">
//                         <i className="pi pi-inbox text-5xl text-gray-300 mb-3"></i>
//                         <p className="text-gray-500 text-lg">
//                             Nenhuma receita registrada para este mês.
//                         </p>
//                     </div>
//                 )}
//             </div>

//             {/* ============= SEÇÃO DE DESPESAS ============= */}
//             <div>
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
//                     <div className="lg:col-span-4">
//                         <Card header={cardHeaderExpense} className="shadow-2">
//                             <div className="flex flex-column gap-4">
//                                 {loadingExpense ? (
//                                     <Skeleton
//                                         height="4rem"
//                                         className="mb-2"
//                                     ></Skeleton>
//                                 ) : (
//                                     <div className="flex flex-wrap align-items-center gap-4">
//                                         <div>
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Valor Total
//                                             </p>
//                                             <h1 className="text-4xl font-bold m-0 mt-2 text-red-600">
//                                                 {formatCurrency(
//                                                     totalExpenses,
//                                                     "BRL"
//                                                 )}
//                                             </h1>
//                                         </div>
//                                         <div className="ml-auto">
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Quantidade de Despesas
//                                             </p>
//                                             <h2 className="text-3xl font-bold m-0 mt-2 text-orange-600">
//                                                 {expenses.length}
//                                             </h2>
//                                         </div>
//                                         <div className="ml-auto">
//                                             <i
//                                                 className="pi pi-calculator text-orange-600 mb-3"
//                                                 style={{ fontSize: "2rem" }}
//                                             ></i>
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Média
//                                             </p>
//                                             <h2 className="text-3xl font-bold m-0 mt-2 text-orange-600">
//                                                 {formatCurrency(
//                                                     expenses.length > 0
//                                                         ? totalExpenses /
//                                                               expenses.length
//                                                         : 0,
//                                                     "BRL"
//                                                 )}
//                                             </h2>
//                                         </div>
//                                         <div className="ml-auto">
//                                             <i
//                                                 className="pi pi-arrow-down text-red-600 mb-3"
//                                                 style={{ fontSize: "2rem" }}
//                                             ></i>
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Maior Despesa
//                                             </p>
//                                             <h2 className="text-3xl font-bold m-0 mt-2 text-orange-600">
//                                                 {formatCurrency(
//                                                     expenses.length > 0
//                                                         ? Math.max(
//                                                               ...expenses.map(
//                                                                   (e) =>
//                                                                       e.valor_total
//                                                               )
//                                                           )
//                                                         : 0,
//                                                     "BRL"
//                                                 )}
//                                             </h2>
//                                         </div>
//                                         <div className="ml-auto">
//                                             <i
//                                                 className="pi pi-trending-up text-purple-600 mb-3"
//                                                 style={{ fontSize: "2rem" }}
//                                             ></i>
//                                             <p className="text-gray-600 m-0 text-sm font-medium">
//                                                 Saldo do Mês
//                                             </p>
//                                             <h2
//                                                 className={`text-3xl font-bold m-0 mt-2 ${totalIncome - totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
//                                             >
//                                                 {formatCurrency(
//                                                     totalIncome - totalExpenses,
//                                                     "BRL"
//                                                 )}
//                                             </h2>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </Card>
//                     </div>
//                 </div>

//                 {!loadingExpense && expenses.length > 0 && (
//                     <div className="grid grid-cols-1 gap-6">
//                         <Card className="shadow-2">
//                             <h3 className="text-xl font-bold mb-4 text-gray-700">
//                                 Despesa por Categoria
//                             </h3>
//                             <Chart
//                                 type="bar"
//                                 data={getExpenseChartData()}
//                                 options={chartOptions}
//                             />
//                         </Card>

//                         <Card className="shadow-2">
//                             <h3 className="text-xl font-bold mb-4 text-gray-700">
//                                 Despesa Acumulada no Mês
//                             </h3>
//                             <Chart
//                                 type="line"
//                                 data={getExpenseAccumulatedChartData()}
//                                 options={chartOptions}
//                             />
//                         </Card>

//                         <Card className="shadow-2">
//                             <h3 className="text-xl font-bold mb-4 text-gray-700">
//                                 Detalhes das Despesas
//                             </h3>
//                             <div
//                                 className="flex flex-column gap-3"
//                                 style={{
//                                     maxHeight: "500px",
//                                     overflowY: "auto",
//                                 }}
//                             >
//                                 {expenses.map((expense, index) => (
//                                     <div
//                                         key={index}
//                                         className="flex justify-content-between align-items-center p-3 border-bottom-1 border-gray-200 hover:bg-gray-50 transition-all"
//                                     >
//                                         <div className="flex flex-column gap-1">
//                                             <span className="font-semibold text-gray-800">
//                                                 {expense.dsc_despesa}
//                                             </span>
//                                             <span className="text-sm text-gray-500">
//                                                 {expense.dsc_categoria}
//                                             </span>
//                                             <span className="text-xs text-gray-400">
//                                                 {expense.dsc_meio_pagamento} •{" "}
//                                                 {expense.ch_rede}
//                                             </span>
//                                         </div>
//                                         <div className="flex flex-column align-items-end gap-2">
//                                             <span className="font-bold text-red-600">
//                                                 {formatCurrency(
//                                                     expense.valor_total,
//                                                     "BRL"
//                                                 )}
//                                             </span>
//                                             <div className="flex gap-2">
//                                                 <span
//                                                     className={`text-xs px-2 py-1 border-round ${expense.parcelada === "S" ? "bg-blue-50 text-blue-700 border-1 border-blue-200" : "bg-gray-50 text-gray-500"}`}
//                                                 >
//                                                     {expense.parcelada === "S"
//                                                         ? "Parcelada"
//                                                         : "À vista"}
//                                                 </span>
//                                                 <span
//                                                     className={`text-xs px-2 py-1 border-round ${expense.pago === "S" ? "bg-green-50 text-green-700 border-1 border-green-200" : "bg-yellow-50 text-yellow-700 border-1 border-yellow-200"}`}
//                                                 >
//                                                     {expense.pago === "S"
//                                                         ? "Pago"
//                                                         : "Pendente"}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </Card>
//                     </div>
//                 )}

//                 {!loadingExpense && expenses.length === 0 && (
//                     <div className="text-center p-6">
//                         <i className="pi pi-inbox text-5xl text-gray-300 mb-3"></i>
//                         <p className="text-gray-500 text-lg">
//                             Nenhuma despesa registrada para este mês.
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";

import ReceitaService from "../services/receita_service";
import DespesaService from "../services/despesa_service";

import { Receitas, ReceitaParametros } from "../models/receita_model";
import { Despesas, DespesasParametros } from "../models/despesa_model";
import { createReceitaParametros } from "../models/receitaParametros.factory";

import {
    convertColumnToDate,
    formatCurrency,
    formatViewDate,
    showMessageError,
} from "../utils/utils";

export default function Home() {
    /* ===================== STATE ===================== */
    const [incomes, setIncomes] = useState<Receitas[]>([]);
    const [expenses, setExpenses] = useState<Despesas[]>([]);

    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const [loadingIncome, setLoadingIncome] = useState(false);
    const [loadingExpense, setLoadingExpense] = useState(false);

    const [hasInitializedIncome, setHasInitializedIncome] = useState(false);
    const [hasInitializedExpense, setHasInitializedExpense] = useState(false);

    const [incomeParameters] = useState<ReceitaParametros>(
        createReceitaParametros
    );
    const [expenseParameters] = useState<DespesasParametros>(
        createReceitaParametros
    );

    const [totalIncomePrev, setTotalIncomePrev] = useState(0);
    const [totalExpensesPrev, setTotalExpensesPrev] = useState(0);

    const saldoPrev = totalIncomePrev - totalExpensesPrev;

    const { data: session, status } = useSession();
    const receitaService = new ReceitaService();
    const despesaService = new DespesaService();
    const toast = useRef<Toast>(null);

    /* ===================== EFFECTS ===================== */
    useEffect(() => {
        if (session && !hasInitializedIncome) {
            fetchMonthlyIncome();
            fetchPreviousMonthIncome();
            setHasInitializedIncome(true);
        }
    }, [status, session]);

    useEffect(() => {
        if (session && !hasInitializedExpense) {
            fetchMonthlyExpenses();
            fetchPreviousMonthExpenses();

            setHasInitializedExpense(true);
        }
    }, [status, session]);

    /* ===================== DATA ===================== */
    const fetchMonthlyIncome = async () => {
        try {
            setLoadingIncome(true);
            const params: ReceitaParametros = {
                tipoFiltro: "MES",
                dataDia: formatViewDate(incomeParameters.dataDia as Date),
                mesInicial: formatViewDate(incomeParameters.mesInicial as Date),
                mesFinal: formatViewDate(incomeParameters.mesFinal as Date),
                ano: formatViewDate(incomeParameters.ano as Date),
                ch_rede: session?.user.ch_rede as string,
            };

            const response = await receitaService.getIncomes(params);
            const data = convertColumnToDate(response.data_return, [
                "data_recebimento",
            ]) as Receitas[];

            setIncomes(data);
            setTotalIncome(
                data.reduce((sum, i) => sum + (i.valor as number), 0)
            );
        } catch (e) {
            showMessageError(e, toast);
        } finally {
            setLoadingIncome(false);
        }
    };

    const fetchMonthlyExpenses = async () => {
        try {
            setLoadingExpense(true);
            const params: DespesasParametros = {
                tipoFiltro: "MES",
                dataDia: formatViewDate(expenseParameters.dataDia as Date),
                mesInicial: formatViewDate(
                    expenseParameters.mesInicial as Date
                ),
                mesFinal: formatViewDate(expenseParameters.mesFinal as Date),
                ano: formatViewDate(expenseParameters.ano as Date),
                ch_rede: session?.user.ch_rede as string,
            };

            const response = await despesaService.getExpenses(params);
            const data = convertColumnToDate(response.data_return, [
                "data_despesa",
            ]) as Despesas[];

            setExpenses(data);
            setTotalExpenses(
                data.reduce((sum, e) => sum + (e.valor_total as number), 0)
            );
        } catch (e) {
            showMessageError(e, toast);
        } finally {
            setLoadingExpense(false);
        }
    };

    const fetchPreviousMonthIncome = async () => {
        try {
            const prevMonth = getPreviousMonth(new Date());

            const params: ReceitaParametros = {
                tipoFiltro: "MES",
                mesInicial: formatViewDate(prevMonth),
                mesFinal: formatViewDate(prevMonth),
                ano: formatViewDate(prevMonth),
                ch_rede: session?.user.ch_rede as string,
            };

            const response = await receitaService.getIncomes(params);
            const data = convertColumnToDate(response.data_return, [
                "data_recebimento",
            ]) as Receitas[];

            setTotalIncomePrev(
                data.reduce((sum, i) => sum + (i.valor as number), 0)
            );
        } catch (e) {
            showMessageError(e, toast);
        }
    };

    const fetchPreviousMonthExpenses = async () => {
        try {
            const prevMonth = getPreviousMonth(new Date());

            const params: DespesasParametros = {
                tipoFiltro: "MES",
                mesInicial: formatViewDate(prevMonth),
                mesFinal: formatViewDate(prevMonth),
                ano: formatViewDate(prevMonth),
                ch_rede: session?.user.ch_rede as string,
            };

            const response = await despesaService.getExpenses(params);
            const data = convertColumnToDate(response.data_return, [
                "data_despesa",
            ]) as Despesas[];

            setTotalExpensesPrev(
                data.reduce((sum, e) => sum + (e.valor_total as number), 0)
            );
        } catch (e) {
            showMessageError(e, toast);
        }
    };

    /* ===================== HELPERS ===================== */
    const currentMonth = new Date().toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const saldo = totalIncome - totalExpenses;

    const getPreviousMonth = (date: Date) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() - 1);
        return d;
    };

    const saldoAtual = totalIncome - totalExpenses;
    const saldoAnterior = totalIncomePrev - totalExpensesPrev;

    const variacaoSaldo = saldoAtual - saldoAnterior;

    const percentualVariacao =
        saldoAnterior !== 0
            ? (variacaoSaldo / Math.abs(saldoAnterior)) * 100
            : 0;

    /* ===================== CHARTS ===================== */
    const buildCategoryChart = (
        items: any[],
        valueKey: string,
        label: string,
        color: string
    ) => {
        const map: Record<string, number> = {};
        items.forEach((i) => {
            map[i.dsc_categoria] = (map[i.dsc_categoria] || 0) + i[valueKey];
        });

        return {
            labels: Object.keys(map),
            datasets: [
                {
                    label,
                    data: Object.values(map),
                    backgroundColor: color,
                    borderRadius: 6,
                },
            ],
        };
    };
    const getExpenseAccumulatedChartData = () => {
        const sortedExpenses = [...expenses].sort((a, b) => {
            const dateA = new Date(a.data_despesa || "");
            const dateB = new Date(b.data_despesa || "");
            return dateA.getTime() - dateB.getTime();
        });

        const daysMap: { [key: string]: number } = {};
        let accumulated = 0;

        sortedExpenses.forEach((expense) => {
            const date = new Date(expense.data_despesa || "");
            const day = date.getDate();
            accumulated += expense.valor_total as number;
            daysMap[day] = accumulated;
        });

        const labels = Object.keys(daysMap).map((day) => `Dia ${day}`);
        const data = Object.values(daysMap);

        return {
            labels,
            datasets: [
                {
                    label: "Despesa Acumulada (R$)",
                    data,
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: "#f59e0b",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                },
            ],
        };
    };

    const buildSaldoEvolution = () => {
        const all = [
            ...incomes.map((i) => ({
                date: new Date(i.data_recebimento!),
                value: i.valor,
            })),
            ...expenses.map((e) => ({
                date: new Date(e.data_despesa!),
                value: -(e.valor_total as number),
            })),
        ].sort((a, b) => a.date.getTime() - b.date.getTime());

        let acc = 0;
        const labels: string[] = [];
        const data: number[] = [];

        all.forEach((item) => {
            acc += item.value as number;
            labels.push(item.date.getDate().toString());
            data.push(acc);
        });

        return {
            labels,
            datasets: [
                {
                    label: "Saldo acumulado",
                    data,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16,185,129,0.15)",
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    };

    const getAccumulatedChartData = () => {
        const sortedIncomes = [...incomes].sort((a, b) => {
            const dateA = new Date(a.data_recebimento || "");
            const dateB = new Date(b.data_recebimento || "");
            return dateA.getTime() - dateB.getTime();
        });

        const daysMap: { [key: string]: number } = {};
        let accumulated = 0;

        sortedIncomes.forEach((income) => {
            const date = new Date(income.data_recebimento || "");
            const day = date.getDate();
            accumulated += income.valor as number;
            daysMap[day] = accumulated;
        });

        const labels = Object.keys(daysMap).map((day) => `Dia ${day}`);
        const data = Object.values(daysMap);

        return {
            labels,
            datasets: [
                {
                    label: "Receita Acumulada (R$)",
                    data,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: "#10b981",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                },
            ],
        };
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                ticks: {
                    stepSize: 1000,
                    callback: (v: any) => "R$ " + v.toLocaleString("pt-BR"),
                },
            },
        },
    };

    return (
        <>
            {/* Header Moderno e Profissional */}
            <Card className="border-none shadow-2 mb-4 overflow-hidden">
                <div className="grid align-items-center">
                    {/* Coluna Esquerda - Branding */}
                    <div className="col-12 md:col-6">
                        <div className="flex align-items-center gap-4">
                            <div
                                className="flex-shrink-0 flex align-items-center justify-content-center border-circle"
                                style={{
                                    width: "72px",
                                    height: "72px",
                                    background:
                                        "linear-gradient(135deg, #666866ff 0%, #84e480ff 100%)",
                                    boxShadow:
                                        "0 8px 24px rgba(1, 4, 17, 0.25)",
                                }}
                            >
                                <i className="pi pi-chart-bar text-white text-3xl"></i>
                            </div>
                            <div className="flex flex-column gap-2">
                                <h1 className="text-4xl font-bold m-0 text-900 line-height-1">
                                    Dashboard
                                </h1>
                                <div className="flex flex-wrap align-items-center gap-2">
                                    <div className="flex align-items-center gap-2 bg-primary-50 border-round px-2 py-1">
                                        <i className="pi pi-calendar text-primary "></i>
                                        <span className="text-primary font-semibold ">
                                            {currentMonth}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita - User Profile */}
                    <div className="col-12 md:col-6 flex justify-content-end">
                        <div className="flex align-items-center gap-3 bg-surface-50 border-round-lg px-4 py-3 w-full md:w-auto">
                            <div
                                className="flex-shrink-0 flex align-items-center justify-content-center border-circle border-2 border-primary-200"
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    background:
                                        "linear-gradient(135deg, #92f0ccff 0%, #0a9649ff 100%)",
                                }}
                            >
                                <span className="text-2xl font-bold text-white">
                                    {session?.user.nome
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-column gap-1 flex-1">
                                <span className="text-500 font-medium">
                                    Bem-vindo,
                                </span>
                                <div className="flex align-items-center gap-2">
                                    <span className="text-xl font-bold text-900">
                                        {session?.user.nome}
                                    </span>
                                    {/* <i className="pi pi-verified text-primary text-sm"></i> */}
                                </div>
                            </div>
                            {/* <i className="pi pi-ellipsis-v text-500 cursor-pointer hover:text-700 transition-colors transition-duration-200"></i> */}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid p-fluid">
                {/* ===================== 1. KPIs Reimaginados ===================== */}
                <div className="field col-12 md:col-3">
                    <Card className="border-none shadow-2 hover:shadow-4 transition-all transition-duration-300 border-left-3 border-green-500">
                        <div className="flex align-items-start justify-content-between">
                            <div className="flex flex-column gap-3 flex-1">
                                <div className="flex align-items-center justify-content-between">
                                    <span className="text-sm text-600 font-semibold uppercase">
                                        Receita Total
                                    </span>
                                    <div
                                        className="flex align-items-center justify-content-center border-circle bg-green-50"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <i className="pi pi-arrow-up text-green-600 text-lg"></i>
                                    </div>
                                </div>
                                <div className="flex flex-column gap-1">
                                    <h2 className="text-3xl font-bold text-green-600 m-0">
                                        {formatCurrency(totalIncome, "BRL")}
                                    </h2>
                                    <span className="text-xs text-500">
                                        Entradas do mês atual
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="field col-12 md:col-3">
                    <Card className="border-none shadow-2 hover:shadow-4 transition-all transition-duration-300 border-left-3 border-red-500">
                        <div className="flex align-items-start justify-content-between">
                            <div className="flex flex-column gap-3 flex-1">
                                <div className="flex align-items-center justify-content-between">
                                    <span className="text-sm text-600 font-semibold uppercase">
                                        Despesa Total
                                    </span>
                                    <div
                                        className="flex align-items-center justify-content-center border-circle bg-red-50"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <i className="pi pi-arrow-down text-red-600 text-lg"></i>
                                    </div>
                                </div>
                                <div className="flex flex-column gap-1">
                                    <h2 className="text-3xl font-bold text-red-600 m-0">
                                        {formatCurrency(totalExpenses, "BRL")}
                                    </h2>
                                    <span className="text-xs text-500">
                                        Saídas do mês atual
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="field col-12 md:col-3">
                    <Card
                        className={`border-none shadow-2 hover:shadow-4 transition-all transition-duration-300 border-left-3 ${saldo > 0 ? "border-green-500" : "border-red-500"}`}
                    >
                        <div className="flex align-items-start justify-content-between">
                            <div className="flex flex-column gap-3 flex-1">
                                <div className="flex align-items-center justify-content-between">
                                    <span className="text-sm text-600 font-semibold uppercase">
                                        Saldo Atual
                                    </span>
                                    <div
                                        className={`flex align-items-center justify-content-center border-circle ${saldo > 0 ? "bg-green-50" : "bg-red-50"}`}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <i
                                            className={`pi pi-wallet ${saldo > 0 ? "text-green-600" : "text-red-600"} text-lg`}
                                        ></i>
                                    </div>
                                </div>
                                <div className="flex flex-column gap-1">
                                    <h2
                                        className={`text-3xl font-bold m-0 ${saldo > 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {formatCurrency(saldo, "BRL")}
                                    </h2>
                                    <span className="text-xs text-500">
                                        Receitas - Despesas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="field col-12 md:col-3">
                    <Card
                        className={`border-none shadow-2 hover:shadow-4 transition-all transition-duration-300 border-left-3 ${variacaoSaldo > 0 ? "border-green-500" : "border-red-500"}`}
                    >
                        <div className="flex align-items-start justify-content-between">
                            <div className="flex flex-column gap-3 flex-1">
                                <div className="flex align-items-center justify-content-between">
                                    <span className="text-sm text-600 font-semibold uppercase">
                                        vs Mês Anterior
                                    </span>
                                    <div
                                        className={`flex align-items-center justify-content-center border-circle ${variacaoSaldo > 0 ? "bg-green-50" : "bg-red-50"}`}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <i
                                            className={`pi ${variacaoSaldo > 0 ? "pi-trending-up text-green-600" : "pi-trending-down text-red-600"} text-lg`}
                                        ></i>
                                    </div>
                                </div>
                                <div className="flex flex-column gap-1">
                                    <div className="flex align-items-baseline gap-2">
                                        <h2
                                            className={`text-3xl font-bold m-0 ${variacaoSaldo > 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {formatCurrency(
                                                variacaoSaldo,
                                                "BRL"
                                            )}
                                        </h2>
                                        <span
                                            className={`text-lg font-bold ${variacaoSaldo > 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                            ({variacaoSaldo > 0 ? "+" : ""}
                                            {percentualVariacao.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <span className="text-xs text-500">
                                        Variação de saldo
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ===================== Charts Premium ===================== */}
                <div className="col-12 md:col-6">
                    <Card className="border-none shadow-2 h-full">
                        <div className="flex align-items-start justify-content-between mb-4 pb-3 border-bottom-1 border-200">
                            <div className="flex align-items-center gap-3">
                                <div
                                    className="flex align-items-center justify-content-center border-circle"
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        background:
                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    }}
                                >
                                    <i className="pi pi-chart-line text-white text-xl"></i>
                                </div>
                                <div className="flex flex-column">
                                    <h3 className="text-xl font-bold m-0 text-900">
                                        Evolução do Saldo
                                    </h3>
                                    <span className="text-xs text-500 mt-1">
                                        Acompanhamento diário do mês
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Chart
                            type="line"
                            data={buildSaldoEvolution()}
                            options={chartOptions}
                        />
                    </Card>
                </div>

                <div className="col-12 md:col-6">
                    <Card className="border-none shadow-2 h-full">
                        <div className="flex align-items-start justify-content-between mb-4 pb-3 border-bottom-1 border-200">
                            <div className="flex align-items-center gap-3">
                                <div
                                    className="flex align-items-center justify-content-center border-circle"
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        background:
                                            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                    }}
                                >
                                    <i className="pi pi-chart-bar text-white text-xl"></i>
                                </div>
                                <div className="flex flex-column">
                                    <h3 className="text-xl font-bold m-0 text-900">
                                        Análise por Categoria
                                    </h3>
                                    <span className="text-xs text-500 mt-1">
                                        Distribuição de receitas e despesas
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="flex align-items-center gap-2 mb-3">
                                    <div className="w-1rem h-1rem border-round bg-green-500"></div>
                                    <span className="text-sm font-semibold text-700">
                                        Receitas por Categoria
                                    </span>
                                </div>
                                <Chart
                                    type="bar"
                                    data={buildCategoryChart(
                                        incomes,
                                        "valor",
                                        "Receitas",
                                        "#22c55e"
                                    )}
                                    options={chartOptions}
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="flex align-items-center gap-2 mb-3">
                                    <div className="w-1rem h-1rem border-round bg-green-500"></div>
                                    <span className="text-sm font-semibold text-700">
                                        Acumulado Receitas
                                    </span>
                                </div>
                                <Chart
                                    type="line"
                                    data={getAccumulatedChartData()}
                                    options={chartOptions}
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="flex align-items-center gap-2 mb-3">
                                    <div className="w-1rem h-1rem border-round bg-red-500"></div>
                                    <span className="text-sm font-semibold text-700">
                                        Despesas por Categoria
                                    </span>
                                </div>
                                <Chart
                                    type="bar"
                                    data={buildCategoryChart(
                                        expenses,
                                        "valor_total",
                                        "Despesas",
                                        "#ef4444"
                                    )}
                                    options={chartOptions}
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="flex align-items-center gap-2 mb-3">
                                    <div className="w-1rem h-1rem border-round bg-red-500"></div>
                                    <span className="text-sm font-semibold text-700">
                                        Acumulado Despesas
                                    </span>
                                </div>
                                <Chart
                                    type="line"
                                    data={getExpenseAccumulatedChartData()}
                                    options={chartOptions}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
