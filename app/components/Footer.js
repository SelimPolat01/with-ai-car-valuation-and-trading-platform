import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <hr className="hr" />
      <ul className="iconUl">
        <li className="iconLi">
          <Link href="#!" title="Instagram">
            <div className="iconCircleDiv">
              <i className="fab fa-instagram"></i>
            </div>
          </Link>
          <Link href="#!" title="X">
            <div className="iconCircleDiv">
              <i className="fab fa-x-twitter"></i>
            </div>
          </Link>
          <Link href="#!" title="Github">
            <div className="iconCircleDiv">
              <i className="fab fa-github"></i>
            </div>
          </Link>
        </li>
      </ul>
      <div className="copyright">Copyright &copy; Selim POLAT 2025</div>
    </footer>
  );
}
