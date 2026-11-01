"use client";

import dynamic from "next/dynamic";

const ConvolverWrapper = dynamic(() => import("./convolver"), { ssr: false });

export default ConvolverWrapper;
