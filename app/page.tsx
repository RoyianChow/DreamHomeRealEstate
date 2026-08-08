import { redirect } from "next/navigation";

/** The application always opens on the main menu. */
export default function Home() {
  redirect("/dashboard");
}
