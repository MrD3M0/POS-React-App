// components/dialog/bill-receipt-dialog.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button  from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type BillCategory = {
  id: string;
  name: string;
  shortName: string;
};

type BillProduct = {
  id: string;
  name: string;
  shortName: string;
  price: number;
  quantity: number;
  category: BillCategory;
};

type BillItem = {
  id: string;
  billId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  product: BillProduct;
};

type BillUser = {
  id: string;
  username: string;
  email: string;
};

export type T_BillData = {
  id: string;
  billNumber: number;
  userId: string;
  total: number;
  discountType: "Percentage" | "Fixed" | "None";
  discount: number;
  finalBillAmount: number;
  createdAt: string;
  updatedAt: string;
  billItems: BillItem[];
  user: BillUser;
};

type BillReceiptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: T_BillData | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-NP", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatBillNumber = (n: number) => `BILL-${String(n).padStart(4, "0")}`;

const discountLabel = (bill: T_BillData) => {
  if (!bill.discount) return null;
  return bill.discountType === "Percentage"
    ? `${bill.discount}%`
    : `Rs. ${bill.discount}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function BillReceiptDialog({
  open,
  onOpenChange,
  bill,
}: BillReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${bill ? formatBillNumber(bill.billNumber) : "Bill"}</title>
          <style>
            /* 1. Force the printer to use 80mm thermal paper width, auto height */
            @page {
              size: 80mm auto;
              margin: 0; /* Removes default browser headers and footers */
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            /* 2. Constrain the body to exactly the roll width with small padding */
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              color: #000; 
              background: #fff; 
              width: 80mm; 
              padding: 4mm; /* Keep text slightly away from the exact edge */
              margin: 0 auto;
            }

            .receipt { width: 100%; }
            .center { text-align: center; }
            .bold { font-weight: 700; }
            .divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
            .divider-solid { border: none; border-top: 1px solid #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-weight: 700; padding: 2px 0; font-size: 11px; }
            td { padding: 2px 0; vertical-align: top; font-size: 11px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .row-total { font-weight: 600; }
            .summary-label { font-weight: 600; }
            .grand-total { font-weight: 700; font-size: 14px; }
            .muted { color: #555; font-size: 11px; }
            .mt { margin-top: 6px; }
            .mb { margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${content}
          </div>
        </body>
      </html>
    `);

    win.document.close();

    // Add a tiny delay to ensure the browser loads the CSS before opening the print dialog
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 250);
  };

  if (!bill) return null;

  const discount = discountLabel(bill);
  const savingsAmount = bill.total - bill.finalBillAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-base font-semibold">
            Bill Receipt — {formatBillNumber(bill.billNumber)}
          </DialogTitle>
        </DialogHeader>

        {/* ── Printable Area ── */}
        <div className="overflow-y-auto max-h-[65vh] px-5 py-4">
          <div ref={printRef} className="receipt">
            {/* Header */}
            <div
              className="center mb"
              style={{ textAlign: "center", marginBottom: 8 }}
            >
              <div
                className="bold"
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "monospace",
                }}
              >
                ZAP BILLING SYSTEM
              </div>
              <div
                className="muted"
                style={{
                  color: "#6b7280",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                Store Name:{bill.user.username}
              </div>
              <div
                className="muted mt"
                style={{
                  color: "#6b7280",
                  fontSize: 11,
                  marginTop: 4,
                  fontFamily: "monospace",
                }}
              >
                {formatDate(bill.createdAt)}
              </div>
            </div>

            <hr
              className="divider-solid"
              style={{
                border: "none",
                borderTop: "1px solid #000",
                margin: "8px 0",
              }}
            />

            {/* Bill No */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "monospace",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span style={{ fontWeight: 600 }}>Bill No:</span>
              <span>{formatBillNumber(bill.billNumber)}</span>
            </div>

            <hr
              className="divider"
              style={{
                border: "none",
                borderTop: "1px dashed #000",
                margin: "8px 0",
              }}
            />

            {/* Items Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      paddingBottom: 4,
                      fontWeight: 700,
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      paddingBottom: 4,
                      fontWeight: 700,
                    }}
                  >
                    Qty
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      paddingBottom: 4,
                      fontWeight: 700,
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      paddingBottom: 4,
                      fontWeight: 700,
                    }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {bill.billItems.map((item) => (
                  <tr key={item.id}>
                    <td
                      style={{
                        paddingTop: 3,
                        paddingBottom: 3,
                        verticalAlign: "top",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                      <div style={{ color: "#6b7280", fontSize: 10 }}>
                        {item.product.shortName}
                      </div>
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        paddingTop: 3,
                        verticalAlign: "top",
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        paddingTop: 3,
                        verticalAlign: "top",
                      }}
                    >
                      Rs. {item.unitPrice.toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        paddingTop: 3,
                        fontWeight: 600,
                        verticalAlign: "top",
                      }}
                    >
                      Rs. {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr
              className="divider"
              style={{
                border: "none",
                borderTop: "1px dashed #000",
                margin: "8px 0",
              }}
            />

            {/* Summary */}
            <div style={{ fontFamily: "monospace", fontSize: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span>Subtotal</span>
                <span>Rs. {bill.total.toLocaleString()}</span>
              </div>

              {discount && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span>Discount ({discount})</span>
                  <span>- Rs. {savingsAmount.toLocaleString()}</span>
                </div>
              )}

              <hr
                className="divider-solid"
                style={{
                  border: "none",
                  borderTop: "1px solid #000",
                  margin: "8px 0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <span>TOTAL</span>
                <span>Rs. {bill.finalBillAmount.toLocaleString()}</span>
              </div>
            </div>

            <hr
              className="divider"
              style={{
                border: "none",
                borderTop: "1px dashed #000",
                margin: "8px 0",
              }}
            />

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                fontFamily: "monospace",
                fontSize: 11,
                color: "#6b7280",
              }}
            >
              Thank you for your purchase!
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-1.5" />
            Close
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print Bill
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
