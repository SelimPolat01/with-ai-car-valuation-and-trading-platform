export const metadata = {
  title: "Kayıt Ol",
  description: "Kayıt olma ekranı.",
};

export default function RegisterLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
      }}
    >
      <div className="bgRegister">
        <div className="pageHeading">
          <h1>Kayıt Ol</h1>
          <span className="subHeading">
            Kaydolun ve Aracınızın Fiyatını Hemen Öğrenin!
          </span>
        </div>
      </div>
      <main className="whiteFormSection">{children}</main>
    </div>
  );
}
