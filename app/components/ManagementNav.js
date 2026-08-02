import Link from "next/link";
import classes from "./ManagementNav.module.css";
import { usePathname } from "next/navigation";

export default function ManagementNav({ className }) {
  const path = usePathname();

  return (
    <nav className={`${classes.nav} ${className ? className : ""}`}>
      <ul className={classes.ul}>
        <li>
          <Link
            className={path === "/mevcut-ilanlarim" ? classes.active : ""}
            href="/mevcut-ilanlarim"
          >
            Mevcut İlanlarım
          </Link>
        </li>
        <li>
          <Link
            className={path === "/satilan-ilanlarim" ? classes.active : ""}
            href="/satilan-ilanlarim"
          >
            Satılan İlanlarım
          </Link>
        </li>
        <li>
          <Link
            className={path === "/satin-aldigim-ilanlar" ? classes.active : ""}
            href="/satin-aldigim-ilanlar"
          >
            Satın Aldığım İlanlar
          </Link>
        </li>
        <li>
          <Link
            className={path === "/kaldirilan-ilanlarim" ? classes.active : ""}
            href="/kaldirilan-ilanlarim"
          >
            Kaldırılan İlanlarım
          </Link>
        </li>
        <li>
          <Link
            className={path === "/favori-ilanlarim" ? classes.active : ""}
            href="/favori-ilanlarim"
          >
            Favori İlanlarım
          </Link>
        </li>
      </ul>
    </nav>
  );
}
