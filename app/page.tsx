"use client";

import Home from "./home";
import NoSsrWrapper from "./no-ssr-wrapper";

export default function HomePage() {
    return (
        <NoSsrWrapper>
            <Home />
        </NoSsrWrapper>
    );
}
