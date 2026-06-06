import Header from "@/app/components/Header";

export const metadata = {
  title: "İlan Detayı",
  description: "İlan Detayı.",
};

export default function AdvertDetailLayout({ children }) {
  return (
    <main className="mainBg">
      <Header />
      <div className="rootMain">{children}</div>
    </main>
  );
}
