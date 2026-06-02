// ================================================================
// PiHub RW — QR Flow Module v1.1 (Multilingual)
// Passenger scanner + Driver dashboard + Web3 ready
// ================================================================
'use strict';

// ── Translations ─────────────────────────────────────────────
const T2 = {
  en: {
    bus_qr:'Bus QR Code', paid_passengers:'Paid Passengers',
    valid_today:'⏱️ Valid today · Auto-renewal tomorrow',
    scanner_title:'📷 Scan Bus QR',
    scanner_desc:'Point camera at the QR displayed in the bus',
    camera_active:'✅ Camera active — Point at QR',
    escrow_locked:'🔒 Escrow Activated!',
    arrival_confirmed:'✅ Arrival Confirmed!',
    escrow_blocked:'🔒 Escrow locked',
    final_amount:'💰 Final amount',
    passenger_no:'🎟️ Passenger No.',
    scan_again:'ℹ️ Scan bus QR again on arrival to release payment',
    payment_released:'🎉 Payment released · Excess refunded automatically',
    driver_dashboard:'🚌 Driver Dashboard',
    passengers_paid:'Passengers who paid',
    total_collected:'Total collected',
    passenger_list:'Passenger list',
    no_passengers:'No passengers yet',
    close:'✕ Close', cancel:'✕ Cancel', ok:'✅ OK',
    invalid_qr:'❌ Invalid QR — Try again',
    session_not_found:'Session not found — check the code',
    initializing:'⏳ Initializing camera...',
    camera_error:'❌ Camera unavailable · Check permissions'
  },
  fr: {
    bus_qr:'QR Code Bus', paid_passengers:'Passagers payés',
    valid_today:'⏱️ Valide aujourd\'hui · Renouvellement auto demain',
    scanner_title:'📷 Scanner QR du Bus',
    scanner_desc:'Pointez la caméra vers le QR affiché dans le bus',
    camera_active:'✅ Caméra active — Pointez le QR',
    escrow_locked:'🔒 Escrow Activé !',
    arrival_confirmed:'✅ Arrivée Confirmée !',
    escrow_blocked:'🔒 Escrow bloqué',
    final_amount:'💰 Montant final',
    passenger_no:'🎟️ N° Passager',
    scan_again:'ℹ️ Scannez à nouveau le QR du bus à l\'arrivée pour libérer le paiement',
    payment_released:'🎉 Paiement libéré · Excédent remboursé automatiquement',
    driver_dashboard:'🚌 Dashboard Chauffeur',
    passengers_paid:'Passagers ayant payé',
    total_collected:'Total encaissé',
    passenger_list:'Liste des passagers',
    no_passengers:'Aucun passager pour l\'instant',
    close:'✕ Fermer', cancel:'✕ Annuler', ok:'✅ OK',
    invalid_qr:'❌ QR invalide — Réessayez',
    session_not_found:'Session introuvable — vérifiez le code',
    initializing:'⏳ Initialisation caméra...',
    camera_error:'❌ Caméra inaccessible · Vérifiez les permissions'
  },
  kin: {
    bus_qr:'QR y\'Bisi', paid_passengers:'Abagenzi batanze',
    valid_today:'⏱️ Ukora uyu munsi · Kongerwa buri munsi',
    scanner_title:'📷 Skani QR y\'Bisi',
    scanner_desc:'Erekana kamera ku QR igaragara mu bisi',
    camera_active:'✅ Kamera ikora — Erekana QR',
    escrow_locked:'🔒 Escrow Yafunzwe !',
    arrival_confirmed:'✅ Kugera Kwemejwe !',
    escrow_blocked:'🔒 Escrow yabitswe',
    final_amount:'💰 Umubare nyawo',
    passenger_no:'🎟️ N° Umugenzi',
    scan_again:'ℹ️ Skani QR y\'bisi ukingera kugira ngo amafaranga arekurwe',
    payment_released:'🎉 Amafaranga yarekuwe · Umusigati wasubizwe',
    driver_dashboard:'🚌 Dashboard y\'Umushoferi',
    passengers_paid:'Abagenzi batanze',
    total_collected:'Byose byakiriwe',
    passenger_list:'Urutonde rw\'abagenzi',
    no_passengers:'Nta bagenzi ubu',
    close:'✕ Funga', cancel:'✕ Reka', ok:'✅ Sawa',
    invalid_qr:'❌ QR ntabwo ari yo — Gerageza',
    session_not_found:'Isession ntabwo ibonetse',
    initializing:'⏳ Gutangira kamera...',
    camera_error:'❌ Kamera ntiboneka · Reba uburenganzira'
  },
  sw: {
    bus_qr:'QR ya Basi', paid_passengers:'Abiria walioplipa',
    valid_today:'⏱️ Halali leo · Upya otomatiki kesho',
    scanner_title:'📷 Skani QR ya Basi',
    scanner_desc:'Elekeza kamera kwenye QR iliyoonyeshwa kwenye basi',
    camera_active:'✅ Kamera inafanya kazi — Elekeza QR',
    escrow_locked:'🔒 Escrow Imewashwa !',
    arrival_confirmed:'✅ Kuwasili Kumethibitishwa !',
    escrow_blocked:'🔒 Escrow imeshikiliwa',
    final_amount:'💰 Kiasi cha mwisho',
    passenger_no:'🎟️ Na. Abiria',
    scan_again:'ℹ️ Skani tena QR ya basi ukifika ili fedha ziachiwe',
    payment_released:'🎉 Fedha zimeachiliwa · Ziada imerudishwa',
    driver_dashboard:'🚌 Dashibodi ya Dereva',
    passengers_paid:'Abiria walioplipa',
    total_collected:'Jumla iliyokusanywa',
    passenger_list:'Orodha ya abiria',
    no_passengers:'Hakuna abiria bado',
    close:'✕ Funga', cancel:'✕ Ghairi', ok:'✅ Sawa',
    invalid_qr:'❌ QR si sahihi — Jaribu tena',
    session_not_found:'Kipindi hakipatikani — angalia msimbo',
    initializing:'⏳ Kuanzisha kamera...',
    camera_error:'❌ Kamera haipatikani · Angalia ruhusa'
  }
};

function getLang() { return window.S?.lang || 'en'; }
function t2(key) {
  const lang = getLang();
  return T2[lang]?.[key] || T2.en[key] || key;
}

// ================================================================
const PiQRFlow = {

  QR_LIB: 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  JSQR_LIB: 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js',
  _stream: null,
  _passengerCount: 0,
  _busSession: null,

  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  },

  // ════════════════════════════════════════════════════════
  // 1. GENERATE BUS QR (Driver side)
  // ════════════════════════════════════════════════════════
  async generateBusQR({ busId, route, maxAmountRwf, driverId }) {
    try { await this.loadScript(this.QR_LIB); } catch(e) {}

    const session = {
      busId, route, maxAmountRwf, driverId,
      date: new Date().toISOString().split('T')[0],
      sessionId: 'SES-' + Math.random().toString(36).slice(2,10).toUpperCase()
    };

    this._busSession = session;
    this._passengerCount = 0;
    localStorage.setItem('bus_session_' + busId, JSON.stringify(session));
    this._showBusQRModal(session);
  },

  _showBusQRModal(session) {
    document.getElementById('piQRFlowModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'piQRFlowModal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;padding:16px`;

    modal.innerHTML = `
      <div style="background:#0D1F18;border:1px solid rgba(22,201,121,.3);
                  border-radius:16px;padding:20px;max-width:320px;width:100%;text-align:center">
        <div style="color:#F5A623;font-size:.7rem;font-weight:700;
                    text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">
          ${t2('bus_qr')}
        </div>
        <div style="color:#E8F8F0;font-size:.85rem;font-weight:700;margin-bottom:4px">
          ${session.route}
        </div>
        <div style="color:#6B9E84;font-size:.65rem;margin-bottom:12px">
          Max: ${session.maxAmountRwf?.toLocaleString()} FRw · ${session.date}
        </div>
        <div id="busQRCanvas" style="background:#fff;padding:10px;
             border-radius:8px;display:inline-block;margin-bottom:12px"></div>
        <div style="color:#16C979;font-family:monospace;font-size:.62rem;
                    margin-bottom:4px">${session.sessionId}</div>
        <div style="color:#6B9E84;font-size:.6rem;margin-bottom:16px">
          ${t2('valid_today')}
        </div>
        <div id="passengerCount" style="background:rgba(22,201,121,.08);
             border:1px solid rgba(22,201,121,.2);border-radius:10px;
             padding:10px;margin-bottom:12px">
          <div style="color:#6B9E84;font-size:.6rem;margin-bottom:2px">
            ${t2('paid_passengers')}
          </div>
          <div style="color:#16C979;font-size:1.4rem;font-weight:800" id="paxCount">0</div>
        </div>
        <div id="passengerList" style="max-height:150px;overflow-y:auto;
             margin-bottom:12px;text-align:left"></div>
        <button onclick="document.getElementById('piQRFlowModal').remove()"
          style="background:rgba(255,255,255,.06);color:#E8F8F0;
                 border:1px solid rgba(255,255,255,.1);padding:10px 24px;
                 border-radius:8px;font-size:.8rem;cursor:pointer;width:100%">
          ${t2('close')}
        </button>
      </div>`;

    document.body.appendChild(modal);
    setTimeout(() => {
      const canvas = document.getElementById('busQRCanvas');
      if (canvas && window.QRCode) {
        new QRCode(canvas, {
          text: JSON.stringify(session),
          width: 180, height: 180,
          colorDark: '#0A7C4E', colorLight: '#ffffff'
        });
      }
    }, 100);
  },

  // ════════════════════════════════════════════════════════
  // 2. PASSENGER SCANNER
  // ════════════════════════════════════════════════════════
  async openPassengerScanner() {
    try { await this.loadScript(this.JSQR_LIB); } catch(e) {}
    document.getElementById('piScannerModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'piScannerModal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.95);
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;padding:16px`;

    modal.innerHTML = `
      <div style="width:100%;max-width:340px;text-align:center">
        <div style="color:#F5A623;font-size:.7rem;font-weight:700;
                    text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">
          ${t2('scanner_title')}
        </div>
        <p style="color:#6B9E84;font-size:.72rem;margin:0 0 12px">
          ${t2('scanner_desc')}
        </p>
        <div style="position:relative;border-radius:12px;overflow:hidden;
                    border:2px solid rgba(22,201,121,.4)">
          <video id="piFlowVideo" style="width:100%;display:block"
                 autoplay playsinline muted></video>
          <canvas id="piFlowCanvas" style="display:none"></canvas>
          <div style="position:absolute;top:50%;left:50%;
               transform:translate(-50%,-50%);width:180px;height:180px;
               border:3px solid #F5A623;border-radius:8px;
               box-shadow:0 0 0 999px rgba(0,0,0,.45)"></div>
        </div>
        <p id="flowScanStatus" style="color:#16C979;margin:10px 0;font-size:.72rem">
          ${t2('initializing')}
        </p>
        <button onclick="PiQRFlow.closeScanner()"
          style="background:rgba(255,82,82,.15);color:#FF5252;
                 border:1px solid rgba(255,82,82,.3);padding:11px;
                 border-radius:8px;font-size:.8rem;cursor:pointer;width:100%">
          ${t2('cancel')}
        </button>
      </div>`;

    document.body.appendChild(modal);
    await this._startCamera();
  },

  async _startCamera() {
    const status = document.getElementById('flowScanStatus');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      const video = document.getElementById('piFlowVideo');
      video.srcObject = stream;
      this._stream = stream;
      if (status) status.textContent = t2('camera_active');
      video.addEventListener('play', () => this._scanLoop());
    } catch(err) {
      if (status) status.innerHTML =
        t2('camera_error') + '<br>' +
        `<span style="font-size:.6rem;color:#6B9E84">${err.message}</span>`;
      this._showManualEntry();
    }
  },

  _scanLoop() {
    const video = document.getElementById('piFlowVideo');
    const canvas = document.getElementById('piFlowCanvas');
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const loop = () => {
      if (!document.getElementById('piScannerModal')) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (window.jsQR) {
          const code = jsQR(img.data, img.width, img.height);
          if (code) { this._onQRScanned(code.data); return; }
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  },

  async _onQRScanned(rawData) {
    try {
      const session = JSON.parse(rawData);
      if (!session.sessionId || !session.route) throw new Error('invalid');
      this.closeScanner();
      this._passengerCount++;
      const passengerNo = this._passengerCount;
      const key = `trip_${session.sessionId}`;
      const existing = localStorage.getItem(key);
      if (!existing) {
        const tripData = {
          sessionId: session.sessionId,
          busId: session.busId,
          route: session.route,
          maxAmountRwf: session.maxAmountRwf,
          passengerNo,
          departureTime: Date.now(),
          departureGPS: await this._getGPS()
        };
        localStorage.setItem(key, JSON.stringify(tripData));
        this._showConfirmation('departure', tripData, session);
        this._updateDriverDashboard(passengerNo, session);
      } else {
        const tripData = JSON.parse(existing);
        tripData.arrivalTime = Date.now();
        tripData.arrivalGPS = await this._getGPS();
        localStorage.setItem(key, JSON.stringify(tripData));
        this._showConfirmation('arrival', tripData, session);
        localStorage.removeItem(key);
      }
    } catch(e) {
      const status = document.getElementById('flowScanStatus');
      if (status) status.textContent = t2('invalid_qr');
    }
  },

  // ════════════════════════════════════════════════════════
  // 3. VISUAL CONFIRMATION
  // ════════════════════════════════════════════════════════
  _showConfirmation(type, tripData, session) {
    document.getElementById('piConfirmModal')?.remove();
    const isDep = type === 'departure';
    const amountRwf = session.maxAmountRwf || 500;
    const gcv = window.CFG?.gcv || 314159;
    const frwPerUsd = window.CFG?.frwPerUsd || 1490;
    const amountPi = (amountRwf / (gcv * frwPerUsd)).toFixed(8);

    // Web3-ready metadata
    const metadata = {
      app: 'pihub_rw', version: '1.0.0',
      module: 'transport',
      type: isDep ? 'escrow_deposit' : 'escrow_release',
      contractReady: true,
      escrowType: 'transport',
      releaseCondition: 'qr_scan_arrival',
      sessionId: tripData.sessionId,
      busId: tripData.busId,
      route: tripData.route,
      passengerNo: tripData.passengerNo
    };
    console.log('[PiQRFlow] Web3 metadata:', JSON.stringify(metadata));

    const modal = document.createElement('div');
    modal.id = 'piConfirmModal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:${isDep ? 'rgba(10,124,78,.97)' : 'rgba(0,200,150,.97)'};
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;padding:20px`;

    modal.innerHTML = `
      <div style="text-align:center;max-width:300px">
        <div style="font-size:3rem;margin-bottom:8px">${isDep ? '🔒' : '✅'}</div>
        <div style="color:#fff;font-size:1.3rem;font-weight:800;margin-bottom:4px">
          ${isDep ? t2('escrow_locked') : t2('arrival_confirmed')}
        </div>
        <div style="color:rgba(255,255,255,.8);font-size:.75rem;margin-bottom:16px">
          ${tripData.route}
        </div>
        <div style="background:rgba(0,0,0,.2);border-radius:12px;padding:14px;
                    margin-bottom:16px;text-align:left">
          <div style="display:flex;justify-content:space-between;
                      padding:5px 0;border-bottom:1px solid rgba(255,255,255,.1)">
            <span style="color:rgba(255,255,255,.7);font-size:.68rem">
              ${isDep ? t2('escrow_blocked') : t2('final_amount')}
            </span>
            <span style="color:#fff;font-family:monospace;font-size:.68rem;font-weight:700">
              ${amountRwf.toLocaleString()} FRw
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;
                      padding:5px 0;border-bottom:1px solid rgba(255,255,255,.1)">
            <span style="color:rgba(255,255,255,.7);font-size:.68rem">π Pi</span>
            <span style="color:#F5A623;font-family:monospace;font-size:.68rem;font-weight:700">
              ${amountPi} π
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:5px 0">
            <span style="color:rgba(255,255,255,.7);font-size:.68rem">
              ${t2('passenger_no')}
            </span>
            <span style="color:#fff;font-family:monospace;font-size:.8rem;font-weight:800">
              #${tripData.passengerNo}
            </span>
          </div>
        </div>
        <div style="background:rgba(0,0,0,.15);border-radius:8px;padding:10px;
                    margin-bottom:16px;font-size:.65rem;color:rgba(255,255,255,.8)">
          ${isDep ? t2('scan_again') : t2('payment_released')}
        </div>
        <button onclick="document.getElementById('piConfirmModal').remove()"
          style="background:rgba(255,255,255,.2);color:#fff;border:none;
                 padding:13px;border-radius:10px;font-size:.85rem;font-weight:700;
                 cursor:pointer;width:100%">
          ${t2('ok')}
        </button>
      </div>`;

    document.body.appendChild(modal);
    setTimeout(() => document.getElementById('piConfirmModal')?.remove(), 8000);
    if (navigator.vibrate) navigator.vibrate(isDep ? [100,50,100] : [200]);
  },

  // ════════════════════════════════════════════════════════
  // 4. DRIVER DASHBOARD
  // ════════════════════════════════════════════════════════
  openDriverDashboard() {
    document.getElementById('piDriverModal')?.remove();
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('trip_')) {
        try { sessions.push(JSON.parse(localStorage.getItem(key))); } catch(e) {}
      }
    }
    const route = this._busSession?.route || '—';
    const paxList = sessions.map(s => `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:8px 10px;background:rgba(22,201,121,.06);
                  border:1px solid rgba(22,201,121,.15);border-radius:8px;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="background:#16C979;color:#003320;width:24px;height:24px;
                      border-radius:50%;display:flex;align-items:center;justify-content:center;
                      font-size:.65rem;font-weight:800">#${s.passengerNo}</div>
          <div>
            <div style="color:#E8F8F0;font-size:.72rem;font-weight:600">
              #${s.passengerNo}
            </div>
            <div style="color:#6B9E84;font-size:.58rem">
              ${new Date(s.departureTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
            </div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="color:#16C979;font-size:.65rem;font-weight:700">
            ${(s.maxAmountRwf||0).toLocaleString()} FRw
          </div>
          <div style="background:rgba(22,201,121,.15);color:#16C979;
                      font-size:.55rem;padding:2px 6px;border-radius:4px">✅</div>
        </div>
      </div>`).join('');

    const modal = document.createElement('div');
    modal.id = 'piDriverModal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);
      display:flex;flex-direction:column;align-items:center;
      justify-content:flex-start;font-family:'Plus Jakarta Sans',sans-serif;
      padding:16px;overflow-y:auto`;

    modal.innerHTML = `
      <div style="width:100%;max-width:360px">
        <div style="text-align:center;margin-bottom:16px">
          <div style="color:#F5A623;font-size:.7rem;font-weight:700;
                      text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">
            ${t2('driver_dashboard')}
          </div>
          <div style="color:#E8F8F0;font-size:.9rem;font-weight:700">${route}</div>
          <div style="color:#6B9E84;font-size:.62rem">
            ${new Date().toLocaleDateString()}
          </div>
        </div>
        <div style="background:linear-gradient(135deg,rgba(10,124,78,.2),rgba(245,166,35,.1));
                    border:1px solid rgba(22,201,121,.25);border-radius:14px;
                    padding:16px;margin-bottom:12px;text-align:center">
          <div style="color:#6B9E84;font-size:.62rem;margin-bottom:4px">
            ${t2('passengers_paid')}
          </div>
          <div style="color:#16C979;font-size:2.5rem;font-weight:800;line-height:1">
            ${sessions.length}
          </div>
          <div style="color:#F5A623;font-size:.65rem;margin-top:4px">
            ${t2('total_collected')} : 
            ${sessions.reduce((a,s)=>a+(s.maxAmountRwf||0),0).toLocaleString()} FRw
          </div>
        </div>
        <div style="margin-bottom:12px">
          <div style="color:#6B9E84;font-size:.62rem;font-weight:700;
                      text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">
            ${t2('passenger_list')}
          </div>
          ${paxList || `<div style="color:#6B9E84;font-size:.72rem;
                         text-align:center;padding:16px">
                         ${t2('no_passengers')}</div>`}
        </div>
        <button onclick="document.getElementById('piDriverModal').remove()"
          style="background:rgba(255,255,255,.06);color:#E8F8F0;
                 border:1px solid rgba(255,255,255,.1);padding:12px;
                 border-radius:8px;font-size:.8rem;cursor:pointer;width:100%">
          ${t2('close')}
        </button>
      </div>`;

    document.body.appendChild(modal);
  },

  // ════════════════════════════════════════════════════════
  // 5. HELPERS
  // ════════════════════════════════════════════════════════
  _getGPS() {
    return new Promise(resolve => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { timeout: 4000 }
      );
    });
  },

  _updateDriverDashboard(passengerNo, session) {
    const counter = document.getElementById('paxCount');
    if (counter) counter.textContent = passengerNo;
    const list = document.getElementById('passengerList');
    if (list) {
      list.innerHTML += `
        <div style="display:flex;align-items:center;gap:6px;padding:5px 0;
                    border-bottom:1px solid rgba(255,255,255,.06)">
          <div style="background:#16C979;color:#003320;width:20px;height:20px;
                      border-radius:50%;display:flex;align-items:center;justify-content:center;
                      font-size:.58rem;font-weight:800;flex-shrink:0">#${passengerNo}</div>
          <div style="color:#E8F8F0;font-size:.65rem">
            ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
          </div>
          <div style="color:#16C979;font-size:.65rem;margin-left:auto;font-weight:700">
            ${(session.maxAmountRwf||500).toLocaleString()} FRw ✅
          </div>
        </div>`;
    }
  },

  _showManualEntry() {
    const status = document.getElementById('flowScanStatus');
    if (!status) return;
    status.innerHTML = `
      <div style="margin-top:8px">
        <input id="manualSessionId" type="text" placeholder="Session ID"
          style="width:100%;padding:9px;border-radius:8px;
                 border:1px solid rgba(22,201,121,.3);background:#0D1F18;
                 color:#E8F8F0;font-size:.8rem;margin-bottom:6px">
        <button onclick="PiQRFlow._validateManual()"
          style="background:rgba(22,201,121,.15);color:#16C979;
                 border:1px solid rgba(22,201,121,.3);padding:9px;
                 border-radius:8px;width:100%;cursor:pointer;font-size:.78rem">
          ${t2('ok')}
        </button>
      </div>`;
  },

  _validateManual() {
    const id = document.getElementById('manualSessionId')?.value?.trim();
    if (!id) return;
    const data = localStorage.getItem(`bus_session_${id}`);
    if (data) { this._onQRScanned(data); }
    else { alert(t2('session_not_found')); }
  },

  closeScanner() {
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
    document.getElementById('piScannerModal')?.remove();
  }
};

window.PiQRFlow = PiQRFlow;
console.log('[PiQRFlow] ✅ v1.1 Multilingual — PiHub RW'); 
