import { useEffect, useRef, useState, useCallback } from "react";
import "./css/App.css";
import Footer from "./components/Footer";

function LeafletMap() {
  const leafletRef = useRef(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (leafletRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      const L = window.L;
      const map = L.map("leaflet-map", {
        center: [-15.0, -51.0],
        zoom: 4,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      leafletRef.current = map;
    };
    document.head.appendChild(script);

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !leafletRef.current) return;
    setStatus("Buscando…");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=pt`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.length) {
        setStatus("Local não encontrado.");
        return;
      }
      const { lat, lon, display_name } = data[0];
      const L = window.L;
      const map = leafletRef.current;
      map.flyTo([parseFloat(lat), parseFloat(lon)], 13, { duration: 1.8 });
      L.popup()
        .setLatLng([parseFloat(lat), parseFloat(lon)])
        .setContent(
          `<div style="font-family:'DM Sans',sans-serif;font-size:13px;color:#021b3a;max-width:220px;">${display_name}</div>`,
        )
        .openOn(map);
      setStatus("");
    } catch {
      setStatus("Erro ao buscar. Tente novamente.");
    }
  }, [query]);

  return (
    <div className="s3">
      <div className="s3-header">
        <div>
          <div className="s3-title">Explore o território</div>
          <div className="s3-sub">
            Navegue pelo mapa e encontre sua área de monitoramento
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="search-bar">
            <input
              placeholder="Cidade, estado, endereço…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Buscar</button>
          </div>
          {status && (
            <span
              style={{
                fontSize: 12,
                color: "rgba(180,210,185,.55)",
                paddingLeft: 2,
              }}
            >
              {status}
            </span>
          )}
        </div>
      </div>
      <div className="map-container">
        <div id="leaflet-map" />
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function AgroView() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const s1 = document.querySelector(".s1");
      if (!s1) return;
      const prog = Math.max(
        0,
        Math.min(1, window.scrollY / (s1.offsetHeight - window.innerHeight)),
      );
      setScroll(prog);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const minSize = Math.min(vw, vh) * 0.4;
  const maxSize = Math.sqrt(vw * vw + vh * vh) * 1.5;
  const zoomStart = 0.45;
  const zoomProg = Math.max(0, (scroll - zoomStart) / (1 - zoomStart));
  const earthSize = minSize + (maxSize - minSize) * Math.pow(zoomProg, 2);

  const br = Math.max(0, 50 - zoomProg * 60);

  const oceanPct = Math.max(0, (zoomProg - 0.55) / 0.45) * 100;

  const textOp = Math.max(0, 1 - scroll * 4);
  const cueOp = Math.max(0, 1 - scroll * 8);
  const starsOp = Math.max(0, 1 - scroll * 2);

  return (
    <>
      <section className="s1">
        <div className="s1-sticky">
          <div
            className="stars-bg"
            style={{ opacity: starsOp }}
            aria-hidden="true"
          />

          <div className="hero-copy" style={{ opacity: textOp }}>
            <div className="hero-logo">AgroView</div>
            <div className="hero-tagline">
              Monitoramento por satélite · Inteligência territorial
            </div>
          </div>

          <div
            className="earth-wrap"
            style={{
              width: earthSize,
              height: earthSize,
              borderRadius: `${br}%`,
            }}
          >
            <img
              src="/terra.jpg"
              alt="Terra"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
              }}
            />
          </div>

          <div
            className="ocean-fill"
            style={{ clipPath: `circle(${oceanPct.toFixed(1)}% at 50% 50%)` }}
          />

          {/* scroll cue */}
          <div className="scroll-cue" style={{ opacity: cueOp }}>
            <span>Role para explorar</span>
            <div className="scroll-cue-arrow" />
          </div>
        </div>
      </section>

      <section className="s2">
        <div className="s2-bg-grid" />
        <div className="s2-blob" />
        <div className="s2-inner">
          <div>
            <div className="s2-kicker">Sobre o projeto</div>
            <h2 className="s2-title">
              Conheça a <em>amplitude</em> do seu território
            </h2>
            <p className="s2-body">
              AgroView combina imagens de satélite em tempo real com análise
              inteligente para que produtores rurais visualizem, monitorem e
              planejem suas áreas com precisão. Do plantio à colheita, cada
              hectare em suas mãos.
            </p>
            <button className="s2-cta" href="null">
              Começar agora →
            </button>

            <div className="stats-strip">
              {[
                ["98%", "Cobertura", "do território BR"],
                ["1m²", "Resolução", "espacial"],
                ["24/7", "Alertas", "enviadas ao seu email"],
              ].map(([n, l, s]) => (
                <div className="stat" key={l}>
                  <div className="stat-n">{n}</div>
                  <div className="stat-l">{l}</div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(150,190,160,.3)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {s}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="features">
            {[
              {
                icon: "🛰️",
                t: "Imagens de satélite",
                d: "Acesse imagens atualizadas do seu território, identificando áreas de plantio, pastagem e corpos d'água com detalhes precisos.",
              },
              {
                icon: "📡",
                t: "Monitoramento em tempo real",
                d: "Receba alertas instantâneos sobre variações climáticas, pragas ou invasões nas suas áreas monitoradas.",
              },
              {
                icon: "📊",
                t: "Planejamento inteligente",
                d: "Relatórios históricos e projeções baseadas em dados reais para embasar decisões de plantio e investimento.",
              },
            ].map((f) => (
              <div className="feat-card" key={f.t}>
                <div className="feat-icon">{f.icon}</div>
                <div>
                  <div className="feat-title">{f.t}</div>
                  <div className="feat-desc">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <LeafletMap />
      <Footer />
    </>
  );
}
