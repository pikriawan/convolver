import "./style.css";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import impulseResponseURL from "./impulse-response.wav";
import coreURL from "./node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js?url";
import wasmURL from "./node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm?url";

let ffmpeg = null;

let sourceURL = "";
let outputURL = "";

async function load() {
    if (!ffmpeg) {
        ffmpeg = new FFmpeg();
    }

    ffmpeg.on("log", ({ message }) => {
        console.log(message);
    });

    const progress = document.getElementById("progress");

    ffmpeg.on("progress", ({ progress: p }) => {
        const rounded = Math.round(p * 100);
        progress.textContent = `Progress: ${rounded <= 100 ? rounded : "..."}%`;
    });

    await ffmpeg.load({ coreURL, wasmURL });

    const loader = document.getElementById("loader");
    loader.remove();

    const onload = document.getElementById("onload");
    onload.classList.add("show");

    const sourceForm = document.getElementById("sourceForm");

    sourceForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(event.target);
        convolve(data);
    });

    const impulseResponse = document.getElementById("impulseResponse");
    const impulseResponseReset = document.getElementById("impulseResponseReset");

    impulseResponseReset.addEventListener("click", () => {
        impulseResponse.value = "";
    });

    const speedLabel = document.getElementById("speedLabel");
    const speed = document.getElementById("speed");

    speedLabel.textContent = `Speed (${speed.value / 100}x)`;

    speed.addEventListener("change", (event) => {
        speedLabel.textContent = `Speed (${event.target.value / 100}x)`;
    });
}

async function convolve(formData) {
    if (ffmpeg === null) {
        return;
    }

    URL.revokeObjectURL(sourceURL);
    URL.revokeObjectURL(outputURL);

    const source = formData.get("source");
    const impulseResponse = formData.get("impulse_response");
    const speed = formData.get("speed");

    if (impulseResponse.size > 0) {
        await ffmpeg.writeFile("impulse-response.wav", await fetchFile(impulseResponse));
    } else {
        await ffmpeg.writeFile("impulse-response.wav", await fetchFile(impulseResponseURL));
    }

    await ffmpeg.writeFile("input.mp3", await fetchFile(source));

    await ffmpeg.exec([
        "-i",
        "input.mp3",
        "-i",
        "impulse-response.wav",
        "-filter_complex",
        `[0:a][1:a]afir,asetrate=44100*${speed / 100},aresample=44100,volume=10`,
        "-c:a",
        "libmp3lame",
        "-b:a",
        "320k",
        "output.mp3"
    ]);

    const data = await ffmpeg.readFile("output.mp3");

    const sourceAudio = document.getElementById("sourceAudio");
    sourceURL = URL.createObjectURL(source);
    sourceAudio.src = sourceURL;

    const outputAudio = document.getElementById("outputAudio");
    outputURL = URL.createObjectURL(new Blob([data.buffer], { type: "audio/mpeg" }));
    outputAudio.src = outputURL;
}

load();
