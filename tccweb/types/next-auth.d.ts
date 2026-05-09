import { DefaultSession } from "next-auth";
import { GoogleProfile } from "next-auth/providers/google";
import { CognitoProfile } from "next-auth/providers/cognito";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        provider: string;
        accessToken: unknown;
        //Profiles que sao  retornados pelo Cognto e pelo google
        //Lembra de sempre editar com o tipo que é retornado
        googleProfile: GoogleProfile;
        cognitoProfile: CustomCognito;
        user: {
            matricula: string;
            ch_rede: string;
            email: string;
            nome: string;
            cpf: string;
            email: string;
        } & DefaultSession["user"];
    }
    interface User {
        matricula: string;
        ch_rede: string;
        email: string;
        nome: string;
        cpf: string;
        email: string;
    }
    /** The OAuth profile returned from your provider */
    interface Profile {
        "cognito:username": string;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        googleProfile: GoogleProfile;
        cognitoProfile: CognitoProfile;
        /** OpenID ID Token */
        idToken?: string;
        matricula: string;
        ch_rede: string;
        nome: string;
        email: string;
        cpf: string;
        email: string;
    }
}
