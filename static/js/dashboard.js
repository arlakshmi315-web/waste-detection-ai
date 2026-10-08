document.addEventListener("DOMContentLoaded", async () => {
  const { $, $$, esc, api, icon, CAT_ICON } = WD;
  let data, actChart, distChart, range = "week";

  try { data = await api("/api/analytics"); }
  catch (e) { WD.toast(e.message, "error"); return; }

  $("#sTotal").textContent = data.total;
  $("#sToday").textContent = data.today;
  $("#sTop").textContent = data.top_category || "–";
  $("#sAvg").textContent = data.total ? data.avg_confidence + "%" : "–";

  const empty = data.total === 0;
  $("#distWrap").classList.toggle("hidden", empty);
  $("#actWrap").classList.toggle("hidden", empty);
  $("#distEmpty").classList.toggle("hidden", !empty);
  $("#actEmpty").classList.toggle("hidden", !empty);

  if (!empty) {
    const d = data.distribution.filter(x => x.count > 0);
    distChart = new Chart($("#distChart"), {
      type: "doughnut",
      data: { labels: d.map(x => x.name), datasets: [{ data: d.map(x => x.count), backgroundColor: d.map(x => x.color), borderWidth: 2, borderColor: "#fff" }] },
      options: { cutout: "68%", plugins: { tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} (${d[c.dataIndex].percent}%)` } } } }
    });
    $("#distLegend").innerHTML = data.distribution.map(x =>
      `<li><span class="sw" style="background:${x.color}"></span>${esc(x.name)}<b>${x.percent}%</b></li>`).join("");
    drawActivity();
  }

  function drawActivity() {
    const a = data.activity[range];
    if (actChart) actChart.destroy();
    actChart = new Chart($("#actChart"), {
      type: "bar",
      data: { labels: a.labels, datasets: [{ data: a.values, backgroundColor: "#059669", borderRadius: 6, maxBarThickness: 28 }] },
      options: { scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#f1f5f9" } }, x: { grid: { display: false }, ticks: { maxTicksLimit: range === "month" ? 8 : 12 } } } }
    });
  }
  $$("#rangeSwitch button").forEach(b => b.addEventListener("click", () => {
    $$("#rangeSwitch button").forEach(x => x.classList.toggle("on", x === b));
    range = b.dataset.r;
    if (!empty) drawActivity();
  }));

  // recent detections
  try {
    const rows = await api("/api/history?limit=5");
    $("#recent").innerHTML = rows.length ? rows.map(r => `
      <div class="recent-item">
        <img src="${esc(r.image_url)}" alt="">
        <div class="grow"><div class="name">${esc(r.waste_type)}</div>
          <div class="muted small">${esc(r.date_short)} · ${esc(r.time_short)}${r.location ? " · " + esc(r.location) : ""}</div></div>
        <b>${r.confidence}%</b>
      </div>`).join("") :
      `<div class="empty">${icon("image")}<p>No detection data available yet.</p><a class="btn btn-primary" href="/upload">Detect waste</a></div>`;
  } catch { $("#recent").innerHTML = `<div class="empty">Could not load recent detections.</div>`; }
});
