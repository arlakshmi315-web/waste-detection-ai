document.addEventListener("DOMContentLoaded", async () => {
  const { $, api, toast, getSettings, saveSettings } = WD;
  const s = getSettings();
  $("#setLocation").checked = s.location;
  $("#setInterval").value = String(s.interval);

  $("#setLocation").addEventListener("change", e => {
    saveSettings({ ...getSettings(), location: e.target.checked });
    toast(e.target.checked ? "Location enabled." : "Location turned off.", "success");
    if (e.target.checked) WD.getLocation({ force: true }); else location.reload();
  });
  $("#setInterval").addEventListener("change", e => {
    saveSettings({ ...getSettings(), interval: +e.target.value });
    toast("Live interval updated.", "success");
  });

  const st = await WD.checkModel();
  const pill = $("#setModel");
  if (st) {
    pill.className = "pill " + (st.model_loaded ? "ok" : "bad");
    pill.lastElementChild.textContent = st.model_loaded ? "Loaded" : (st.model_error === "load_failed" ? "Failed to load" : "Not found");
  } else pill.lastElementChild.textContent = "Unreachable";

  const dlg = $("#clearDialog");
  $("#clearBtn").addEventListener("click", () => dlg.showModal());
  $("#cancelClear").addEventListener("click", () => dlg.close());
  $("#confirmClear").addEventListener("click", async () => {
    dlg.close();
    try { await api("/api/history/clear", { method: "POST" }); toast("History cleared.", "success"); }
    catch (e) { toast(e.message, "error"); }
  });
});
