import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    res.status(501).json({ error: "Not Implemented" });

    return;
}

// Disable body parser so that we can handle binary files
export const config = {
    api: {
        bodyParser: false,
    },
};
