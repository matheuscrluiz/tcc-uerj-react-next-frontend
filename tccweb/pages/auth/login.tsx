// React & Next
import { GetServerSidePropsContext } from "next";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

// PrimeReact
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { TabPanel, TabView } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";

// Typed
import { ReactTyped } from "react-typed";

// Assets
import LogoHeader from "../../public/images/logos/ChatGPT Image 16 de dez. de 2025, 22_06_26.png";
import ImagemMar from "../../public/images/controlei-lp.png";

export default function Login() {
    const router = useRouter();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [chRede, setChRede] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    const typedPhrases = [
        "Visualize sua evolução patrimonial mês a mês",
        "Entenda exatamente para onde seu dinheiro vai",
        "Transforme controle financeiro em tranquilidade",
        "Menos planilhas. Mais clareza.",
        "Seu dinheiro sob controle, de verdade",
    ];

    const loginControlei = async () => {
        setLoading(true);

        const result = await signIn("credentials", {
            redirect: false,
            ch_rede: chRede,
            senha: senha,
        });

        setLoading(false);

        if (result?.ok) router.push("/");
        else alert("Usuário ou senha inválidos");
    };

    const loginGoogle = (_e: FormEvent) => signIn("google");

    return (
        <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
            {/* HERO */}
            <div
                style={{
                    display: "none",
                    position: "relative",
                    width: "60%",
                }}
                className="md:flex"
            >
                <Image
                    src={ImagemMar}
                    alt="Controle financeiro"
                    fill
                    priority
                    style={{ objectFit: "cover" }}
                />

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(90deg, rgba(15,23,42,0.9), rgba(15,23,42,0.4))",
                        display: "flex",
                        alignItems: "center",
                        padding: "4rem",
                    }}
                >
                    <div style={{ maxWidth: 520, color: "white" }}>
                        <span
                            style={{
                                fontSize: 12,
                                letterSpacing: "0.15em",
                                color: "#86efac",
                                fontWeight: 600,
                            }}
                        >
                            CONTROLE FINANCEIRO INTELIGENTE
                        </span>

                        <h1
                            style={{
                                fontSize: 44,
                                fontWeight: 700,
                                lineHeight: 1.1,
                                margin: "12px 0 16px",
                            }}
                        >
                            Domine sua vida financeira
                            <br />
                            com clareza e controle
                        </h1>

                        <ReactTyped
                            strings={typedPhrases}
                            typeSpeed={45}
                            backSpeed={25}
                            backDelay={2200}
                            loop
                            style={{
                                fontSize: 20,
                                color: "#4ade80",
                                minHeight: 32,
                                display: "block",
                            }}
                        />

                        <div style={{ marginTop: 32 }}>
                            <Button
                                label="Começar agora"
                                icon="pi pi-arrow-right"
                                className="p-button-success p-button-lg"
                                onClick={() => setDialogVisible(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SIDEBAR */}
            <Sidebar
                visible
                modal={false}
                position="right"
                onHide={() => {}}
                showCloseIcon={false}
                style={{ width: "40%" }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        paddingBottom: 24,
                    }}
                >
                    <Image
                        src={LogoHeader}
                        alt="Controlei"
                        width={120}
                        height={120}
                        style={{ objectFit: "contain" }}
                    />

                    <h2 style={{ margin: "12px 0 4px" }}>Controlei Web</h2>
                    <p style={{ color: "#64748b", margin: 0 }}>
                        Controle financeiro inteligente
                    </p>
                </div>

                <TabView>
                    <TabPanel header="Acessar">
                        <h3 style={{ lineHeight: 1.4 }}>
                            Tudo o que você precisa para organizar sua vida
                            financeira
                        </h3>

                        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                            {[
                                "Controle de receitas e despesas",
                                "Metas financeiras inteligentes",
                                "Evolução do patrimônio",
                                "Visão clara do seu dinheiro",
                            ].map((item) => (
                                <li
                                    key={item}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginBottom: 8,
                                        color: "#334155",
                                    }}
                                >
                                    <i
                                        className="pi pi-check"
                                        style={{ color: "#22c55e" }}
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Button
                            label="Entrar no Controlei"
                            outlined
                            className="w-full"
                            onClick={() => setDialogVisible(true)}
                        />

                        <Button
                            label="Continuar com Google"
                            icon="pi pi-google"
                            outlined
                            className="w-full mt-2"
                            onClick={loginGoogle}
                        />

                        <small
                            style={{
                                display: "block",
                                marginTop: 16,
                                textAlign: "center",
                                fontSize: 12,
                                color: "#64748b",
                            }}
                        >
                            🔒 Seus dados são protegidos
                        </small>
                    </TabPanel>
                </TabView>
            </Sidebar>

            {/* LOGIN DIALOG */}
            <Dialog
                visible={dialogVisible}
                modal
                onHide={() => setDialogVisible(false)}
                style={{ width: 420, borderRadius: 20 }}
            >
                <div
                    style={{
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        padding: "2.5rem 2rem",
                        textAlign: "center",
                        color: "white",
                    }}
                >
                    <i className="pi pi-lock" style={{ fontSize: 28 }} />
                    <h2 style={{ margin: "12px 0 4px" }}>Controlei Web</h2>
                    <p style={{ margin: 0 }}>Acesse com sua chave de rede</p>
                </div>

                <div style={{ padding: "2rem" }}>
                    <label>Chave de rede</label>
                    <InputText
                        value={chRede}
                        onChange={(e) => setChRede(e.target.value)}
                        className="w-full mb-3"
                    />

                    <Password
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        toggleMask
                        feedback={false}
                        placeholder="Senha"
                        className="w-full mb-3"
                    />

                    <Button
                        label={loading ? "Entrando..." : "Entrar"}
                        icon="pi pi-sign-in"
                        loading={loading}
                        onClick={loginControlei}
                        className="w-full p-button-success"
                    />
                </div>
            </Dialog>
        </div>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);

    if (session) {
        return {
            redirect: { destination: "/", permanent: false },
        };
    }

    return { props: {} };
}
