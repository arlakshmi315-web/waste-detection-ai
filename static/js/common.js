/* Shared helpers for every page */
const WD = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));

  const icon = n => `<svg class="ico"><use href="#i-${n}"/></svg>`;

  /* ---------- settings (localStorage) ---------- */
  const DEFAULTS = { location: true, interval: 2000 };
  const getSettings = () => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("wd_settings") || "{}") }; }
    catch { return { ...DEFAULTS }; }
  };
  const saveSettings = s => {
    try { localStorage.setItem("wd_settings", JSON.stringify(s)); } catch { /* ignore */ }
  };

  /* ---------- toast ---------- */
  function toast(msg, type = "info") {
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }

  /* ---------- API ---------- */
  async function api(url, opts = {}) {
    let res;
    try { res = await fetch(url, opts); }
    catch { throw new Error("Cannot reach the server. Make sure the app is still running."); }
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON */ }
    if (res.status === 401 && !location.pathname.startsWith("/login") && !location.pathname.startsWith("/register")) {
      location.href = "/login?next=" + encodeURIComponent(location.pathname);
      throw new Error("Please sign in to continue.");
    }
    if (!res.ok) throw new Error((data && data.error) || "Something went wrong. Please try again.");
    return data;
  }

  /* ---------- model status ---------- */
  let modelOk = null;
  async function checkModel() {
    const box = $("#modelState"), txt = $("#modelStateText");
    try {
      const s = await api("/api/status");
      modelOk = s.model_loaded;
      box.className = "model-state " + (modelOk ? "ok" : "bad");
      txt.textContent = modelOk ? "Model ready" : (s.model_error === "load_failed" ? "Model failed to load" : "Model not found");
      const b = $("#modelBanner");
      if (b) b.classList.toggle("hidden", modelOk);
      return s;
    } catch {
      box.className = "model-state bad"; txt.textContent = "Server unreachable";
      return null;
    }
  }

  /* ---------- location ---------- */
  let loc = null;              // {latitude, longitude, location, location_timestamp, at}
  let locState = "idle";       // idle | loading | ok | denied | unavailable | off
  const chip = () => $("#locChip");

  function paintChip() {
    const c = chip(), t = $("#locChipText");
    if (!c) return;
    c.classList.toggle("ok", locState === "ok");
    if (locState === "ok" && loc) { t.textContent = loc.short || loc.location; c.title = loc.location + (loc.accuracy ? " (accuracy about " + Math.round(loc.accuracy) + " m)" : ""); }
    else if (locState === "loading") t.textContent = "Locating…";
    else if (locState === "denied") t.textContent = "Location unavailable";
    else if (locState === "off") t.textContent = "Location off";
    else if (locState === "unavailable") t.textContent = "Location unavailable";
    else t.textContent = "Enable location";
  }

  async function reverseGeocode(lat, lng) {
    const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=en&lat=${lat}&lon=${lng}`, { signal: ctl.signal });
      if (!r.ok) throw new Error();
      const d = await r.json();
      const a = d.address || {};
      const uniq = arr => arr.filter(Boolean).filter((p, i, x) => x.indexOf(p) === i);
      const road = a.road || a.pedestrian || a.footway || a.path;
      const area = a.neighbourhood || a.suburb || a.hamlet || a.quarter;
      const place = a.city || a.town || a.village || a.municipality || a.city_district || a.county;
      const full = uniq([d.name, road, area, place, a.state_district, a.state, a.postcode]);
      const short = uniq([area || road, place]);
      return {
        full: full.length ? full.join(", ") : (d.display_name || coords),
        short: short.length ? short.join(", ") : (place || coords)
      };
    } catch { return { full: coords, short: coords }; }
    finally { clearTimeout(timer); }
  }

  /** Returns location object or null. Never throws. */
  async function getLocation({ force = false } = {}) {
    if (!getSettings().location) { locState = "off"; paintChip(); return null; }
    if (!force && loc && Date.now() - loc.at < 120000) return loc;
    if (!("geolocation" in navigator)) { locState = "unavailable"; paintChip(); return null; }
    locState = "loading"; paintChip();
    try {
      const getPos = opts => new Promise((ok, no) => navigator.geolocation.getCurrentPosition(ok, no, opts));
      let pos;
      try {
        pos = await getPos({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
      } catch (err) {
        if (err && err.code === 1) throw err;   // permission denied: do not retry
        pos = await getPos({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
      }
      const { latitude, longitude, accuracy } = pos.coords;
      const g = await reverseGeocode(latitude, longitude);
      loc = {
        latitude, longitude, location: g.full, short: g.short, accuracy,
        location_timestamp: new Date(pos.timestamp).toISOString(), at: Date.now()
      };
      locState = "ok"; paintChip();
      return loc;
    } catch (e) {
      locState = e && e.code === 1 ? "denied" : "unavailable";
      loc = null; paintChip();
      return null;
    }
  }

  function appendLocation(fd, l) {
    if (!l) return;
    fd.append("latitude", l.latitude);
    fd.append("longitude", l.longitude);
    fd.append("location", l.location);
    fd.append("location_timestamp", l.location_timestamp);
  }

  function initLocationChip() {
    paintChip();
    chip().addEventListener("click", async () => {
      const s = getSettings();
      if (!s.location) { toast("Location is turned off in Settings."); return; }
      const l = await getLocation({ force: true });
      if (!l) toast(locState === "denied"
        ? "Location permission was denied. You can still detect waste without it."
        : "Location is unavailable on this device.", "error");
    });
    if (getSettings().location && navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" })
        .then(p => { if (p.state === "granted") getLocation(); })
        .catch(() => {});
    } else if (!getSettings().location) { locState = "off"; paintChip(); }
  }

  /* ---------- formatting ---------- */
  const fmtSize = b => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(2) + " MB";
  const CAT_ICON = { Plastic: "bottle", Paper: "paper", Glass: "glass", Metal: "can", Organic: "leaf" };
  let catCache = null;
  async function categories() {
    if (!catCache) catCache = await api("/api/categories");
    return catCache;
  }

  /* ---------- result card ---------- */
  function resultHTML(d, { imageSrc, saved = true } = {}) {
    const locText = d.location || (d.latitude != null ? `${(+d.latitude).toFixed(4)}, ${(+d.longitude).toFixed(4)}` : "Location unavailable");
    const coords = d.latitude != null ? `${(+d.latitude).toFixed(4)}, ${(+d.longitude).toFixed(4)}` : "";
    const scores = Object.entries(d.scores || {}).sort((a, b) => b[1] - a[1]);
    return `
      <div class="res-top">
        ${imageSrc ? `<img class="res-img" src="${esc(imageSrc)}" alt="Analysed image">` : ""}
        <div><div class="res-kicker">WASTE DETECTED</div><div class="res-title">${esc(d.category)}</div></div>
      </div>
      <div class="conf">
        <div class="conf-row"><span class="muted">Confidence</span><b>${d.confidence}%</b></div>
        <div class="bar ${d.low_confidence ? "warn" : ""}"><i data-w="${d.confidence}"></i></div>
      </div>
      ${d.low_confidence ? `<div class="note">Low confidence. Try a clearer photo with a plain background.</div>` : ""}
      <div class="facts">
        <div class="fact"><span>Category</span><b>${esc(d.group)}</b></div>
        <div class="fact"><span>Suggested bin</span><b>${esc(d.bin)}</b></div>
        <div class="fact full"><span>Recommended action</span><b>${esc(d.recommendation)}</b></div>
        <div class="fact"><span>Detection time</span><b>${esc(d.time_display)}</b></div>
        <div class="fact"><span>Detection date</span><b>${esc(d.date_display)}</b></div>
        <div class="fact full"><span>Location</span><b>${esc(locText)}</b>${coords && d.location && d.location !== coords ? `<div class="muted small">${coords}</div>` : ""}</div>
      </div>
      <div class="scores">${scores.map(([n, v]) => `
        <div class="score"><span>${esc(n)}</span><div class="bar"><i data-w="${v}"></i></div><em>${v}%</em></div>`).join("")}</div>
      ${saved ? `<div class="res-actions"><a class="btn btn-outline" href="/history">${icon("history")} View history</a></div>` : ""}`;
  }

  function animateBars(root) {
    requestAnimationFrame(() => $$("i[data-w]", root).forEach(i => { i.style.width = Math.min(+i.dataset.w, 100) + "%"; }));
  }

  /* ---------- charts ---------- */
  function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = "#64748b";
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.maintainAspectRatio = false;
  }

  /* ---------- signed-in user + sign out ---------- */
  async function initUser() {
    const sb = $("#sidebar");
    if (!sb) return;
    try {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const u = await res.json();
      const box = document.createElement("div");
      box.style.cssText = "margin:12px 14px;padding:12px;border:1px solid #e2e8f0;border-radius:12px;font-size:13px;line-height:1.35";
      box.innerHTML =
        `<div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.name)}</div>` +
        `<div style="color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:10px">${esc(u.email)}</div>` +
        `<button type="button" id="logoutBtn" style="width:100%;height:36px;border:1px solid #e2e8f0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer">Sign out</button>`;
      sb.appendChild(box);
      $("#logoutBtn").addEventListener("click", async () => {
        try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
        location.href = "/login";
      });
    } catch { /* ignore */ }
  }

  /* ---------- sidebar ---------- */
  function initSidebar() {
    const sb = $("#sidebar"), sc = $("#scrim");
    const toggle = open => { sb.classList.toggle("open", open); sc.classList.toggle("show", open); };
    $("#menuBtn").addEventListener("click", () => toggle(!sb.classList.contains("open")));
    sc.addEventListener("click", () => toggle(false));
    $$(".nav-item").forEach(a => a.addEventListener("click", () => toggle(false)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initUser();
    initLocationChip();
    checkModel();
    chartDefaults();
  });

  return { $, $$, esc, icon, api, toast, getSettings, saveSettings, getLocation, appendLocation,
           fmtSize, CAT_ICON, categories, resultHTML, animateBars, checkModel, chartDefaults,
           get modelOk() { return modelOk; } };
})();