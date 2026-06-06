import Header from "@/app/components/Header";

export const metadata = {
  title: "Tüm İlanlar",
  description: "Tüm ilanlar.",
};

export default function AllAdvertsLayout({ children }) {
  return (
    <main className="mainBg">
      <Header />
      <div className="rootMain">{children}</div>
    </main>
  );
}
