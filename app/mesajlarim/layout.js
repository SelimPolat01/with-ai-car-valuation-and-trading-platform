import Header from "@/app/components/Header";
import classes from "./Mesajlarim.module.css";

export const metadata = {
  title: "Mesajlarım",
  description: "Mesajlarım.",
};

export default function MyMessgagesLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className={classes.rootMain}>{children}</main>
    </>
  );
}
