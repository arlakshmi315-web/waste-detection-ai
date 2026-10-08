document.addEventListener("DOMContentLoaded", async () => {
  const { $, api } = WD;
  let d;
  try { d = await api("/api/analytics"); } catch (e) { WD.toast(e.message, "error"); return; }

  $("#sTotal").textContent = d.total;
  $("#sTop").textContent = d.top_category || "–";
  $("#sToday").textContent = d.today;
  $("#sAvg").textContent = d.total ? d.avg_confidence + "%" : "–";

  if (!d.total) { $("#noData").classList.remove("hidden"); $("#charts").classList.add("hidden"); return; }

  const grid = { color: "#f1f5f9" };
  const bar = (id, labels, values, color = "#059669", extra = {}) => new Chart($(id), {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: color, borderRadius: 6, maxBarThickness: 32 }] },
    options: { scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid, ...(extra.y || {}) }, x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } } } }
  });

  const dist = d.distribution.filter(x => x.count > 0);
  new Chart($("#distChart"), {
    type: "doughnut",
    data: { labels: dist.map(x => x.name), datasets: [{ data: dist.map(x => x.count), backgroundColor: dist.map(x => x.color), borderWidth: 2, borderColor: "#fff" }] },
    options: { cutout: "62%", plugins: { legend: { display: true, position: "right", labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} (${dist[c.dataIndex].percent}%)` } } } }
  });

  new Chart($("#confChart"), {
    type: "bar",
    data: { labels: d.confidence_by_class.map(x => x.name), datasets: [{ data: d.confidence_by_class.map(x => x.avg), backgroundColor: d.distribution.map(x => x.color), borderRadius: 6, maxBarThickness: 36 }] },
    options: { indexAxis: "y", scales: { x: { min: 0, max: 100, grid, ticks: { callback: v => v + "%" } }, y: { grid: { display: false } } },
      plugins: { tooltip: { callbacks: { label: c => ` ${c.raw}% average` } } } }
  });

  bar("#dayChart", d.activity.month.labels.slice(-14), d.activity.month.values.slice(-14));
  bar("#weekChart", d.weekly.labels, d.weekly.values, "#0d9488");
  bar("#monthChart", d.monthly.labels, d.monthly.values, "#3b82f6");
  bar("#bucketChart", d.confidence_buckets.labels, d.confidence_buckets.values, "#64748b");
});
