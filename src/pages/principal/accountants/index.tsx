import AccountantListPage from "@/pages/accountant/accountants";

/** Principal gets the same standard read-only accountants list, no CRUD. */
export default function PrincipalAccountantsPage() {
  return <AccountantListPage root={{ title: "Principal", link: "/principal" }} />;
}
