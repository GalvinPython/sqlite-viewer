import { Html, Main, Head, NextScript } from "next/document";

export default function Document() {
    return (
        <>
            <Head>
                <link href="/favicon.svg" rel="icon" />
            </Head>
            <Html lang="en">
                <body
                    className="antialiased"
                    style={{
                        backgroundColor: "var(--background-color)",
                        color: "var(--text-color)",
                    }}
                >
                    <Main />
                    <NextScript />
                </body>
            </Html>
        </>
    );
}
