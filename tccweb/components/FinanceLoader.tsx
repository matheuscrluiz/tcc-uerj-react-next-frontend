import { ProgressBar } from "primereact/progressbar";
import { useEffect, useState } from "react";

export default function FinanceLoader() {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setValue((v) =>
                v >= 100 ? 100 : v + Math.floor(Math.random() * 10)
            );
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="finance-loader">
            <i className="pi pi-wallet finance-icon" />
            <h3>Atualizando seus dados financeiros</h3>
            <ProgressBar value={value} showValue={false} />
            <small>Isso leva só alguns segundos…</small>
        </div>
    );
}
