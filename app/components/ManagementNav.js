import Link from "next/link";
import classes from "./ManagementNav.module.css";
import { useParams, usePathname } from "next/navigation";

export default function ManagementNav({ className }) {
  const path = usePathname();
  const params = useParams;

  return (
    <nav className={`${classes.nav} ${className ? className : ""}`}>
      <ul className={classes.ul}>
        <li>
          <Link
            className={path === "/ilanlarim" ? classes.active : ""}
            href="/ilanlarim"
          >
            İlanlarım
          </Link>
        </li>
        <li>
          <Link
            className={path === "/favori-ilanlar" ? classes.active : ""}
            href="/favori-ilanlar"
          >
            Favorilerim
          </Link>
        </li>{" "}
        <li>
          <Link
            className={path === "/mesajlarim" ? classes.active : ""}
            href={"/mesajlarim"}
          >
            Mesajlarım
          </Link>
        </li>
        <li>
          <Link
            className={path === "/hesabim" ? classes.active : ""}
            href="/hesabim"
          >
            Hesabım
          </Link>
        </li>
      </ul>
    </nav>
  );
}
