import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Kayıt ol",
  description: "Kayıt olma sayfası.",
};

export default function RegisterLayout({ children }) {
  return (
    <>
      <div className="bgRegister">
        <Header />
        <div className="pageHeading">
          <h1>Kayıt Ol</h1>
          <span className="subHeading">
            Kaydolarak Aracınızın Fiyatını Hemen Öğrenin!
          </span>
        </div>
      </div>

      <main className="rootMain">{children}</main>
    </>
  );
}
