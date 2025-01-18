import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    res.status(501).json({ error: "Not Implemented" });

    return;
}
