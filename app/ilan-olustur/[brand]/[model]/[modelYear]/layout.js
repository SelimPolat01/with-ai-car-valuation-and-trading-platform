import classes from "./TahminYap.module.css";
import BackgroundWrapper from "@/app/components/BackgroundWrapper";

export const metadata = {
  title: "Fiyat Teklif",
  description: "Fiyat Teklif Alma Ekranı.",
};

export default function GetPriceOfferLayout({ children }) {
  return (
    <BackgroundWrapper>
      <main className={classes.rootMain}>{children}</main>
    </BackgroundWrapper>
  );
}
