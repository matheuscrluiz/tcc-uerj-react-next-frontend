// React & Next
import { AppProps } from "next/app";
import { Session } from "next-auth";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
// Primereact
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import { Toast } from "primereact/toast";

// Custom Styles
import "../styles/layout.css";
import "../styles/reset_css_browser.css";
// Components
import Layout from "../components/layout/layout";
import { ThemeContext } from "../contexts/themeContext";
import C from "../utils/constants";
import { ScrollTop } from "primereact/scrolltop";
import { BlockUI } from "primereact/blockui";
import { ProgressSpinner } from "primereact/progressspinner";
import useWindow from "../hooks/useWindow";
import FinanceLoader from "../components/FinanceLoader";

export default function NextApp({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps<{
    session: Session;
}>) {
    const router = useRouter();
    const [theme, setTheme] = useState<string>(C.THEMES.light);
    const toast = useRef<Toast>(null);
    const [isLoading, setIsLoading] = useState(false);
    const size = useWindow();

    return (
        <SessionProvider session={session}>
            <ThemeContext.Provider value={{ theme, setTheme }}>
                {router.pathname !== "/auth/login" ? (
                    <Layout>
                        <Component
                            loading={setIsLoading}
                            toast={toast}
                            {...pageProps}
                        />
                        <ScrollTop
                            target="window"
                            threshold={50}
                            icon="pi pi-arrow-up"
                        />
                    </Layout>
                ) : (
                    <main>
                        <Component
                            loading={setIsLoading}
                            toast={toast}
                            {...pageProps}
                        />
                    </main>
                )}
                <BlockUI
                    template={<FinanceLoader />}
                    blocked={isLoading}
                    fullScreen
                />
                <Toast
                    style={size.width! < 640 ? { width: "90vw" } : undefined}
                    ref={toast}
                    position="bottom-right"
                />
            </ThemeContext.Provider>
        </SessionProvider>
    );
}

