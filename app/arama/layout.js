import Header from "@/app/components/Header";

export const metadata = {
  title: "Otomobil Arama",
  description: "Otomobil Arama.",
};

export default function CarDetailLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className="rootMain">{children}</main>
    </>
  );
}
