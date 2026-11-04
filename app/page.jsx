import { AudioPlayer } from "@/components/ui/audio-player";
import ConvolverWrapper from "./convolver-wrapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="bg-accent grid grid-cols-[minmax(1rem,1fr)_minmax(0,37.5rem)_minmax(1rem,1fr)] gap-px">
            <div className="bg-background" />
            <div className="bg-background px-4 py-16 md:px-16 flex flex-col gap-8 relative">
                <h1 className="text-center text-[3rem] font-medium tracking-tight">Convolver</h1>
                <p className="text-center">Rasakan efek audio seolah-olah diputar di aula konser, menara, atau auditorium.</p>
                <div className="flex flex-col gap-6">
                    <AudioPlayer title="Contoh tanpa convolver" src="/examples/without-convolver.mp3" loop />
                    <AudioPlayer title="Contoh dengan convolver" src="/examples/with-convolver.mp3" loop />
                </div>
                <span className="w-2 h-2 bg-neutral-800 ring ring-neutral-700 rounded-xs absolute bottom-0 left-0 -translate-x-[calc(50%+0.03125rem)] translate-y-[calc(50%+0.03125rem)] z-10" />
                <span className="w-2 h-2 bg-neutral-800 ring ring-neutral-700 rounded-xs absolute bottom-0 right-0 translate-x-[calc(50%+0.03125rem)] translate-y-[calc(50%+0.03125rem)] z-10" />
            </div>
            <div className="bg-background" />
            <div className="bg-background" />
            <div className="bg-background px-4 py-16 md:px-16 flex flex-col gap-8 relative">
                <ConvolverWrapper />
                <Alert>
                    <InfoIcon />
                    <AlertTitle>Tip</AlertTitle>
                    <AlertDescription>Gunakan headset untuk pengalaman mendengarkan yang lebih imersif.</AlertDescription>
                </Alert>
                <Alert>
                    <InfoIcon />
                    <AlertTitle>Bagaimana convolver bekerja?</AlertTitle>
                    <AlertDescription>
                        <div className="flex flex-col gap-4">
                            <p>Convolver bekerja dengan menerapkan teknik convolution pada audio menggunakan Impulse Response (IR) yang merepresentasikan karakteristik akustik suatu ruang.</p>
                            <p>Ketika audio diproses menggunakan IR yang dipilih, sistem mensimulasikan pantulan suara dan reverberasi sehingga audio terdengar seolah-olah diputar di lingkungan tertentu, seperti aula konser, menara, atau auditorium.</p>
                        </div>
                    </AlertDescription>
                </Alert>
                <span className="w-2 h-2 bg-neutral-800 ring ring-neutral-700 rounded-xs absolute bottom-0 left-0 -translate-x-[calc(50%+0.03125rem)] translate-y-[calc(50%+0.03125rem)] z-10" />
                <span className="w-2 h-2 bg-neutral-800 ring ring-neutral-700 rounded-xs absolute bottom-0 right-0 translate-x-[calc(50%+0.03125rem)] translate-y-[calc(50%+0.03125rem)] z-10" />
            </div>
            <div className="bg-background" />
            <div className="bg-background" />
            <div className="bg-background px-4 py-16 md:px-16 flex justify-center">
                <Button variant="outline" render={
                    <a href="https://github.com/pikriawan/convolver" target="_blank">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                        </svg>
                        GitHub
                    </a>
                } />
            </div>
            <div className="bg-background" />
        </div>
    );
}
