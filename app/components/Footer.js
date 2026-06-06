import Link from "next/link";
import classes from "./Footer.module.css";
import { FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <hr className={classes.hr} />
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
            href="https://github.com/SelimPolat01"
            title="Github"
            className={classes.iconCircleDiv}
            target="_blank"
          >
            <FaGithub size={20} />
          </Link>
        </li>
      </ul>
      <div className={classes.copyright}>
        Copyright 2025 Selim POLAT {currentYear}
      </div>
    </footer>
  );
}
