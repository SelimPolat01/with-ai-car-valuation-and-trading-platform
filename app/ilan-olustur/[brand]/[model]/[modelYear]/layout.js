import classes from "./TahminYap.module.css";

export const metadata = {
  title: "Fiyat Teklif",
  description: "Fiyat Teklif Alma Ekranı.",
};

export default function GetPriceOfferLayout({ children }) {
  return <div className={classes.div}>{children}</div>;
}
