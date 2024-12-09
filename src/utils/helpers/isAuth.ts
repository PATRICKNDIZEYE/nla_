import { jwtDecode } from "jwt-decode";
import Secure from "./secureLS";

const isAuth = (token = Secure.getToken()) => {
  if (!token) return null;
  try {
    const jwt: { exp: number; sub: string } = jwtDecode(`${token}`);
    const now = new Date();
    if (now.getTime() > jwt.exp * 1000) {
      Secure.removeToken();
      return null;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export default isAuth;
