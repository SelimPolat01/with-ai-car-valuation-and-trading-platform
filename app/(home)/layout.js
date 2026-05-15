import Header from "@/app/components/Header";

export default function HomeLayout({ children }) {
  return (
    <div className="bgHome">
      <Header />
      <main className="homeMain">{children}</main>
    </div>
  );
}
