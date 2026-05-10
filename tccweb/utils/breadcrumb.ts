import { MenuItem } from "primereact/menuitem";
import C from "./constants";
import Router, { NextRouter } from "next/router";

export function getEndereco(router: NextRouter) {
    const enderecos: { [key: string]: MenuItem[] } = {
        "/ativs_proj_andamento/[id]": getDynamicRoute(
            "/ativs_proj_andamento/[id]",
            router.query.id_projeto as string
        ),
        "/": [{ data: "Home", label: "Home", disabled: true }],
        "/usuario": [{ data: "Usuário", label: "Usuário", disabled: true }],
        "/biblioteca": [
            { data: "Bibliotecas", label: "Bibliotecas", disabled: true },
        ],
        "/receita": [{ data: "Receitas", label: "Receitas", disabled: true }],
        "/despesa": [
            {
                data: "Despesas",
                label: "Despesas",
                disabled: true,
            },
        ],
        "/investimento": [
            {
                data: "Investimentos",
                label: "Investimentos",
                disabled: true,
            },
        ],
        "/projeto_gestor": [
            {
                data: "Solicitação e criação de projeto",
                label: "Solicitação e criação de projeto",
                disabled: true,
            },
        ],
        "/metas": [
            {
                data: "Metas",
                label: "Metas",
                disabled: true,
            },
        ],
        "/projeto_andamento": [
            {
                data: "Projetos em andamento",
                label: "Projetos em andamento",
                disabled: true,
            },
        ],
        "/relatorio_projeto": [
            {
                data: "Relatório de Projetos",
                label: "Relatório de Projetos",
                disabled: true,
            },
        ],
        "/tipo_atividade": [
            {
                data: "Atividades",
                label: "Atividades",
                disabled: true,
            },
        ],
    };

    // Se o endereço dinamico não tiver no model, busca pelo [*]
    let path = enderecos[router.pathname];

    if (enderecos[router.asPath]) path = enderecos[router.asPath];

    return path;
}

const getDynamicRoute = (route: string, param?: string): MenuItem[] => {
    if (route == "/ativs_proj_andamento/[id]") {
        return [
            {
                label: "Projetos",
                disabled: true,
            },
            {
                label: "Projetos em andamento",
                command: () => Router.push("/projeto_andamento"),
            },
            {
                data: "Atividades de projeto",
                label: "Atividades de projeto",
                disabled: true,
            },
        ];
    }
    return [];
};
