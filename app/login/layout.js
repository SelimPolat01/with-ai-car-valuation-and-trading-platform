import Header from "@/app/components/Header";

export const metadata = {
  title: "Giriş yap",
  description: "Giriş sayfası.",
};

export default function LoginLayout({ children }) {
  return (
    <>
      <div className="bgLogin">
        <Header />
        <div className="pageHeading">
          <h1>Giriş Yap</h1>
          <span className="subHeading">Tekrar Hoşgeldiniz!</span>
        </div>
      </div>
      <main className="rootMain">{children}</main>
    </>
  );
}
