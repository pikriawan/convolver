"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play } from "lucide-react";

export default function AudioPlayer({ src }) {
    const audioRef = useRef(null);
    const [canPlay, setCanPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        setCanPlay(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [src]);

    function onLoadedMetadata(event) {
        setDuration(event.target.duration);
    }

    function onTimeUpdate(event) {
        setCurrentTime(event.target.currentTime);
    }

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

    function onValueChange(value) {
        if (typeof value === "number") {
            setCurrentTime(value);

            if (audioRef.current) {
                audioRef.current.currentTime = value;
            }
        }
    }

    return (
        <>
            <audio
                src={src}
                className="hidden"
                ref={audioRef}
                onLoadedMetadata={onLoadedMetadata}
                onCanPlay={() => setCanPlay(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={onTimeUpdate}
            />
            <div className="p-4 flex gap-2 items-center bg-accent">
                <Button className="aspect-square" variant="ghost" onClick={onToggle} disabled={!canPlay}>
                    <Play fill="currentColor" />
                </Button>
                <Slider value={currentTime} onValueChange={onValueChange} max={duration > 0 ? duration : 100} disabled={!canPlay} />
            </div>
        </>
    );
}
