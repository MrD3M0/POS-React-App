import { useEffect, useState, type Dispatch } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  T_BillingItem,
  T_ShowBillingItem,
} from "@/pages/billing/types/types";
import { toast } from "sonner";

type T_cartUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  itemDisplayName?: string;
  itemQuantityLimit?: number;
  currentQuantity?: number; // ✅ Parent le pass garcha — no need to read cart here
  setVisibleCart: Dispatch<React.SetStateAction<T_ShowBillingItem[]>>;
  setActualCart: Dispatch<React.SetStateAction<T_BillingItem[]>>;
};

export const UpdateCartDialog: React.FC<T_cartUpdateDialogProps> = ({
  open,
  onOpenChange,
  productId,
  itemDisplayName,
  itemQuantityLimit = 99,
  currentQuantity = 1,
  setVisibleCart,
  setActualCart,
}) => {
  const [quantity, setQuantity] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setQuantity(String(currentQuantity));
    setError("");
  }, [currentQuantity, open]);

  const handleSave = () => {
    const qty = Math.floor(Number(quantity));

    if (quantity.trim() === "" || isNaN(qty) || qty < 1) {
      setError("Quantity must be at least 1");
      toast.error("Quantity must be at least 1");
      return;
    }
    if (qty > itemQuantityLimit) {
      setError(`Quantity cannot exceed ${itemQuantityLimit}`);
      toast.error(`Quantity cannot exceed ${itemQuantityLimit}`);
      return;
    }

    setVisibleCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item,
      ),
    );
    setActualCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item,
      ),
    );

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Quantity</DialogTitle>
          <DialogDescription>
            Change the quantity for <strong>{itemDisplayName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              min={1}
              max={itemQuantityLimit}
              className="col-span-3"
              onChange={(e) => {
                const raw = e.target.value;
                const sanitized = raw === "" ? "" : String(Number(raw));
                setQuantity(sanitized);
                setError("");
              }}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 col-span-4 text-center">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
