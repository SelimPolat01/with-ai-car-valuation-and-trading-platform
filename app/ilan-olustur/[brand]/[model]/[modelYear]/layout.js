import Header from "@/app/components/Header";
import classes from "./TahminYap.module.css";

export const metadata = {
  title: "Fiyat Teklif Alma",
  description: "Fiyat Teklif Alma.",
};

export default function GetPriceOfferLayout({ children }) {
  return (
    <div className="bgGetPriceOffer">
      <Header className="blackColorLink" />
      <main className={classes.rootMain}>{children}</main>
    </div>
  );
}
