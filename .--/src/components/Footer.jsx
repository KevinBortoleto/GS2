import "../css/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img
            src="/Agrotech logo.ico"
            alt="Logo Agrotech"
            className="footer-logo"
          />

          <div className="logo-slot-text">AgroView</div>

          <p className="footer-tagline">
            Monitoramento em tempo real da sua área. Conheça a amplitude do seu
            território e planeje o futuro do seu negócio.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} AgroView. Todos os direitos reservados.
        </span>

        <div className="footer-badge">
          <div className="footer-badge-dot" />
          Sistemas operacionais
        </div>
      </div>
    </footer>
  );
}
