document.addEventListener("DOMContentLoaded", () => {
  const { $, api, toast, fmtSize, getLocation, appendLocation, resultHTML, animateBars, icon } = WD;
  const MAX = 10 * 1024 * 1024;
  let file = null, previewUrl = null, mode = "single";

  const dz = $("#dropzone"), input = $("#fileInput"), prev = $("#preview"),
        err = $("#formError"), btn = $("#detectBtn"), out = $("#resultBody");

  const showErr = m => { err.textContent = m; err.classList.toggle("hidden", !m); };

  // ---------- Single item / Mixed waste switch ----------
  const HINTS = {
    single: "Use a photo of one waste item. The result is one waste type.",
    mixed: "Use a photo with many items. The photo is split into a grid and the share of each waste type is estimated."
  };
  document.querySelectorAll(".mode-btn").forEach(b => {
    b.addEventListener("click", () => {
      mode = b.dataset.mode;
      document.querySelectorAll(".mode-btn").forEach(x => {
        const on = x.dataset.mode === mode;
        x.classList.toggle("btn-primary", on);
        x.classList.toggle("btn-outline", !on);
      });
      $("#modeHint").textContent = HINTS[mode];
    });
  });

  // ---------- Mixed waste result ----------
  function mixedHTML(d) {
    const esc = WD.esc;
    if (!d.dominant) {
      return `<div class="empty">${icon("alert")}<p>The waste could not be identified clearly. Try a closer, clearer photo.</p></div>`;
    }
    const top = d.composition[0];
    const rows = d.composition.map(c => `
      <div style="margin:12px 0">
        <div style="display:flex;justify-content:space-between;font-size:14px">
          <span><b>${esc(c.name)}</b> <span class="muted small">(${c.tiles} of ${d.tiles_counted} tiles)</span></span>
          <b>${c.percent}%</b>
        </div>
        <div style="height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden">
          <div style="width:${c.percent}%;height:100%;background:${c.color}"></div>
        </div>
      </div>`).join("");

    const cells = d.grid_labels.map(l => {
      const color = l ? d.grid_colors[l] : "#e2e8f0";
      return `<div title="${l ? esc(l) : "Uncertain"}" style="background:${color};aspect-ratio:1;border-radius:3px"></div>`;
    }).join("");
    const legend = Object.entries(d.grid_colors).map(([n, c]) =>
      `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px;font-size:12px"><i style="width:10px;height:10px;border-radius:2px;background:${c};display:inline-block"></i>${esc(n)}</span>`
    ).join("") + `<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px"><i style="width:10px;height:10px;border-radius:2px;background:#e2e8f0;display:inline-block"></i>Uncertain</span>`;

    const loc = d.location
      ? `${esc(d.location)}<div class="muted small">${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}</div>`
      : "Location unavailable";

    return `
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">
        ${d.image_url ? `<img src="${d.image_url}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:10px">` : ""}
        <div>
          <div class="muted small" style="letter-spacing:.08em;font-weight:600">MOST COMMON WASTE</div>
          <div style="font-size:28px;font-weight:700">${esc(d.dominant)}</div>
          <div class="muted small">${top.percent}% of the identified area</div>
        </div>
      </div>

      <div class="muted small" style="letter-spacing:.08em;font-weight:600">WASTE COMPOSITION</div>
      ${rows}

      <div class="muted small" style="letter-spacing:.08em;font-weight:600;margin-top:16px">WHAT THE MODEL SAW</div>
      <div style="display:grid;grid-template-columns:repeat(${d.grid},1fr);gap:2px;max-width:260px;margin:8px 0">${cells}</div>
      <div>${legend}</div>
      <p class="muted small" style="margin-top:8px">${d.tiles_uncertain} of ${d.tiles_total} tiles were uncertain and not counted. This is an estimate.</p>

      <div style="margin-top:14px">
        <div class="muted small" style="letter-spacing:.08em;font-weight:600">SUGGESTED BIN (FOR ${esc(d.dominant).toUpperCase()})</div>
        <div><b>${esc(d.bin)}</b></div>
        <div style="margin-top:8px">${esc(d.recommendation)}</div>
      </div>

      <div style="display:flex;gap:30px;margin-top:14px">
        <div><div class="muted small" style="letter-spacing:.08em;font-weight:600">TIME</div><b>${esc(d.time_display)}</b></div>
        <div><div class="muted small" style="letter-spacing:.08em;font-weight:600">DATE</div><b>${esc(d.date_display)}</b></div>
      </div>
      <div style="margin-top:14px">
        <div class="muted small" style="letter-spacing:.08em;font-weight:600">LOCATION</div>
        <b>${loc}</b>
      </div>`;
  }

  // ---------- File handling ----------
  function setFile(f) {
    showErr("");
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(ext) || !["image/jpeg", "image/png"].includes(f.type)) {
      showErr("Unsupported file. Please choose a JPG, JPEG or PNG image."); return;
    }
    if (f.size === 0) { showErr("The selected file is empty."); return; }
    if (f.size > MAX) { showErr("Image is too large. Maximum size is 10 MB."); return; }
    file = f;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(f);
    $("#previewImg").src = previewUrl;
    $("#fileName").textContent = f.name;
    $("#fileSize").textContent = fmtSize(f.size);
    dz.classList.add("hidden"); prev.classList.remove("hidden");
    btn.disabled = false;
  }

  function clearFile() {
    file = null; input.value = ""; showErr("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    $("#previewImg").removeAttribute("src");
    prev.classList.add("hidden"); dz.classList.remove("hidden");
    btn.disabled = true;
  }

  $("#chooseBtn").addEventListener("click", e => { e.stopPropagation(); input.click(); });
  dz.addEventListener("click", () => input.click());
  dz.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", () => setFile(input.files[0]));
  ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("over"); }));
  dz.addEventListener("drop", e => setFile(e.dataTransfer.files[0]));
  $("#removeBtn").addEventListener("click", clearFile);

  // ---------- Detect ----------
  btn.addEventListener("click", async () => {
    if (!file) { showErr("No image selected. Please choose an image first."); return; }
    showErr("");
    btn.disabled = true;
    btn.querySelector(".spinner").classList.remove("hidden");
    btn.querySelector(".btn-label").textContent = "Detecting…";
    out.innerHTML = `<div class="empty"><div class="spinner" style="border-color:#cbd5e1;border-top-color:#059669;width:26px;height:26px"></div><p>Analysing image…</p></div>`;
    try {
      const loc = await getLocation();           // never throws; null if denied
      const fd = new FormData();
      fd.append("image", file);
      fd.append("source", "upload");
      appendLocation(fd, loc);
      if (mode === "mixed") {
        const d = await api("/api/predict-mixed", { method: "POST", body: fd });
        out.innerHTML = mixedHTML(d);
      } else {
        const d = await api("/api/predict", { method: "POST", body: fd });
        out.innerHTML = resultHTML(d, { imageSrc: d.image_url });
        animateBars(out);
      }
      if (!loc) toast("Location unavailable. Detection saved without location.");
    } catch (e) {
      out.innerHTML = `<div class="empty">${icon("alert")}<p>${WD.esc(e.message)}</p></div>`;
      showErr(e.message);
    } finally {
      btn.disabled = !file;
      btn.querySelector(".spinner").classList.add("hidden");
      btn.querySelector(".btn-label").textContent = "Detect waste";
    }
  });
});