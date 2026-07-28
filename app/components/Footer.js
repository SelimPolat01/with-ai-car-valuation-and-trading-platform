import Link from "next/link";
import classes from "./Footer.module.css";
import { FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <hr className={classes.hr} />

      <ul className={classes.navUl}>
        <li>
          <Link href="/hakkimizda" className={classes.navLink}>
            Hakkımızda
          </Link>
        </li>
        <li>
          <Link href="/iletisim" className={classes.navLink}>
            İletişim
          </Link>
        </li>
        <li>
          <Link href="/sikca-sorulan-sorular" className={classes.navLink}>
            Sıkça Sorulan Sorular
          </Link>
        </li>
      </ul>

      <ul className={classes.iconUl}>
        <li className={classes.iconLi}>
          <Link href="#!" title="Instagram" className={classes.iconCircleDiv}>
            <FaInstagram size={20} />
          </Link>
          <Link
            href="https://www.linkedin.com/in/selim-polat-6245553a1/"
            title="LinkedIn"
            className={classes.iconCircleDiv}
            target="_blank"
          >
            <FaLinkedinIn size={20} />
          </Link>
          <Link
            href="https://www.linkedin.com/in/selim-polat/1"
            title="Github"
            className={classes.iconCircleDiv}
            target="_blank"
          >
            <FaGithub size={20} />
          </Link>
        </li>
      </ul>

      <div className={classes.copyright}>
        {`Copyright © 2025 - ${currentYear} Selim POLAT`}{" "}
      </div>
    </footer>
  );
}
