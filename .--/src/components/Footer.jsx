import { useState } from "react";
r;

export default function Footer() {
  return (
    <>
      <style>{STYLES}</style>
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ position: "relative", marginBottom: 12 }}>
              <div className="logo-slot">
                <div className="logo-slot-text">AgroView</div>
              </div>
              <img src="././public/Agrotech logo.ico" alt="Logo Agrotech" />
            </div>

            <p className="footer-tagline">
              Monitoramento em tempo real da sua área. Conheça a amplitude do
              seu território e planeje o futuro do seu negócio.
            </p>

            <div className="footer-social">
              <button className="social-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </button>
              <button className="social-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </button>
              <button className="social-btn" aria-label="Twitter">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4l16 16M4 20L20 4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Produto</div>
            <ul className="footer-links">
              {[
                "Monitoramento",
                "Mapeamento",
                "Alertas",
                "Relatórios",
                "Preços",
              ].map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Empresa</div>
            <ul className="footer-links">
              {["Sobre nós", "Blog", "Carreiras", "Parceiros", "Imprensa"].map(
                (l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Suporte</div>
            <ul className="footer-links">
              {[
                "Documentação",
                "Central de ajuda",
                "Contato",
                "Status",
                "Privacidade",
              ].map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
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
    </>
  );
}
