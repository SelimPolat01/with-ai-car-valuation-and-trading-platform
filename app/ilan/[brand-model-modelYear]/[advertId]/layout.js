import Header from "@/app/components/Header";

export const metadata = {
  title: "İlan Detayı",
  description: "İlan Detayı.",
};

export default function AdvertDetailLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className="rootMain">{children}</main>
    </>
  );
}
