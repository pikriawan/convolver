"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider, SliderValue } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useId, useRef, useState } from "react";

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const sourceURLRef = useRef(null);
    const sourceRef = useRef(null);
    const outputURLRef = useRef(null);
    const outputRef = useRef(null);
    const [speed, setSpeed] = useState(0.9);
    const sourceId = useId();
    const impulseResponseId = useId();

    useEffect(() => {
        function onLog({ message }) {
            console.log(message);
        }

        async function load() {
            setIsLoading(true);

            const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
            const ffmpeg = ffmpegRef.current;

            ffmpeg.on("log", onLog);

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
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

        const ffmpeg = ffmpegRef.current;

        await ffmpeg.writeFile("source.mp3", await fetchFile(source));
        await ffmpeg.writeFile("impulse-response.wav", await fetchFile(impulseResponse.size > 0 ? impulseResponse : "/impulse-response.wav"));

        await ffmpeg.exec([
            "-i",
            "source.mp3",
            "-i",
            "impulse-response.wav",
            "-filter_complex",
            `[0:a][1:a]afir,asetrate=44100*${speed},aresample=44100,volume=10`,
            "-c:a",
            "libmp3lame",
            "-b:a",
            "320k",
            "output.mp3"
        ]);

        setIsLoading(false);

        if (sourceURLRef.current !== null) {
            URL.revokeObjectURL(sourceURLRef.current);
        }

        sourceURLRef.current = URL.createObjectURL(source);
        sourceRef.current.src = sourceURLRef.current;

        if (outputURLRef.current !== null) {
            URL.revokeObjectURL(outputURLRef.current);
        }

        const outputData = await ffmpeg.readFile("output.mp3");
        outputURLRef.current = URL.createObjectURL(new Blob([outputData.buffer], { type: "audio/mpeg" }));
        outputRef.current.src = outputURLRef.current;
    }

    return (
        <div className="p-4 flex flex-col gap-4 items-center">
            {loaded ? (
                <>
                    <h1 className="text-lg font-semibold text-center">Convolver</h1>
                    <Form className="w-full max-w-sm flex flex-col gap-4" onSubmit={onSubmit}>
                        <Field>
                            <FieldLabel htmlFor={sourceId}>Source (.mp3)</FieldLabel>
                            <Input type="file" id={sourceId} name="source" accept=".mp3,audio/mpeg" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={impulseResponseId}>Impulse response (.wav, optional)</FieldLabel>
                            <Input type="file" id={impulseResponseId} name="impulseResponse" accept=".wav,audio/wav,audio/x-wav" />
                        </Field>
                        <Field>
                            <input type="hidden" name="speed" value={speed} />
                            <Slider min={0.5} max={2} step={0.05} value={speed} onValueChange={(value) => setSpeed(value)}>
                                <div className="mb-2 flex items-center justify-between gap-1">
                                    <FieldLabel>Speed</FieldLabel>
                                    <SliderValue />
                                </div>
                            </Slider>
                        </Field>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    Processing...
                                </>
                            ) : "Convolve"}
                        </Button>
                    </Form>
                    <div className="w-full max-w-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <span>Original</span>
                            <audio ref={sourceRef} loop controls />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span>Convolved</span>
                            <audio ref={outputRef} loop controls />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <Spinner />
                    <div className="flex flex-col gap-2">
                        <p className="text-center">Loading ffmpeg</p>
                        <p className="text-center">This might take a while</p>
                    </div>
                </>
            )}
        </div>
    );
}
