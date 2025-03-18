import { Html, Main, Head, NextScript } from "next/document";

import Footer from "@/components/Footer";

export default function Document() {
    return (
        <>
            <Head>
                <link href="/favicon.svg" rel="icon" />
            </Head>
            <Html lang="en">
                <body
                    className="antialiased flex flex-col min-h-screen"
                    style={{
                        backgroundColor: "var(--background-color)",
                        color: "var(--text-color)",
                    }}
                >
                    <Main />
                    <NextScript />
                    <Footer />
                </body>
            </Html>
        </>
    );
}
