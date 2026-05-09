export default class C {
    static readonly NOME_SISTEMA: string = "Controlei Web";

    // Server Response
    static readonly SERVER_SUCCESS: "success" = "success";
    static readonly SERVER_WARN: "warn" = "warn";
    static readonly SERVER_ERROR: "error" = "error";
    static readonly SUMMARY: { [key: string]: string } = {
        success: "Sucesso",
        warn: "Atenção",
        error: "Erro",
    };
    //Erros
    static readonly ERROS: { [key: number]: string } = {
        401: "Você não tem permissão para acessar esta página.",
        404: "Página não encontrada.",
        500: "Ocorreu um erro desconhecido.",
    };
    static readonly NAO_AUTORIZADO: string =
        "Você não tem permissão para acessar esta página.";

    // General
    static readonly ADICIONAR: string = "Adicionar";
    static readonly ATUALIZAR: string = "Atualizar";
    static readonly ATENCAO: string = "Atenção";
    static readonly BUSCAR: string = "Buscar";
    static readonly CANCELAR: string = "Cancelar";
    static readonly EDITAR: string = "Editar";
    static readonly EXCLUIR: string = "Excluir";
    static readonly MSG_NENHUM_RESULTADO_ENCONTRADO: string =
        "Nenhum resultado encontrado.";
    static readonly OPCOES: string = "Opções";
    static readonly SALVAR: string = "Salvar";
    static readonly SUCESSO: string = "Sucesso";
    static readonly AVISO: string = "Aviso";
    static readonly ERRO: string = "Erro";
    static readonly COPIAR: string = "Copiar";
    static readonly DATA_INCLUSAO: string = "Data Incl.";
    static readonly DATA_ASSINATURA: string = "Data assinatura";
    static readonly USUARIO_ASSINATURA: string = "Usr assinatura";
    static readonly USUARIO_INCLUSAO: string = "Usr Incl.";
    static readonly DATA_ALTERACAO: string = "Data Alt.";
    static readonly USUARIO_ALTERACAO: string = "Usr Alt.";
    static readonly CONTEUDO_ANEXO_VAZIO: string =
        "Não é possível anexar um arquivo vazio.";

    static readonly TIPO_DOCUMENTO_DE_REFERENCIA: string =
        "Tipos de Documento de Referência";
    static readonly ERRO_PADRAO: string =
        "Erro inesperado. Por favor queira entrar em contato com a TI.";
    static readonly EMAIL_INVALIDO: string = "Endereço de e-mail inválido.";
    static readonly CAMPO_INVALIDO: string = "Preencha esse campo.";
    static readonly CAMPOS_OBRIGATORIOS: string =
        "Preencha todos os campos obrigatórios.";
    static readonly LOGOUT: string = "Desconectar";
    static readonly LEMBRAR_SENHA: string = "Lembrar minha senha";
    static readonly MENSAGEM_SUCESSO: string =
        "Operação realizada com sucesso!";
    // Login
    static readonly ENTRAR: string = "Entrar";
    static readonly USUARIO: string = "Usuário";
    static readonly SENHA: string = "Senha";
    static readonly DOMINIO: string = "Domínio";
    static readonly ERRO_REDE: string = "Erro ao tentar conectar ao servidor.";
    static readonly ERRO_LOGIN_INVALIDO: string =
        "Usuário ou senha inválido, tente novamente.";
    static readonly ESQUECI_SENHA: string = "Esqueci minha senha";
    static readonly DESBLOQUEAR_CHAVE: string = "Desbloquear a minha chave";

    // Menu
    static readonly MENU: string = "Menu";

    // Themes
    static readonly THEMES = {
        light: "ws-light-theme",
        dark: "ws-dark-theme",
    };

    static readonly FiltroData = [
        { label: "Dia", value: "DIA" },
        { label: "Mês", value: "MES" },
        { label: "Ano", value: "ANO" },
    ];
}

export const BANK_ICONS = {
    itau: "/images/banks/itau_sem_fundo.svg",
    bb: "/images/banks/bb_sem_fundo.svg",
    bradesco: "/images/banks/bradesco_sem_fundo.svg",
    santander: "/images/banks/santander_sem_fundo.svg",
    btg: "/images/banks/btg_sem_fundo.svg",
    caixa: "/images/banks/caixa_sem_fundo.svg",
    nubank: "/images/banks/nubank_sem_fundo.svg",
    xp: "/images/banks/xp_sem_fundo.svg",
};

export const BANK_OPTIONS = [
    {
        label: "Bancos",
        items: [
            { label: "Itaú", value: "itau" },
            { label: "Bradesco", value: "bradesco" },
            { label: "Santander", value: "santander" },
            { label: "Nubank", value: "nubank" },
        ],
    },
    {
        label: "Corretoras",
        items: [
            { label: "BTG Pactual", value: "btg" },
            { label: "XP Investimentos", value: "xp" },
        ],
    },
];
