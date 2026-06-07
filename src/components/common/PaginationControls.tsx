import { getPaginationItems } from "@/lib/utils.ts";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx";

interface Props {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ currentPage, lastPage, onPageChange }: Props) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === lastPage;

  return (
    <Pagination className="flex justify-end pt-4">
      <PaginationContent>
        <PaginationItem
          className={isFirstPage ? "pointer-events-none opacity-50" : ""}
          onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
        >
          <PaginationPrevious href="#" />
        </PaginationItem>

        {getPaginationItems(lastPage, currentPage).map((item, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              href="#"
              isActive={item === currentPage}
              onClick={() => typeof item === "number" && onPageChange(item)}
            >
              {item}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem
          className={isLastPage ? "pointer-events-none opacity-50" : ""}
          onClick={() => !isLastPage && onPageChange(currentPage + 1)}
        >
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
