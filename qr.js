// ============================================================
// PiHub RW — QR Code Module (Génération + Scanner + Offline)
// Compatible tous modules: transport, livraison, market...
// ============================================================

const PiQR = {

  // ── Bibliothèques externes ────────────────────────────────
  QR_LIB: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
  JSQR_LIB: "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js",

  // ── Charger un script dynamiquement ──────────────────────
  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(); return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  },

  // ════════════════════════════════════════════════════════
  // GÉNÉRATION QR CODE (côté conducteur/vendeur)
  // ════════════════════════════════════════════════════════
  async generateQR({ tripId, amount, driverWallet, module = "transport", type = "departure" }) {
    try {
      await this.loadScript(this.QR_LIB);
    } catch {
      console.warn("[PiQR] Offline — QR généré en mode dégradé");
    }

    // Données encodées dans le QR
    const payload = JSON.stringify({
      app: "PiHub RW",
      module,
      type,       // "departure" ou "arrival"
      tripId,
      amount,
      driverWallet,
      timestamp: Date.now()
    });

    // Sauvegarder en localStorage (mode offline)
    localStorage.setItem(`qr_${tripId}_${type}`, payload);

    // Créer la fenêtre modale QR
    this.showQRModal({ payload, tripId, type, amount });
  },

  showQRModal({ payload, tripId, type, amount }) {
    // Supprimer ancienne modale si existante
    document.getElementById("piQRModal")?.remove();

    const label = type === "departure" ? "🚦 DÉPART — Escrow" : "🏁 ARRIVÉE — Confirmation";
    const labelRW = type === "departure" ? "Gutangira Urugendo" : "Imperuka y'Urugendo";

    const modal = document.createElement("div");
    modal.id = "piQRModal";
    modal.style.cssText = `
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.85); z-index:9999;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      font-family:'Plus Jakarta Sans', sans-serif;
    `;

    modal.innerHTML = `
      <div style="background:#1a1a2e; border-radius:16px; padding:24px;
                  max-width:320px; width:90%; text-align:center;
                  border:1px solid #4a90d9;">
        <h2 style="color:#f0c040; margin:0 0 4px">${label}</h2>
        <p style="color:#aaa; font-size:12px; margin:0 0 16px">${labelRW}</p>
        <div id="qrCanvas" style="background:white; padding:12px;
             border-radius:8px; display:inline-block; margin-bottom:16px"></div>
        <p style="color:#fff; font-size:13px; margin:0 0 4px">
          Trip: <b style="color:#4a90d9">${tripId}</b>
        </p>
        <p style="color:#f0c040; font-size:16px; font-weight:bold; margin:0 0 20px">
          ${amount}π
        </p>
        <button onclick="document.getElementById('piQRModal').remove()"
          style="background:#4a90d9; color:white; border:none;
                 padding:12px 32px; border-radius:8px; font-size:14px;
                 cursor:pointer; width:100%">
          ✕ Fermer / Funga
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Générer le QR si bibliothèque disponible
    setTimeout(() => {
      const canvas = document.getElementById("qrCanvas");
      if (canvas && window.QRCode) {
        new QRCode(canvas, {
          text: payload,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff"
        });
      } else {
        // Mode dégradé offline — afficher le tripId lisible
        canvas.innerHTML = `
          <div style="width:200px; height:200px; background:#f0f0f0;
               display:flex; flex-direction:column; align-items:center;
               justify-content:center; border-radius:8px; padding:12px">
            <p style="font-size:11px; color:#333; word-break:break-all;
               text-align:center; margin:0">
              📵 Mode hors ligne<br><br>
              <b>${tripId}</b><br><br>
              Montrez ce code au passager
            </p>
          </div>`;
      }
    }, 100);
  },

  // ════════════════════════════════════════════════════════
  // SCANNER QR CODE (côté passager/client)
  // ════════════════════════════════════════════════════════
  async openScanner(onScanSuccess) {
    try {
      await this.loadScript(this.JSQR_LIB);
    } catch {
      console.warn("[PiQR] jsQR non disponible — mode offline");
    }

    // Créer la fenêtre scanner
    document.getElementById("piScannerModal")?.remove();

    const modal = document.createElement("div");
    modal.id = "piScannerModal";
    modal.style.cssText = `
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.95); z-index:9999;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      font-family:'Plus Jakarta Sans', sans-serif;
    `;

    modal.innerHTML = `
      <div style="width:90%; max-width:340px; text-align:center">
        <h2 style="color:#f0c040; margin:0 0 8px">📷 Scanner QR</h2>
        <p style="color:#aaa; font-size:12px; margin:0 0 16px">
          Pointez la caméra vers le QR du conducteur
        </p>
        <div style="position:relative; border-radius:12px; overflow:hidden;
                    border:2px solid #4a90d9">
          <video id="piQRVideo" style="width:100%; display:block"
                 autoplay playsinline></video>
          <canvas id="piQRCanvas" style="display:none"></canvas>
          <!-- Viseur -->
          <div style="position:absolute; top:50%; left:50%;
               transform:translate(-50%,-50%);
               width:180px; height:180px;
               border:3px solid #f0c040; border-radius:8px;
               box-shadow:0 0 0 999px rgba(0,0,0,0.4)"></div>
        </div>
        <p id="piScanStatus" style="color:#4a90d9; margin:12px 0; font-size:13px">
          ⏳ Initialisation caméra...
        </p>
        <button onclick="PiQR.closeScanner()"
          style="background:#e74c3c; color:white; border:none;
                 padding:12px 32px; border-radius:8px; font-size:14px;
                 cursor:pointer; width:100%">
          ✕ Annuler / Reka
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    await this.startCamera(onScanSuccess);
  },

  async startCamera(onScanSuccess) {
    const status = document.getElementById("piScanStatus");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      const video = document.getElementById("piQRVideo");
      video.srcObject = stream;
      this._stream = stream;

      if (status) status.textContent = "✅ Caméra active — Pointez le QR";

      video.addEventListener("play", () => {
        this.scanLoop(onScanSuccess);
      });

    } catch (err) {
      console.error("[PiQR] Caméra inaccessible:", err);
      if (status) status.innerHTML = `
        ❌ Caméra inaccessible<br>
        <span style="font-size:11px; color:#aaa">
          Vérifiez les permissions ou entrez le code manuellement
        </span>`;
      this.showManualEntry(onScanSuccess);
    }
  },

  scanLoop(onScanSuccess) {
    const video = document.getElementById("piQRVideo");
    const canvas = document.getElementById("piQRCanvas");
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const loop = () => {
      if (!document.getElementById("piScannerModal")) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (window.jsQR) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            this.onQRDetected(code.data, onScanSuccess);
            return;
          }
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  },

  onQRDetected(rawData, onScanSuccess) {
    try {
      const data = JSON.parse(rawData);
      if (data.app !== "PiHub RW") throw new Error("QR invalide");

      // Sauvegarder en localStorage
      localStorage.setItem(`scan_${data.tripId}_${data.type}`, rawData);

      this.closeScanner();

      // Feedback visuel
      const toast = document.createElement("div");
      toast.style.cssText = `
        position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
        background:#27ae60; color:white; padding:12px 24px;
        border-radius:8px; font-size:14px; z-index:9999;
        font-family:'Plus Jakarta Sans', sans-serif;
      `;
      toast.textContent = data.type === "departure"
        ? "✅ Départ confirmé — Escrow activé"
        : "✅ Arrivée confirmée — Paiement libéré";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Callback
      if (typeof onScanSuccess === "function") onScanSuccess(data);

    } catch {
      const status = document.getElementById("piScanStatus");
      if (status) status.textContent = "❌ QR invalide — Réessayez";
    }
  },

  // Entrée manuelle si caméra indisponible (offline)
  showManualEntry(onScanSuccess) {
    const modal = document.getElementById("piScannerModal");
    if (!modal) return;
    modal.querySelector("div").innerHTML += `
      <div style="margin-top:16px; text-align:left">
        <p style="color:#aaa; font-size:12px; margin:0 0 8px">
          📵 Mode hors ligne — Entrez le code manuellement :
        </p>
        <input id="manualTripId" type="text"
          placeholder="Code du trajet (ex: TRP-001)"
          style="width:100%; padding:10px; border-radius:8px; border:1px solid #4a90d9;
                 background:#0d1117; color:white; font-size:14px; box-sizing:border-box">
        <button onclick="PiQR.validateManual(window._scanCallback)"
          style="margin-top:8px; background:#4a90d9; color:white; border:none;
                 padding:12px; border-radius:8px; width:100%; cursor:pointer">
          ✅ Valider
        </button>
      </div>`;
    window._scanCallback = onScanSuccess;
  },

  validateManual(onScanSuccess) {
    const tripId = document.getElementById("manualTripId")?.value?.trim();
    if (!tripId) return;
    const cached = localStorage.getItem(`qr_${tripId}_departure`)
                || localStorage.getItem(`qr_${tripId}_arrival`);
    if (cached) {
      this.onQRDetected(cached, onScanSuccess);
    } else {
      alert("Code introuvable — vérifiez et réessayez");
    }
  },

  closeScanner() {
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
    document.getElementById("piScannerModal")?.remove();
  }
};

// ── Exposer globalement ───────────────────────────────────
window.PiQR = PiQR;
console.log("[PiQR] ✅ Module QR chargé — PiHub RW");
