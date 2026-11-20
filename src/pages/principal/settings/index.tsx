import { SettingsScreen } from "@/pages/admin/settings";

/**
 * The principal edits the college identity (name, logo, affiliation, email,
 * contact, website, programmes and signature) used on student ID cards.
 * The remaining sections are shown read-only.
 */
export default function PrincipalSettingsPage() {
  return <SettingsScreen scope="principal" />;
}
