import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import Keys from "@/utils/constants/keys";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { parcelId } = req.body;
      const { data } = await axios.get<ILandResponse>(
        `${Keys.NLA_API_URL}?upi=${parcelId}`,
        {
          timeout: 10000,
        }
      );
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
