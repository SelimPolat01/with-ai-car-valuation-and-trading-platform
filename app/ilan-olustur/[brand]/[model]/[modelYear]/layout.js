import classes from "./TahminYap.module.css";

export const metadata = {
  title: "Fiyat Teklif",
  description: "Fiyat Teklif Alma Ekranı.",
};

export default function GetPriceOfferLayout({ children }) {
  return <main className={classes.rootMain}>{children}</main>;
}
