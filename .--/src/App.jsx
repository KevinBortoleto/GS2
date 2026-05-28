import { useEffect, useRef, useState, useCallback } from "react";
import "./css/App.css";
import Footer from "./components/Footer";
import emailjs from "@emailjs/browser";

function LeafletMap() {
  const leafletRef = useRef(null);
  const circlesRef = useRef([]);
  const mapInitialized = useRef(false);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (mapInitialized.current) return;

    mapInitialized.current = true;

    const loadMap = async () => {
      if (!window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

        document.head.appendChild(link);

        await new Promise((resolve) => {
          const script = document.createElement("script");

          script.src =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

          script.onload = resolve;

          document.body.appendChild(script);
        });
      }

      const L = window.L;

      const container = L.DomUtil.get("leaflet-map");

      if (container?._leaflet_id) {
        container._leaflet_id = null;
      }

      const map = L.map("leaflet-map", {
        center: [-15, -51],
        zoom: 4,
        zoomControl: true,
        preferCanvas: true,
      });

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "&copy; Esri",
          maxZoom: 19,
        }
      ).addTo(map);

      leafletRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    };

    loadMap();

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    const map = leafletRef.current;

    if (!map) return;

    setStatus("Buscando...");

    try {
      const geoUrl =
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=pt`;

      const geoRes = await fetch(geoUrl);

      const geoData = await geoRes.json();

      if (!geoData.length) {
        setStatus("Local não encontrado.");
        return;
      }

      const result = geoData[0];

      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      const weatherUrl =
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=eed52582c8aa6b51900f5e9eee5da2c3&units=metric&lang=pt_br`;

      const weatherRes = await fetch(weatherUrl);

      const weatherData = await weatherRes.json();

      const temperatura = weatherData.main.temp;
      const umidade = weatherData.main.humidity;
      const vento = weatherData.wind.speed;
      const descricao = weatherData.weather[0].description;

      const L = window.L;

      map.flyTo([latitude, longitude], 12, {
        duration: 2,
      });

      setTimeout(async () => {
        circlesRef.current.forEach((circle) => {
          map.removeLayer(circle);
        });

        circlesRef.current = [];

        let cor = "#43d854";
        let mensagem = "🟢 Condições climáticas estáveis";
        let nivel = "NORMAL";

        if (temperatura >= 35) {
          cor = "#ff3b3b";
          mensagem = "🔥 Calor extremo detectado";
          nivel = "SEVERO";
        }

        else if (temperatura >= 30) {
          cor = "#ffd43b";
          mensagem = "⚠️ Temperatura elevada";
          nivel = "ATENÇÃO";
        }

        if (umidade <= 30) {
          cor = "#ff7b00";
          mensagem = "🌵 Baixa umidade do ar";
          nivel = "MODERADO";
        }

        if (vento >= 12) {
          cor = "#d946ef";
          mensagem = "💨 Ventania detectada";
          nivel = "MODERADO";
        }

        if (umidade >= 85 && vento >= 8) {
          cor = "#3ba4ff";
          mensagem = "🌧️ Risco de tempestade";
          nivel = "SEVERO";
        }

        const circle = L.circle(
          [latitude, longitude],
          {
            radius: 4000,
            color: cor,
            fillColor: cor,
            fillOpacity: 0.3,
            weight: 2,
          }
        ).addTo(map);

        circle.bindPopup(`
          <div style="
            font-family:DM Sans,sans-serif;
            color:#021b3a;
            line-height:1.6;
          ">
            <strong>${result.display_name}</strong><br/><br/>

            🚨 Status: ${nivel}<br/><br/>

            🌡️ Temperatura: ${temperatura.toFixed(1)}°C<br/>
            💧 Umidade: ${umidade}%<br/>
            🌬️ Vento: ${vento} m/s<br/>
            ☁️ Clima: ${descricao}

            <br/><br/>
             ${mensagem}
          </div>
        `);

        circlesRef.current.push(circle);

        // popup principal
        let mensagemPrincipal = "🟢 Região estável";

        if (temperatura >= 35 || umidade <= 30) {
          mensagemPrincipal =
            "🔥 Risco elevado de calor/incêndio";
        } else if (temperatura >= 30) {
          mensagemPrincipal =
            "⚠️ Região em observação climática";
        }

        if (umidade >= 80 && vento >= 15.5 && temperatura <= 0) {
          mensagemPrincipal =
            "❄️ Possível risco de nevasca";
        } else if (umidade >= 90 && vento >= 8 && temperatura <= 0) {
          mensagemPrincipal = "🌨️ Forte tempestade de neve (Vento moderado)";
        } else if (umidade >= 90 && vento >= 8 && temperatura > 0) {
          mensagemPrincipal = "⛈️ Possível risco de tempestada severa / enchente 🌊";
        } 

        L.popup()
          .setLatLng([latitude, longitude])
          .setContent(`
            <div style="
              font-family:'DM Sans',sans-serif;
              font-size:13px;
              color:#021b3a;
              max-width:220px;
              line-height:1.6;
            ">
              <strong>${result.display_name}</strong><br/><br/>

              🌡️ Temperatura: ${temperatura.toFixed(1)}°C<br/>
              💧 Umidade: ${umidade}%<br/>
              🌬️ Vento: ${vento} m/s<br/>
              ☁️ Clima: ${descricao}

              <br/><br/>
               ${mensagemPrincipal}
            </div>
          `)
          .openOn(map);

      }, 2100);

      setStatus("");

    } catch (err) {
      console.error(err);
      setStatus("Erro ao buscar.");
    }
  }, [query]);

  return (
    <div className="s3">
      <div className="s3-header">
        <div>
          <div className="s3-title">
            Explore o território
          </div>

          <div className="s3-sub">
            Navegue pelo mapa e encontre sua área de monitoramento
          </div>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 6
        }}>
          <div className="search-bar">
            <input
              placeholder="Cidade, estado..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSearch()
              }
            />

            <button onClick={handleSearch}>
              Buscar
            </button>
          </div>

          {status && (
            <span className="search-status">
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const sendEmail = async (e) => {
    e.preventDefault();

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&accept-language=pt`;

      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      let temperatura = "";
      let umidade = "";
      let descricao = "";
      let alerta = "🟢 Condições climáticas estáveis";
      let nivel = "NORMAL";

      if (geoData.length) {
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=eed52582c8aa6b51900f5e9eee5da2c3&units=metric&lang=pt_br`;

        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        if (weatherData.main.temp >= 35) {
          alerta = "🔥 Calor extremo detectado";
          nivel = "SEVERO";
        }

        else if (weatherData.main.temp >= 30) {
          alerta = "⚠️ Temperatura elevada";
          nivel = "ATENÇÃO";
        }

        if (weatherData.main.humidity <= 30) {
          alerta = "🌵 Baixa umidade do ar";
          nivel = "MODERADO";
        }

        if (weatherData.wind.speed >= 12) {
          alerta = "💨 Ventania detectada";
          nivel = "MODERADO";
        }

        if (
          weatherData.main.humidity >= 85 &&
          weatherData.wind.speed >= 8
        ) {
          alerta = "🌧️ Risco de tempestade";
          nivel = "SEVERO";
        }
      }

      await emailjs.send(
        "service_lwp56aq",
        "template_80c0j19",
        {
          name,
          email,
          city,
          temperatura,
          umidade,
          descricao,
          alerta,
          nivel,
        },
        "VcKOfB_mfRTJRnhs8"
      );

      setEmailStatus("Monitoramento ativado com sucesso!");

      setName("");
      setEmail("");
      setCity("");
    } catch (error) {
      setEmailStatus("Erro ao enviar monitoramento.");
      console.error(error);
    }
  };

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
  const zoomStart = 0.38;
  const zoomProg = Math.max(0, (scroll - zoomStart) / 0.58);
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
      <section className="s4">
        <div className="s4-inner">
          <h2>Receba alertas ambientais</h2>

          <form onSubmit={sendEmail} className="alert-form">
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Cidade monitorada"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <button type="submit">
              Ativar monitoramento
            </button>
          </form>

          {emailStatus && (
            <p style={{ marginTop: 12 }}>
              {emailStatus}
            </p>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
