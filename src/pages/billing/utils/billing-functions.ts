import type { T_BillingItem, T_ShowBillingItem } from "../types/types";

export const isItemInCart = (
  showCart: T_ShowBillingItem[],
  actualCart: T_BillingItem[],
  productId: string,
): boolean => {
  return showCart.some((item) => item.productId === productId) &&
         actualCart.some((item) => item.productId === productId);
};
