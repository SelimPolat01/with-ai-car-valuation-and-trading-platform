import Dropdown from "@/app/components/Dropdown";

export default function Home() {
  return (
    <main className="container">
      <div className="dropdownContainer">
        <div>
          <h2>Araç bilgilerini gir.</h2>
        </div>
        <div>
          <p style={{ color: "#FF6B6B" }}>Aracını hemen sat.</p>
        </div>
        <Dropdown />
      </div>
      {/* <div>
          <h1>
            Aracın değerini biliyor musun ?
            <p>
              Senden istenilen formları eksiksiz doldur,
              <br />
              aracın değeri, senin için <span>saniyeler içinde</span>
              hesaplansın! <br />
            </p>
          </h1>
        </div> */}
    </main>
  );
}
