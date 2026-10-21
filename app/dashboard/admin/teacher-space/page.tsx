import { redirect } from "next/navigation";

export default function TeacherSpaceRedirect() {
  redirect("/dashboard/admin/teachers");
}
