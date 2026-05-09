import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="pt-br">
            <Head>
                <link
                    id="theme-link"
                    rel="stylesheet"
                    href="/themes/ws-light-theme/theme.css"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
