import Header from "@/app/components/Header";

export const metadata = {
  title: "Tüm İlanlar",
  description: "Tüm ilanlar.",
};

export default function AllAdvertsLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className="rootMain">{children}</main>
    </>
  );
}
