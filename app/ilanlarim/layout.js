import Header from "@/app/components/Header";
import classes from "./Ilanlarim.module.css";

export const metadata = {
  title: "İlanlarım",
  description: "İlanlarım.",
};

export default function MyAdvertsLayout({ children }) {
  return (
    <main className="mainBg">
      <Header />
      <div className={classes.rootMain}>{children}</div>
    </main>
  );
}
