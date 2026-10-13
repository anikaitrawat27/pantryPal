import Link from "next/link";
import { JarLogo } from "@/components/Doodle";
import ui from "@/components/ui.module.css";

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: "center", paddingTop: 32 }}>
      <JarLogo size={140} />
      <h1>This shelf is empty</h1>
      <p>We could not find that page.</p>
      <Link href="/recipes" className={ui.button}>
        Browse recipes
      </Link>
    </div>
  );
}
