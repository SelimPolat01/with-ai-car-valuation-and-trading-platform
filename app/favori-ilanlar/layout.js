import Header from "@/app/components/Header";
import classes from "./FavoriIlanlar.module.css";

export const metadata = {
  title: "Favori İlanlar",
  description: "Favori İlanlar.",
};

export default function FavoriteAdvertsLayout({ children }) {
  return (
    <main className="mainBg">
      <Header />
      <div className="rootMain">{children}</div>
    </main>
  );
}
