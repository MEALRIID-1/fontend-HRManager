import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getDashboardUrl(role: string): string {
  switch (role.toUpperCase()) {
    case "EMPLOYE":
      return "/employe/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "RH":
      return "/rh/dashboard";
    case "DIRECTEUR":
    case "ADMIN":
      return "/directeur/dashboard";
    default:
      return "/auth/login";
  }
}

export default function DashboardPage() {
  const role = cookies().get("rh_user_role")?.value ?? "EMPLOYE";

  redirect(getDashboardUrl(role));
}
