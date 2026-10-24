"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProgressButton({ progress, className, children, ...props }) {
    return (
        <Button
            className={cn("relative overflow-hidden", className)}
            variant={progress === undefined ? "default" : "outline"}
            disabled={progress !== undefined}
            {...props}
        >
            {progress !== undefined && (
                <div className="absolute top-0 left-0 h-full bg-accent" style={{ width: `${progress}%` }}></div>
            )}
            {children}
        </Button>
    );
}
