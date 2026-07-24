export const metadata = {
  title: "Ana Sayfa",
  description: "Yapay zeka ile araç tanıma ekranı.",
};

export default function HomeLayout({ children }) {
  return (
    <div>
      <main className="homeMain">{children}</main>
    </div>
  );
}
