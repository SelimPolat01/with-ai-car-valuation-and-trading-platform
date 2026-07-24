export const metadata = {
  title: "Giriş Yap",
  description: "Giriş yapma ekranı.",
};

export default function LoginLayout({ children }) {
  return (
    <div className="loginLayoutWrapper">
      <div>
        <div className="pageHeading">
          <h1>Giriş Yap</h1>
          <span className="subHeading">Tekrar Hoşgeldiniz!</span>
        </div>
      </div>
      <div className="whiteFormSection">{children}</div>
    </div>
  );
}
