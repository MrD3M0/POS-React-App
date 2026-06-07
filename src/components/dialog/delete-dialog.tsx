import { type FC, type ReactNode } from "react";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Assuming shadcn UI imports
import { type T_Response, type T_UseQueryError } from "@/types/common";

type GenericConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The ID of the item to delete */
  itemId: string;
  /** The generic mutation function to execute */
  onDelete: (id: string) => Promise<T_Response<any>>;
  /** Array of TanStack Query keys to invalidate upon success */
  queryKeysToInvalidate?: QueryKey[];
  /** Optional custom title. Defaults to "Confirm Deletion" */
  title?: string | ReactNode;
  /** Optional custom description. Defaults to a generic warning. */
  description?: string | ReactNode;
  /** Name of the entity being deleted (e.g., "preference", "user") to format default text */
  itemName?: string;
  /** Optional callback to run after a successful deletion */
  onSuccessCallback?: () => void;
};

const ConfirmDeleteDialog: FC<GenericConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  itemId,
  onDelete,
  queryKeysToInvalidate = [],
  title,
  description,
  itemName = "item",
  onSuccessCallback,
}) => {
 
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => onDelete(itemId),
    onSuccess: (res) => {
      toast.success(res?.message || `Successfully deleted ${itemName}`);

      // Dynamically invalidate any queries passed in by the parent
      if (queryKeysToInvalidate.length > 0) {
        queryKeysToInvalidate.forEach((queryKey) => {
          qc.invalidateQueries({ queryKey });
        });
      }

      onSuccessCallback?.();
      onOpenChange(false);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(
        error.response?.data?.message || `Failed to delete ${itemName}`,
      );
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {title ??
            `Delete ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`}
        </DialogTitle>
        <p className="mt-3 mb-5 text-muted-foreground">
          {description ??
            `Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            loading={deleteMutation.isPending}
            disabled={deleteMutation.isPending}
            // If your Button component supports a `loading` prop, you can swap `disabled` for `loading={deleteMutation.isPending}`
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
