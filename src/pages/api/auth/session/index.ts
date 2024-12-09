import UserService from "@/services/user.service";
import Secure from "@/utils/helpers/secureLS";
import { NextApiRequest,NextApiResponse } from "next";

// Api to get Current session from Aceess token
export default async function handler(request:NextApiRequest,response:NextApiResponse) {
    switch (request.method){
      case "POST":
      const {token}=request.body
      if (!token) {
        return response.status(401).json({message:"Unauthorized"})
      }
      const user=UserService.decodeAcessToken(token)
      return response.status(200).json({user})

      default :
     return response.status(400).json({"message":"Method not allowed"})
    }

}