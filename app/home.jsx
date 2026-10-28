"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { useEffect, useId, useRef, useState } from "react";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Button } from "@/components/ui/button";
import { Field, FieldItem, FieldLabel } from "@/components/ui/field";
import { Fieldset } from "@/components/ui/fieldset";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProgressButton } from "@/components/ui/progress-button";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Slider, SliderValue } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
    const ffmpegRef = useRef(new FFmpeg());
    const sourceId = useId();
    const customImpulseResponseId = useId();
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [sourceURL, setSourceURL] = useState(null);
    const [outputURL, setOutputURL] = useState(null);
    const [customImpulseResponseSelected, setCustomImpulseResponseSelected] = useState(false);
    const [progress, setProgress] = useState(null);
    const [progressMessage, setProgressMessage] = useState(null);

    useEffect(() => {
        function onLog({ message }) {
            console.log(message);
        }

        async function load() {
            setIsLoading(true);

            ffmpegRef.current.on("log", onLog);

            await ffmpegRef.current.load({
                coreURL: "/assets/ffmpeg-core.js",
                wasmURL: "/assets/ffmpeg-core.wasm"
            });

            setLoaded(true);
            setIsLoading(false);
        }

        load();

        return () => {
            ffmpegRef.current.off("log", onLog);
        };
    }, []);

    async function onSubmit(event) {
        event.preventDefault();

        if (!loaded || isLoading) {
            return;
        }

        const data = new FormData(event.target);
        const source = data.get("source");
        const impulseResponse = data.get("impulseResponse");
        const speed = data.get("speed");

        setIsLoading(true);

        await ffmpegRef.current.writeFile("source.mp3", await fetchFile(source));

        let impulseResponseFile = null;

        switch (impulseResponse) {
            case "concert-hall":
                impulseResponseFile = "/impulse-responses/concert-hall.wav";
                break;
            case "tennis-court":
                impulseResponseFile = "/impulse-responses/tennis-court.wav";
                break;
            case "tower":
                impulseResponseFile = "/impulse-responses/tower.wav";
                break;
            case "auditorium":
                impulseResponseFile = "/impulse-responses/auditorium.wav";
                break;
            case "forest":
                impulseResponseFile = "/impulse-responses/forest.wav";
                break;
            case "custom":
                impulseResponseFile = data.get("customImpulseResponse");
                break;
        }

        await ffmpegRef.current.writeFile("impulse-response.wav", await fetchFile(impulseResponseFile));

        function onProgress({ progress: _progress }) {
            if (_progress > 99) {
                setProgress(0);
            } else {
                setProgress(Math.round(_progress * 100));
            }

            if (_progress > 99) {
                setProgressMessage(null);
            } else if (_progress === 1) {
                setProgressMessage("Menyesuaikan kecepatan...");
            } else {
                setProgressMessage(`Memproses (${Math.round(_progress * 100)})%...`);
            }
        }

        ffmpegRef.current.on("progress", onProgress);

        await ffmpegRef.current.exec([
            "-i",
            "source.mp3",
            "-i",
            "impulse-response.wav",
            "-filter_complex",
            `[0:a][1:a]afir,volume=10`,
            "-c:a",
            "libmp3lame",
            "-b:a",
            "320k",
            speed === "1" ? "output.mp3" : "convolution.mp3"
        ]);

        ffmpegRef.current.off("progress", onProgress);

        if (speed !== "1") {
            await ffmpegRef.current.exec([
                "-i",
                "convolution.mp3",
                "-filter_complex",
                `asetrate=44100*${speed},aresample=44100`,
                "-c:a",
                "libmp3lame",
                "-b:a",
                "320k",
                "output.mp3"
            ]);
        }

        setIsLoading(false);
        setProgress(null);
        setProgressMessage(null);

        if (sourceURL) {
            URL.revokeObjectURL(sourceURL);
        }

        setSourceURL(URL.createObjectURL(source));

        if (outputURL) {
            URL.revokeObjectURL(outputURL);
        }

        const outputData = await ffmpegRef.current.readFile("output.mp3");
        setOutputURL(URL.createObjectURL(new Blob([outputData.buffer], { type: "audio/mpeg" })));
    }

    return (
        <div className="p-4 flex flex-col gap-4 items-center">
            <h1 className="w-full max-w-sm text-lg font-semibold text-center">Convolver</h1>
            <Form className="w-full max-w-sm flex flex-col gap-4" onSubmit={onSubmit}>
                <Field>
                    <FieldLabel htmlFor={sourceId}>Input (.mp3)</FieldLabel>
                    <Input type="file" id={sourceId} name="source" accept=".mp3,audio/mpeg" required />
                </Field>
                <Field className="gap-2" name="impulseResponse" render={(props) => <Fieldset {...props} />}>
                    <FieldLabel>Impulse response</FieldLabel>
                    <RadioGroup defaultValue="concert-hall" onChange={(event) => setCustomImpulseResponseSelected(event.target.value === "custom")}>
                        <FieldItem>
                            <FieldLabel>
                                <Radio value="concert-hall" />
                                Aula konser
                            </FieldLabel>
                        </FieldItem>
                        <FieldItem>
                            <FieldLabel>
                                <Radio value="tennis-court" />
                                Lapangan tenis
                            </FieldLabel>
                        </FieldItem>
                        <FieldItem>
                            <FieldLabel>
                                <Radio value="tower" />
                                Menara
                            </FieldLabel>
                        </FieldItem>
                        <FieldItem>
                            <FieldLabel>
                                <Radio value="auditorium" />
                                Auditorium
                            </FieldLabel>
                        </FieldItem>
                        <FieldItem>
                            <FieldLabel>
                                <Radio value="forest" />
                                Hutan
                            </FieldLabel>
                        </FieldItem>
                        <FieldItem>
                            <FieldLabel>
                                <Radio value="custom" />
                                Kustom (.wav)
                            </FieldLabel>
                        </FieldItem>
                    </RadioGroup>
                </Field>
                <Field className={customImpulseResponseSelected ? "" : "hidden"}>
                    <Input type="file" id={customImpulseResponseId} name="customImpulseResponse" accept=".wav,audio/wav" required={customImpulseResponseSelected} />
                </Field>
                <Field>
                    <input type="hidden" name="speed" value={speed} />
                    <Slider min={0.5} max={1.5} step={0.025} value={speed} onValueChange={(value) => setSpeed(value)}>
                        <div className="mb-2 flex items-center justify-between gap-1">
                            <FieldLabel>Kecepatan</FieldLabel>
                            <SliderValue />
                        </div>
                    </Slider>
                </Field>
                {loaded ? (
                    isLoading ? (
                        <ProgressButton progress={progress}>
                            <Spinner />
                            {progressMessage}
                        </ProgressButton>
                    ) : (
                        <Button type="submit">Terapkan</Button>
                    )
                ) : (
                    <Button variant="outline" disabled>
                        <Spinner />
                        Mengunduh aset...
                    </Button>
                )}
            </Form>
            <div className="w-full max-w-sm flex flex-col gap-4">
                {sourceURL && (
                    <div className="flex flex-col gap-2">
                        <span className="font-medium text-sm">Sebelum</span>
                        <AudioPlayer src={sourceURL} loop downloadable />
                    </div>
                )}
                {outputURL && (
                    <div className="flex flex-col gap-2">
                        <span className="font-medium text-sm">Sesudah</span>
                        <AudioPlayer src={outputURL} loop downloadable />
                    </div>
                )}
            </div>
        </div>
    );
}
