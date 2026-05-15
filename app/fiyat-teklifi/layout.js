import Header from "@/app/components/Header";
import classes from "./FiyatTeklifi.module.css";

export const metadata = {
  title: "Fiyat Teklifi",
  description: "Fiyat Teklifi.",
};

export default function PriceOfferLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className={classes.rootMain}>{children}</main>
    </>
  );
}
