export const metadata = {
  title: "Giriş Yap",
  description: "Giriş yapma ekranı.",
};

export default function LoginLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
      }}
    >
      <div className="bgLogin">
        <div className="pageHeading">
          <h1>Giriş Yap</h1>
          <span className="subHeading">Tekrar Hoşgeldiniz!</span>
        </div>
      </div>
      <main className="whiteFormSection">{children}</main>
    </div>
  );
}
