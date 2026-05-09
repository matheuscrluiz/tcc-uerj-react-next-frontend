// Next & React
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef } from "react";
// Primereact
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { OverlayPanel } from "primereact/overlaypanel";
// NextAuth
import { signIn, useSession } from "next-auth/react";
// Components
import AvatarPic from "../AvatarPic";
import Profile from "../Profile";
// Utils
import { getEndereco } from "../../utils/breadcrumb";
// Logo
import { ThemeContext } from "../../contexts/themeContext";
import LogoWSPrimary from "../../public/images/logos/ChatGPT Image 16 de dez. de 2025, 22_06_26.png";
import { changeTheme } from "../../utils/utils";
import C from "../../utils/constants";

interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
    const router = useRouter();
    const page = getEndereco(router);
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const VERSION = "01/01/2024 v0.1";
    const op = useRef<OverlayPanel>(null);
    const { theme, setTheme } = useContext(ThemeContext);

    useEffect(() => {
        const storagedTheme = window.localStorage
            .getItem("theme")
            ?.replaceAll('"', "");
        if (storagedTheme && theme != storagedTheme) {
            changeTheme(storagedTheme);
            setTheme(storagedTheme);
        }
    }, [theme]);

    const items = [
        {
            label: C.NOME_SISTEMA,
            className: "font-bold",
            // disabled: true,
        },
        {
            label: "Receitas",
            className: "font-bold",
            command: () => router.push("/receita"),
        },
        {
            label: "Despesas",
            className: "font-bold",
            command: () => router.push("/despesa"),
        },
        {
            label: "Investimentos",
            className: "font-bold",
            command: () => router.push("/investimento"),
        },
        {
            label: "Metas",
            className: "font-bold",
            command: () => router.push("/metas"),
        },
        {
            label: "Configurações",
            className: "font-bold",
            items: [
                {
                    label: "Usuários",
                    className: "font-bold",
                    command: () => router.push("/usuario"),
                },
                {
                    label: "Categoria",
                    className: "font-bold",
                    command: () => router.push("/tipo_categoria"),
                },
            ],
        },
    ];

    const home = {
        icon: "pi pi-home",
        command: () => router.push("/"),
    };

    const start = (
        <Link href="/">
            <Image
                alt="logo"
                src={LogoWSPrimary}
                width="65"
                height="65"
                className="mt-1 ml-1"
            />
        </Link>
    );

    const endLogged = (
        <>
            <Button
                className="flex mr-3 p-0 p-button-text p-button-link"
                onClick={(e) => (op.current ? op.current.toggle(e) : null)}
            >
                <span className="mr-4 text-white font-bold">
                    {session?.user.nome.toUpperCase().split(" ")[0]}
                </span>

                <AvatarPic
                    image={session?.user?.image || "/images/Dog1.svg"}
                    width={40}
                    height={40}
                />
            </Button>
            <OverlayPanel className="w-6 md:w-2" ref={op} appendTo="self">
                <Profile
                    image={session?.user?.image || "/images/Dog1.svg"}
                    session={session}
                />
            </OverlayPanel>
        </>
    );

    return (
        <>
            <Head>
                <title>{page?.at(0)?.data}</title>
            </Head>
            <Menubar id="Menu" model={items} start={start} end={endLogged} />
            <main>
                <div className="p-3 mt-8">
                    <BreadCrumb
                        style={{ border: "none", color: "black" }}
                        className="p-2 mb-4"
                        model={page}
                        home={home}
                    />
                    {children}
                </div>
            </main>
            <footer className="font-bold flex" style={{ fontSize: "12px" }}>
                <pre className="ml-auto mr-3">{VERSION}</pre>
            </footer>
        </>
    );
}

export default Layout;
