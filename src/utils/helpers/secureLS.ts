import Keys from "../constants/keys";
import { IAuthRegister } from "@/@types/auth.type";
import secureLocalStorage from "react-secure-storage";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const set = (key: string, value: string | number | boolean | object) => {
  secureLocalStorage.setItem(key, value);
};

const get = (key: string) => {
  return secureLocalStorage.getItem(key);
};

const remove = (key: string) => {
  return secureLocalStorage.removeItem(key);
};

const removeToken = () => {
  return deleteCookie(Keys.REACT_APP_ACCESS_TOKEN);
};

const setToken = (value: any) => {
  setCookie(Keys.REACT_APP_ACCESS_TOKEN, value);
};

const getToken = () => {
  try {
    return getCookie(Keys.REACT_APP_ACCESS_TOKEN);
  } catch (error) {
    return null;
  }
};

const getProfile = (): IAuthRegister | null => {
  try {
    return (
      (secureLocalStorage.getItem(Keys.USER_INFO) as IAuthRegister) || null
    );
  } catch (error) {
    return null;
  }
};

const removeProfile = () => {
  return secureLocalStorage.removeItem(Keys.USER_INFO);
};

const setProfile = (value: IAuthRegister) => {
  try {
    secureLocalStorage.setItem(Keys.USER_INFO, value);
  } catch (error) {
    console.log(error);
  }
};

const clear = () => {
  return secureLocalStorage.clear();
};

const getUserId = () => {
  return getCookie(Keys.USER_ID);
};

const setUserId = (value: string) => {
  setCookie(Keys.USER_ID, value);
};

const deleteUserId = () => {
  return deleteCookie(Keys.USER_ID);
};

const Secure = {
  set,
  setToken,
  get,
  getToken,
  remove,
  removeToken,
  getProfile,
  setProfile,
  removeProfile,
  clear,
  getUserId,
  deleteUserId,
  setUserId,
};

export default Secure;
