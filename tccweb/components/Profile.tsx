// React & Next
import { useContext } from "react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
// Primereact
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { InputSwitch } from "primereact/inputswitch";
// Utils
import C from "../utils/constants";
// Components
import AvatarPic from "./AvatarPic";
import { ThemeContext } from "../contexts/themeContext";
import { changeTheme } from "../utils/utils";

interface ProfileProps {
    image: string;
    session: Session | null;
}

export default function Profile({ image, session }: ProfileProps) {
    const { theme, setTheme } = useContext(ThemeContext);

    const signOutADFS = async (e: React.MouseEvent) => {
        // signOut({ redirect: true, callbackUrl: "/auth/login" });
        await signOut({ redirect: false });
        window.location.href = "/auth/login";
    };

    return (
        <div className="p-3 flex flex-column align-items-center">
            <AvatarPic image={image} width={80} height={80} />
            <p className="mt-4 font-bold">{session?.user.nome}</p>
            <Divider className="mb-0" />
            <div className="flex gap-2 align-items-center mt-2">
                <label htmlFor="encargo">Modo noturno</label>
                <InputSwitch
                    inputId="theme"
                    checked={theme == C.THEMES.dark}
                    onChange={(e) => {
                        const newTheme = e.value
                            ? C.THEMES.dark
                            : C.THEMES.light;
                        setTheme(newTheme);
                        changeTheme(newTheme);
                        window.localStorage.setItem("theme", newTheme);
                    }}
                />
            </div>
            <Button
                className="mt-4 p-button-danger"
                onClick={signOutADFS}
                icon="pi pi-sign-out"
                label={C.LOGOUT}
            />
        </div>
    );
}

