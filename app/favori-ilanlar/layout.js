import Header from "@/app/components/Header";
import classes from "./FavoriIlanlar.module.css";

export const metadata = {
  title: "Favori İlanlar",
  description: "Favori İlanlar.",
};

export default function FavoriteAdvertsLayout({ children }) {
  return (
    <>
      <Header className="purpleColorLink" />
      <main className={classes.rootMain}>{children}</main>
    </>
  );
}
