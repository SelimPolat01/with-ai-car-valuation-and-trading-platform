import Header from "@/app/components/Header";
import classes from "./Ilanlarim.module.css";

export const metadata = {
  title: "İlanlarım",
  description: "İlanlarım.",
};

export default function MyAdvertsLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className={classes.rootMain}>{children}</main>
    </>
  );
}
