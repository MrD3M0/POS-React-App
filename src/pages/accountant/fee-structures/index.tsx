import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import QUERY_KEYS from "@/lib/query-keys";
import type { ReactNode } from "react";

import { listFeeStructures, createFeeStructure } from "./service/service";
import FeeStructureFormDialog from "./dialog/fee-structure-form";

const LIMIT = 20;

export default function AccountantFeeStructuresPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEES_STRUCTURE, page],
    queryFn: () => listFeeStructures({ page, limit: LIMIT }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_FEE_STRUCTURE[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="p-5">
      <PageHeader
        title="Fee Structures"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Fee Structures", link: "/accountant/fee-structures" }]}
        createPage="/accountant/fee-structures?mode=create"
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Fee Structure</Button>
      </div>

      <GenericTable
        tableHeads={[
          { key: "courseName", headName: "Course / Batch", minWidth: 260 },
          { key: "termLabel", headName: "Term", minWidth: 180 },
          { key: "headCode", headName: "Fee Head", minWidth: 180 },
          { key: "amount", headName: "Amount ( NPR )", minWidth: 180 },
          { key: "isCollected", headName: "Status", minWidth: 120, render: (f) => <Badge variant={f.isCollected ? "success" : f.hasCustom ? "warning" : "default"}>{f.isCollected ? "Collected" : f.hasCustom ? "Has Custom" : "Pending"}</Badge> },
        ]}
        data={rows}
        emptyTitle="No fee structures."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderRow={(f) => ({
          courseName: f.courseName, termLabel: f.termLabel,
          headCode: `${f.feeHeadCode}-${String(f.amount).slice(-4)}`, isCollected: f.isCollected, hasCustom: f.hasCustom,
        } as Record<string, ReactNode>)}
      />

      {createOpen && <FeeStructureFormDialog mode="create" onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

type T_FEE_STRUCTURE = {
  id: string;
  courseName: string;
  batchId?: string;
  termLabel: string;
  feeHeadCode: string;
  amount: number;
  isCollected: boolean;
  hasCustom: boolean;
};

// custom fee action dialog — add custom fee / discount / skip / split
void createFeeStructure; // for import completeness
