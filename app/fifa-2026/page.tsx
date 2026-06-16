import { redirect } from "next/navigation";

// The FIFA dashboard moved under /contests. Keep this path working for any
// links already shared with the group.
export default function FifaRedirect() {
  redirect("/contests/fifa-2026");
}
