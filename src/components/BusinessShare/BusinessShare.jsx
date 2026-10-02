import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { FiDownload, FiLink, FiCheck, FiExternalLink } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import Loader from "../loader/Loader";
import apiRequest from "../../lib/apiRequest";
import { bizTheme } from "../../lib/bizTheme";
import { formatPhone } from "../../lib/formatPhone";
import "./businessShare.scss";

const W = 1080;
const H = 1350;
const FONT = "'Inter', 'Segoe UI', Arial, sans-serif";

const loadImage = (src, cors = false) =>
  new Promise((resolve) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Metni verilen genişliğe göre satırlara böler (en fazla maxLines satır)
const wrapLines = (ctx, text, maxWidth, maxLines) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return lines;
};

async function drawPoster(canvas, business, url) {
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;
  const theme = bizTheme(business.name);

  // Arka plan
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, theme.from);
  bg.addColorStop(1, theme.to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Dekoratif daireler
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.arc(W - 120, 140, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.beginPath();
  ctx.arc(60, H - 260, 340, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Logo / baş harfler
  const logoSize = 150;
  const logoX = W / 2 - logoSize / 2;
  const logoY = 70;
  ctx.save();
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 44);
  ctx.clip();
  const logoImg = business.logo ? await loadImage(business.logo, true) : null;
  if (logoImg) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(logoX, logoY, logoSize, logoSize);
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(logoX, logoY, logoSize, logoSize);
    ctx.fillStyle = "#fff";
    ctx.font = `800 78px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText(theme.initials, W / 2, logoY + logoSize / 2 + 4);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // İşletme adı
  ctx.fillStyle = "#fff";
  ctx.font = `800 66px ${FONT}`;
  const nameLines = wrapLines(ctx, business.name, W - 160, 2);
  let y = 300;
  nameLines.forEach((l) => {
    ctx.fillText(l, W / 2, y);
    y += 76;
  });

  // Kategori + konum
  ctx.font = `600 34px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const sub = [business.category?.name, `${business.district}, ${business.city}`]
    .filter(Boolean)
    .join("  •  ");
  ctx.fillText(sub, W / 2, y - 2);

  // QR kartı
  const cardSize = 480;
  const cardX = W / 2 - cardSize / 2;
  const cardY = y + 40;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = "#fff";
  roundRect(ctx, cardX, cardY, cardSize, cardSize, 44);
  ctx.fill();
  ctx.restore();

  const qrData = await QRCode.toDataURL(url, {
    width: 800,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1c1f2e", light: "#ffffff" },
  });
  const qrImg = await loadImage(qrData);
  if (qrImg) ctx.drawImage(qrImg, cardX + 30, cardY + 30, cardSize - 60, cardSize - 60);

  // Çağrı metni
  const textY = cardY + cardSize + 84;
  ctx.fillStyle = "#fff";
  ctx.font = `800 52px ${FONT}`;
  ctx.fillText("Bizi BedavadanBul'da bulun", W / 2, textY);
  ctx.font = `500 33px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("QR kodu okutun: soru sorun, yorum yapın,", W / 2, textY + 54);
  ctx.fillText("kampanyalarımızı görün.", W / 2, textY + 96);

  // Telefon
  if (business.phone) {
    ctx.font = `700 38px ${FONT}`;
    ctx.fillStyle = "#fff";
    ctx.fillText(formatPhone(business.phone), W / 2, textY + 160);
  }

  // Alt bant
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(0, H - 86, W, 86);
  ctx.fillStyle = "#fff";
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText(url.replace(/^https?:\/\//, ""), W / 2, H - 32);
}

const slug = (s) =>
  String(s)
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9çğıöşü]+/g, "-")
    .replace(/^-+|-+$/g, "") || "isletme";

function BusinessShare() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest
      .get("/businesses/me")
      .then((res) => !cancelled && setBusiness(res.data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const url = business ? `${window.location.origin}/isletme/${business.id}` : "";

  useEffect(() => {
    if (!business || !canvasRef.current) return;
    drawPoster(canvasRef.current, business, url).catch(() => {});
  }, [business, url]);

  const download = useCallback(
    (blobPromise, filename) => {
      setBusy(true);
      blobPromise()
        .then((blob) => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        })
        .finally(() => setBusy(false));
    },
    [],
  );

  const downloadPoster = () =>
    download(
      () => new Promise((resolve) => canvasRef.current.toBlob(resolve, "image/png")),
      `${slug(business.name)}-afis.png`,
    );

  const downloadQr = () =>
    download(async () => {
      const data = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#1c1f2e", light: "#ffffff" },
      });
      return (await fetch(data)).blob();
    }, `${slug(business.name)}-qr.png`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* pano erişimi yoksa sessizce geç */
    }
  };

  if (loading) return <Loader />;

  if (!business) {
    return (
      <div className="shareEmpty">
        <h3>Önce işletme profilinizi oluşturun</h3>
        <p>QR kod ve paylaşım afişi, profiliniz yayına girdikten sonra hazırlanır.</p>
      </div>
    );
  }

  const waText = encodeURIComponent(`${business.name} artık BedavadanBul'da! Profilimize göz atın: ${url}`);

  return (
    <div className="bizShare">
      <div className="shareHead">
        <h2>QR & Paylaşım</h2>
        <p>
          Afişi vitrininize asın, kartvizitinize ya da sosyal medyaya ekleyin. Müşteriler QR kodu
          okutarak doğrudan profilinize gelir.
        </p>
      </div>

      <div className="shareGrid">
        <div className="posterBox">
          <canvas ref={canvasRef} aria-label="Paylaşım afişi önizlemesi" />
        </div>

        <div className="shareActions">
          <button type="button" className="shareBtn primary" onClick={downloadPoster} disabled={busy}>
            <FiDownload /> Afişi indir (PNG)
          </button>
          <button type="button" className="shareBtn" onClick={downloadQr} disabled={busy}>
            <FiDownload /> Sadece QR kodu indir
          </button>
          <button type="button" className="shareBtn" onClick={copy}>
            {copied ? <FiCheck /> : <FiLink />} {copied ? "Bağlantı kopyalandı" : "Profil bağlantısını kopyala"}
          </button>
          <a
            className="shareBtn wa"
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp /> WhatsApp'ta paylaş
          </a>
          <Link className="shareBtn" to={`/isletme/${business.id}`} target="_blank">
            <FiExternalLink /> Profilimi görüntüle
          </Link>
          <p className="shareUrl">{url}</p>
          <p className="shareTip">
            İpucu: Afişi A4 çıktı alıp kasanın yanına koymak, müşterilerinizi yorum yapmaya
            yönlendirmenin en kolay yoludur.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BusinessShare;
