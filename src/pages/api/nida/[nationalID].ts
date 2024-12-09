import { IProfile } from "@/@types/profile.type";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import Keys from "@/utils/constants/keys";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "POST":
      try {
        const { nationalID } = req.query;
        const { data } = await axios.get<{
          GetCitizenResult: IProfile;
        }>(`${Keys.NIDA_API_URL}/${nationalID}`);
        return res.status(200).json(data.GetCitizenResult);
      } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
      }

    default:
      return res.status(400).json({
        message: "Invalid request method",
      });
  }
}
