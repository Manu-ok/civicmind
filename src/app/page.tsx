import { redirect } from "next/navigation";

export default function Home() {
  // Redirect the root path to our dashboard.
  // The dashboard layout's AuthGuard will automatically handle 
  // redirecting to /login if the user is not authenticated.
  redirect("/dashboard");
}
