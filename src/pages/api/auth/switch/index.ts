import UserService from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

// An Api to create anew Access token

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case "POST":
      try {
        const { user, newRole } = req.body;
        const token = UserService.signInToken({
          id: user._id,
          phoneNumber: user.phoneNumber,
          role: newRole,
        });
        res.status(200).json({ token: token});
      } catch (e) {
        res.status(500).json({ message: (e as Error).message });
      }
    default:
      res.status(400).json({ message: "Only POST method is allowed" });
  }
}
