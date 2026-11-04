"use client";

import { Download, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardPanel } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";

export function AudioPlayer({ src, title, loop = false, downloadable = false }) {
    const audioRef = useRef(null);
    const [canPlay, setCanPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!src) {
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.remove();
        }

        setCanPlay(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        const audio = new Audio(src);
        audioRef.current = audio;
        audioRef.current.loop = loop;

        function onCanPlay() {
            setCanPlay(true);
        }

        function onLoadedMetadata() {
            setDuration(audio.duration);
        }

        function onTimeUpdate(event) {
            setCurrentTime(event.target.currentTime);
        }

        function onPlay() {
            setIsPlaying(true);
        }

        function onPause() {
            setIsPlaying(false);
        }

        audioRef.current.addEventListener("canplay", onCanPlay);
        audioRef.current.addEventListener("loadedmetadata", onLoadedMetadata);
        audioRef.current.addEventListener("timeupdate", onTimeUpdate);
        audioRef.current.addEventListener("play", onPlay);
        audioRef.current.addEventListener("pause", onPause);

        return () => {
            audioRef.current.removeEventListener("canplay", onCanPlay);
            audioRef.current.removeEventListener("loadedmetadata", onLoadedMetadata);
            audioRef.current.removeEventListener("timeupdate", onTimeUpdate);
            audioRef.current.removeEventListener("play", onPlay);
            audioRef.current.removeEventListener("pause", onPause);
            audioRef.current.pause();
            audioRef.current.removeAttribute("src");
            audioRef.current.load();
            audioRef.current = null;
        };
    }, [src, loop, downloadable]);

    async function onToggle() {
        if (!audioRef.current || !canPlay) {
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
            return;
        }

        try {
            await audioRef.current.play();
        } catch (error) {
            console.log(error);
        }
    }

    function download() {
        if (!audioRef.current || !canPlay) {
            return;
        }

        const link = document.createElement("a");
        link.setAttribute("href", audioRef.current.src);
        link.setAttribute("download", "");
        link.click();
    }

    function onValueChange(value) {
        if (typeof value === "number") {
            setCurrentTime(value);

            if (audioRef.current) {
                audioRef.current.currentTime = value;
            }
        }
    }

    function formatDuration(seconds) {
        const totalSeconds = Math.floor(seconds);

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) {
            return `${h}:${m}:${String(s).padStart(2, "0")}`;
        }

        return `${m}:${String(s).padStart(2, "0")}`;
    }

    return (
        <Card>
            <CardPanel>
                <div className="flex flex-col gap-6">
                    {title && (
                        <span className="text-center font-medium tracking-tight truncate">{title}</span>
                    )}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <span className="text-sm tabular-nums">{formatDuration(currentTime)}</span>
                            <span className="text-sm tabular-nums">{formatDuration(duration)}</span>
                        </div>
                        <Slider value={currentTime} onValueChange={onValueChange} max={duration > 0 ? duration : 100} disabled={!canPlay} />
                    </div>
                    <div className="flex  justify-center gap-2">
                        <Button className="aspect-square" variant="outline" onClick={onToggle} disabled={!canPlay}>
                            {canPlay ? (
                                isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />
                            ) : (
                                <Spinner />
                            )}
                        </Button>
                        {downloadable && (
                            <Button className="aspect-square" variant="outline" onClick={download} disabled={!canPlay}>
                                {canPlay ? (
                                    <Download />
                                ) : (
                                    <Spinner />
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardPanel>
        </Card>
    );
}
