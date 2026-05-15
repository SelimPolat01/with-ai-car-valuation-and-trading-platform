import Header from "@/app/components/Header";

export const metadata = {
  title: "Otomobil Detayları",
  description: "Otomobil Detayları.",
};

export default function CarDetailLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className="rootMain">{children}</main>
    </>
  );
}
