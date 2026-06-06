import Header from "@/app/components/Header";

export const metadata = {
  title: "İlan Düzenle",
  description: "İlan Düzenle.",
};

export default function EditAdvertLayout({ children }) {
  return (
    <main className="mainBg">
      <Header />
      <div className="rootMain">{children}</div>
    </main>
  );
}
