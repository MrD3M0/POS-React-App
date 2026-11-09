import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export { getPayslipById } from "../detail/service/service";
export type { T_PAYSLIP, T_PAYSLIP_ITEM } from "../detail/service/service";

export async function listMyPayslips(params: {
  page: number;
  limit: number;
  search?: string;
  employeeId?: string;
}) {
  const res = await axiosInstance.get(`${UrlConstants.PAYSLIP_URL}`, {
    params,
  });
  return res.data;
}
