import Header from "@/app/components/Header";

export const metadata = {
  title: "Otomobil Detayları",
  description: "Otomobil Detayları.",
};

export default function CarDetailLayout({ children }) {
  return (
    <div className="bgGetPriceOffer">
      <Header className="blackColorLink" />
      <main className="rootMain">{children}</main>
    </div>
  );
}
