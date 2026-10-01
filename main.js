import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import impulseResponseURL from "./impulse-response.wav";
import coreURL from "./node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js?url";
import wasmURL from "./node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm?url";

let ffmpeg = null;

async function load() {
    if (!ffmpeg) {
        ffmpeg = new FFmpeg();
    }

    ffmpeg.on("log", ({ message }) => {
        console.log(message);
    });

    await ffmpeg.load({ coreURL, wasmURL });

    document.getElementById("loader").remove();

    const sourceForm = document.createElement("form");
    sourceForm.setAttribute("id", "sourceForm");

    sourceForm.innerHTML = `
        <div>
            <input type="file" name="source" accept="audio/mpeg" required>
        </div>
        <div>
            <button>Convolve</button>
        </div>
    `;

    sourceForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const source = data.get("source");
        convolve(source);
    });

    document.body.append(sourceForm);
}

async function convolve(file) {
    if (ffmpeg === null) {
        return;
    }

    await ffmpeg.writeFile("impulse-response.wav", await fetchFile(impulseResponseURL));
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    await ffmpeg.exec([
        "-i",
        file.name,
        "-i",
        "impulse-response.wav",
        "-filter_complex",
        "[0:a][1:a]afir,volume=10",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "320k",
        "output.mp3"
    ]);

    const data = await ffmpeg.readFile("output.mp3");

    const output = document.createElement("audio");
    output.setAttribute("controls", "");
    output.src = URL.createObjectURL(new Blob([data.buffer], { type: "audio/mpeg" }));
    document.body.append(output);

    document.body.append(document.createElement("br"));

    const download = document.createElement("button");
    download.textContent = "Download";
    document.body.append(download);

    download.addEventListener("click", () => {
        const link = document.createElement("a");
        link.setAttribute("href", output.src);
        link.setAttribute("download", "output.mp3");
        link.click();
    });

}

load();
