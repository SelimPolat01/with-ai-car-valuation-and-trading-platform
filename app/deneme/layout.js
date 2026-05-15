import Header from "@/app/components/Header";
import classes from "./Deneme.module.css";

export const metadata = {
  title: "Deneme",
  description: "Deneme",
};

export default function DenemeLayout({ children }) {
  return (
    <>
      <Header className="purpleColorLink" />
      <main className={classes.rootMain}>{children}</main>
    </>
  );
}
