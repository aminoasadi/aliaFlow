import { redirect } from "next/navigation";
import { sectionSchemas } from "../../../lib/sections.schema";

export default function AdminHomePage() {
  const [firstKey] = Object.keys(sectionSchemas);
  redirect(`/admin/sections/${firstKey}`);
}
