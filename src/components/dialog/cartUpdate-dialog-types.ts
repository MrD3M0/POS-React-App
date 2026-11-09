/**
 * Shapes for the legacy billing cart shown in the "Update Quantity" dialog.
 * `T_ShowBillingItem` is what the UI renders; `T_BillingItem` is what gets
 * sent to the billing endpoint when the sale is finalized.
 */
export type T_BillingItem = {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
};

export type T_ShowBillingItem = T_BillingItem & {
  itemDisplayName?: string;
};
