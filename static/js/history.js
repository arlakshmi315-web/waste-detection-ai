document.addEventListener("DOMContentLoaded", async () => {
  const { $, esc, api, toast, icon } = WD;
  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "", q = "", rows = [], delId = null, t;

  const cats = await WD.categories().catch(() => []);
  const names = cats.map(c => c.name);
  if (!names.includes(type)) type = "";
  const colors = Object.fromEntries(cats.map(c => [c.name, c.color]));

  function drawFilters() {
    $("#filters").innerHTML = ["", ...names].map(n =>
      `<button class="filter ${n === type ? "on" : ""}" data-t="${esc(n)}">${n || "All"}</button>`).join("");
  }
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest(".filter"); if (!b) return;
    type = b.dataset.t; drawFilters(); load();
  });
  $("#search").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { q = e.target.value.trim(); load(); }, 250); });

  async function load() {
    try {
      const u = new URLSearchParams(); if (type) u.set("type", type); if (q) u.set("q", q);
      rows = await api("/api/history?" + u);
    } catch (e) { toast(e.message, "error"); rows = []; }
    draw();
  }

  function draw() {
    const empty = $("#empty");
    $("#rows").innerHTML = rows.map(r => `
      <tr>
        <td><img class="thumb" src="${esc(r.image_url)}" alt="${esc(r.image_name)}" loading="lazy"></td>
        <td><span class="tag" style="--c:${colors[r.waste_type] || "#64748b"}">${esc(r.waste_type)}</span></td>
        <td><div class="mini-bar"><b>${r.confidence}%</b><div class="bar"><i style="width:${Math.min(r.confidence, 100)}%"></i></div></div></td>
        <td class="loc" title="${esc(r.location || "")}">${r.location ? esc(r.location) : '<span class="muted">Unavailable</span>'}</td>
        <td>${esc(r.date_short)}</td><td>${esc(r.time_short)}</td>
        <td><div class="actions">
          <button class="icon-btn" data-view="${r.id}" aria-label="View">${icon("eye")}</button>
          <button class="icon-btn del" data-del="${r.id}" aria-label="Delete">${icon("trash")}</button></div></td>
      </tr>`).join("");
    $(".table-wrap").classList.toggle("hidden", !rows.length);
    empty.classList.toggle("hidden", !!rows.length);
    empty.innerHTML = (q || type)
      ? `${icon("search")}<p>No detections match your search or filter.</p>`
      : `${icon("image")}<p>No detection data available yet.</p><a class="btn btn-primary" href="/upload">Detect waste</a>`;
  }

  $("#rows").addEventListener("click", e => {
    const v = e.target.closest("[data-view]"), d = e.target.closest("[data-del]");
    if (v) view(rows.find(r => r.id == v.dataset.view));
    if (d) { delId = d.dataset.del; $("#confirmDialog").showModal(); }
  });

  function view(r) {
    if (!r) return;
    const coords = r.latitude != null ? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}` : "";
    $("#viewBody").innerHTML = `
      <img class="detail-img" src="${esc(r.image_url)}" alt="">
      <div class="facts">
        <div class="fact"><span>Waste type</span><b>${esc(r.waste_type)}</b></div>
        <div class="fact"><span>Confidence</span><b>${r.confidence}%</b></div>
        <div class="fact"><span>Category</span><b>${esc(r.category_group)}</b></div>
        <div class="fact"><span>Suggested bin</span><b>${esc(r.bin)}</b></div>
        <div class="fact"><span>Date</span><b>${esc(r.date_display)}</b></div>
        <div class="fact"><span>Time</span><b>${esc(r.time_display)}</b></div>
        <div class="fact full"><span>Location</span><b>${esc(r.location || "Location unavailable")}</b>${coords ? `<div class="muted small">${coords}</div>` : ""}</div>
        <div class="fact full"><span>Recommended action</span><b>${esc(r.recommendation)}</b></div>
        <div class="fact full"><span>File · Timestamp · Source</span><b>${esc(r.image_name)} · ${esc(r.timestamp)} · ${esc(r.source)}</b></div>
      </div>`;
    $("#viewDialog").showModal();
  }
  $("#closeView").addEventListener("click", () => $("#viewDialog").close());
  $("#cancelDel").addEventListener("click", () => $("#confirmDialog").close());
  $("#confirmDel").addEventListener("click", async () => {
    $("#confirmDialog").close();
    try { await api("/api/history/" + delId, { method: "DELETE" }); toast("Detection deleted.", "success"); }
    catch (e) { toast(e.message, "error"); }
    load();
  });
  document.querySelectorAll("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

  drawFilters(); load();
});
