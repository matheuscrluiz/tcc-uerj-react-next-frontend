import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Service from "../../../services/login_service";
const service = new Service();
export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",

            credentials: {
                ch_rede: {
                    label: "Chave de rede",
                    type: "text",
                },
                senha: {
                    label: "Senha",
                    type: "password",
                },
            },

            async authorize(credentials) {
                if (!credentials) return null;

                const { ch_rede, senha } = credentials;
                // Login fake temporário
                if (ch_rede === "admin" && senha === "1") {
                    return {
                        id: 1,
                        nome: "Usuário Teste",
                        email: "teste@teste.com",
                        ch_rede: "admin",
                        cpf: "00000000000",
                        matricula: "123456",
                    };
                }
                // try {
                //     const response = await service.login(ch_rede, senha);

                //     const user = response.data_return;

                //     return {
                //         id: user.id_usuario,
                //         nome: user.nome,
                //         email: user.email,
                //         ch_rede: user.ch_rede,
                //         cpf: user.cpf,
                //         matricula: user.matricula,
                //     };
                // } catch (error) {
                //     console.error("Erro no login:", error);
                //     return null;
                // }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60, // 12 hours
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.ch_rede = user.ch_rede;
                token.nome = user.nome;
            }
            return token;
        },

        async session({ session, token }) {
            session.user.email = token.email as string;
            session.user.ch_rede = token.ch_rede as string;
            session.user.nome = token.nome as string;
            return session;
        },
    },

    pages: {
        signIn: "/auth/login",
    },
});
