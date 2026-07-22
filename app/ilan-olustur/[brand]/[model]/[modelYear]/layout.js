import Header from "@/app/components/Header";
import classes from "./TahminYap.module.css";
import { BackgroundWrapper } from "@/app/components/BackgroundWrapper";

export const metadata = {
  title: "Fiyat Teklif Alma",
  description: "Fiyat Teklif Alma.",
};

export default function GetPriceOfferLayout({ children }) {
  return (
    <BackgroundWrapper>
      <Header />
      <main className={classes.rootMain}>{children}</main>
    </BackgroundWrapper>
  );
}
