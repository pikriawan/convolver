"use server";

import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export async function convolve(formData) {
    const file = formData.get("file");

    if (!file) {
        return;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(process.cwd(), "input.mp3");

    fs.writeFileSync(filePath, buffer);

    fs.rmSync(path.resolve(process.cwd(), "public", "output.mp3"), { force: true });

    child_process.execFileSync(
        "ffmpeg",
        [
            "-i",
            path.join(process.cwd(), "input.mp3"),
            "-i",
            path.join(process.cwd(), "default-impulse-response.wav"),
            "-filter_complex",
            "[0:a][1:a]afir",
            "-c:a",
            "libmp3lame",
            "-b:a",
            "320k",
            path.join(process.cwd(), "public", "output.mp3")
        ]
    );
}
