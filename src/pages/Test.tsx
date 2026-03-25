import { useMemo, useState } from "react";

export function Test() {
    const [serviceUuid, setServiceUuid] = useState("");
    const [characteristicUuid, setCharacteristicUuid] = useState("");

    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const canConnect = useMemo(() => {
        return serviceUuid.trim().length > 0 && characteristicUuid.trim().length > 0 && status !== "loading";
    }, [serviceUuid, characteristicUuid, status]);

    const bluetoothAvailable = typeof navigator !== "undefined" && "bluetooth" in navigator;

    const connectBluetooth = async () => {
        setError("");
        setSuccess("");

        if (!bluetoothAvailable) {
            setError("Le Bluetooth Web n'est pas disponible sur ce navigateur/appareil.");
            return;
        }

        const service = serviceUuid.trim();
        const characteristic = characteristicUuid.trim();
        if (!service || !characteristic) {
            setError("Veuillez renseigner SERVICE_UUID et CHARACTERISTIC_UUID.");
            return;
        }

        setStatus("loading");

        try {
            const selectedDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [service] }],
                optionalServices: [service],
            });

            if (!selectedDevice.gatt) {
                throw new Error("GATT indisponible sur cet appareil.");
            }

            const server = await selectedDevice.gatt.connect();
            const primaryService = await server.getPrimaryService(service);
            await primaryService.getCharacteristic(characteristic);

            setDevice(selectedDevice);
            setIsConnected(true);
            setSuccess(
                `Connecté à ${selectedDevice.name || "Appareil inconnu"} et caractéristique trouvée.`
            );
            setStatus("success");
        } catch (err) {
            setIsConnected(false);
            setDevice(null);
            setStatus("error");

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Connexion Bluetooth impossible.");
            }
        }
    };

    const disconnectBluetooth = () => {
        if (device?.gatt?.connected) {
            device.gatt.disconnect();
        }
        setIsConnected(false);
        setDevice(null);
        setStatus("idle");
        setSuccess("");
    };

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
            <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h1 className="text-2xl font-bold tracking-tight">Test Connexion Bluetooth</h1>
                <p className="mt-1 text-sm text-white/70">
                    Renseigne SERVICE_UUID et CHARACTERISTIC_UUID, puis lance la recherche d'appareil.
                </p>

                <div className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white/85">SERVICE_UUID</label>
                        <input
                            value={serviceUuid}
                            onChange={(e) => setServiceUuid(e.target.value)}
                            placeholder="ex: 0000180d-0000-1000-8000-00805f9b34fb"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-white/85">CHARACTERISTIC_UUID</label>
                        <input
                            value={characteristicUuid}
                            onChange={(e) => setCharacteristicUuid(e.target.value)}
                            placeholder="ex: 00002a37-0000-1000-8000-00805f9b34fb"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={connectBluetooth}
                        disabled={!canConnect}
                        className={[
                            "h-11 w-full rounded-xl border border-white/10 font-semibold transition",
                            canConnect
                                ? "bg-cyan-500/90 text-black hover:bg-cyan-400"
                                : "cursor-not-allowed bg-white/10 text-white/40",
                        ].join(" ")}
                    >
                        {status === "loading" ? "Recherche et connexion..." : "Rechercher un appareil et se connecter"}
                    </button>

                    {isConnected ? (
                        <button
                            type="button"
                            onClick={disconnectBluetooth}
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/10 font-semibold text-white transition hover:bg-white/20"
                        >
                            Se déconnecter
                        </button>
                    ) : null}

                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
                        <p>
                            <span className="text-white/65">Bluetooth dispo :</span> {bluetoothAvailable ? "Oui" : "Non"}
                        </p>
                        <p>
                            <span className="text-white/65">Statut :</span> {isConnected ? "Connecté" : "Non connecté"}
                        </p>
                        <p>
                            <span className="text-white/65">Appareil :</span> {device?.name || "-"}
                        </p>
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-white">
                            <span className="font-semibold">Erreur :</span> {error}
                        </div>
                    ) : null}

                    {success ? (
                        <div className="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-white">
                            <span className="font-semibold">Succès :</span> {success}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}