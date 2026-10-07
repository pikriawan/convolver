"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardPanel } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export function AudioPlayer({ src, loop = false }) {
    const audioRef = useRef(null);
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

        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        const audio = new Audio(src);
        audioRef.current = audio;
        audioRef.current.loop = loop;

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

        audioRef.current.addEventListener("loadedmetadata", onLoadedMetadata);
        audioRef.current.addEventListener("timeupdate", onTimeUpdate);
        audioRef.current.addEventListener("play", onPlay);
        audioRef.current.addEventListener("pause", onPause);

        return () => {
            audioRef.current.removeEventListener("loadedmetadata", onLoadedMetadata);
            audioRef.current.removeEventListener("timeupdate", onTimeUpdate);
            audioRef.current.removeEventListener("play", onPlay);
            audioRef.current.removeEventListener("pause", onPause);
        };
    }, [src, loop]);

    async function onToggle() {
        if (!audioRef.current) {
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
                <div className="flex gap-2 items-center">
                    <Button className="aspect-square" variant="secondary" onClick={onToggle}>
                        {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                    </Button>
                    <span className="text-sm tabular-nums">{formatDuration(currentTime)}</span>
                    <Slider value={currentTime} onValueChange={onValueChange} max={duration > 0 ? duration : 100} />
                    <span className="text-sm tabular-nums">{formatDuration(duration)}</span>
                </div>
            </CardPanel>
        </Card>
    );
}
