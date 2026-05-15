import Header from "@/app/components/Header";

export const metadata = {
  title: "İlan Düzenle",
  description: "İlan Düzenle.",
};

export default function EditAdvertLayout({ children }) {
  return (
    <>
      <Header className="blackColorLink" />
      <main className="rootMain">{children}</main>
    </>
  );
}
