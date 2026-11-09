import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { AuthModel, UserModel } from "@/lib/models";

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthModel> => {
  console.log(email, password);
  const response = await axiosInstance.post(UrlConstants.LOGIN_URL, {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async (
  username: string,
  email: string,
  password: string,
): Promise<string> => {
  const response = await axiosInstance.post(UrlConstants.REGISTER_URL, {
    username,
    email,
    password,
  });
  return response.data.message || "Registered successfully";
};

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.get(UrlConstants.LOGOUT_URL);
};

export const getCurrentUser = async (): Promise<{ data: UserModel }> => {
  const response = await axiosInstance.get(UrlConstants.ME_URL);
  return response.data;
};
