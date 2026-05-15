import Header from "@/app/components/Header";

export const metadata = {
  title: "Fiyat Teklif Alma",
  description: "Fiyat Teklif Alma.",
};

export default function GetPriceOfferLayout({ children }) {
  return (
    <div className="bgGetPriceOffer">
      <Header className="blackColorLink" />
      <main className="rootMain">{children}</main>
    </div>
  );
}
