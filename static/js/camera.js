document.addEventListener("DOMContentLoaded", () => {
  const { $, api, toast, getLocation, appendLocation, resultHTML, animateBars, getSettings, esc, icon } = WD;
  const video = $("#video"), canvas = $("#canvas"), out = $("#liveResult"),
        err = $("#camError"), overlay = $("#videoOverlay");
  const startBtn = $("#startCamBtn"), toggleBtn = $("#detectToggle"),
        capBtn = $("#captureBtn"), stopBtn = $("#stopCamBtn");
  let stream = null, timer = null, busy = false, detecting = false;

  const showErr = m => { err.textContent = m; err.classList.toggle("hidden", !m); };
  function setStatus(on, text) {
    $("#camStatus").className = "pill " + (on ? "ok" : "");
    $("#camStatusText").textContent = text;
  }

  function frameBlob(maxW = 640) {
    const w = video.videoWidth, h = video.videoHeight;
    if (!w || !h) return Promise.resolve(null);
    const s = Math.min(1, maxW / w);
    canvas.width = Math.round(w * s); canvas.height = Math.round(h * s);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(r => canvas.toBlob(r, "image/jpeg", 0.9));
  }

  async function startCamera() {
    showErr("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showErr("Camera is not supported here. Open the app at http://127.0.0.1:5000 in a modern browser."); return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } }, audio: false });
      video.srcObject = stream;
      await video.play().catch(() => {});
      $("#videoPlaceholder").classList.add("hidden");
      setStatus(true, "Camera active");
      startBtn.disabled = true; toggleBtn.disabled = false; capBtn.disabled = false; stopBtn.disabled = false;
      getLocation();                                   // ask for location once the camera is up
    } catch (e) {
      const msg = {
        NotAllowedError: "Camera permission was denied. Allow camera access in your browser and try again.",
        PermissionDeniedError: "Camera permission was denied. Allow camera access in your browser and try again.",
        NotFoundError: "No camera was found on this device.",
        NotReadableError: "The camera is being used by another application.",
      }[e.name] || "The camera could not be started.";
      showErr(msg); setStatus(false, "Camera unavailable");
    }
  }

  function stopCamera() {
    stopDetection();
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null; video.srcObject = null;
    $("#videoPlaceholder").classList.remove("hidden");
    overlay.classList.add("hidden");
    setStatus(false, "Camera off");
    startBtn.disabled = false; toggleBtn.disabled = true; capBtn.disabled = true; stopBtn.disabled = true;
  }

  async function liveTick() {
    if (busy || !stream || document.hidden) return;
    busy = true;
    try {
      const blob = await frameBlob();
      if (!blob) return;
      const fd = new FormData();
      fd.append("image", blob, "frame.jpg");
      const d = await api("/api/live-predict", { method: "POST", body: fd });
      if (!detecting) return;
      overlay.classList.remove("hidden");
      overlay.innerHTML = `<b>${esc(d.category)}</b><span>${d.confidence}%</span>`;
      const l = await getLocation();
      d.location = l ? l.location : null;
      d.latitude = l ? l.latitude : null; d.longitude = l ? l.longitude : null;
      out.innerHTML = resultHTML(d, { saved: false }) +
        `<p class="muted small" style="margin-top:14px">Live preview, not saved. Use <b>Capture &amp; predict</b> to save to history.</p>`;
      animateBars(out);
    } catch (e) {
      stopDetection();
      showErr(e.message);
    } finally { busy = false; }
  }

  function startDetection() {
    detecting = true; showErr("");
    $("#liveTag").classList.remove("hidden");
    toggleBtn.innerHTML = `${icon("stop")} <span>Stop detection</span>`;
    liveTick();
    timer = setInterval(liveTick, getSettings().interval);
  }
  function stopDetection() {
    detecting = false; clearInterval(timer); timer = null;
    $("#liveTag").classList.add("hidden"); overlay.classList.add("hidden");
    toggleBtn.innerHTML = `${icon("play")} <span>Start detection</span>`;
  }

  async function capture() {
    if (!stream) return;
    showErr(""); capBtn.disabled = true;
    const old = capBtn.innerHTML; capBtn.textContent = "Predicting…";
    try {
      const blob = await frameBlob(1280);
      if (!blob) throw new Error("The camera frame is not ready yet. Try again in a moment.");
      const loc = await getLocation();
      const fd = new FormData();
      fd.append("image", blob, `camera_${Date.now()}.jpg`);
      fd.append("source", "camera");
      appendLocation(fd, loc);
      while (busy) await new Promise(r => setTimeout(r, 100));
      const d = await api("/api/predict", { method: "POST", body: fd });
      out.innerHTML = resultHTML(d, { imageSrc: d.image_url });
      animateBars(out);
      toast("Saved to detection history.", "success");
      if (!loc) toast("Location unavailable. Saved without location.");
    } catch (e) { showErr(e.message); }
    finally { capBtn.disabled = !stream; capBtn.innerHTML = old; }
  }

  startBtn.addEventListener("click", startCamera);
  stopBtn.addEventListener("click", stopCamera);
  toggleBtn.addEventListener("click", () => detecting ? stopDetection() : startDetection());
  capBtn.addEventListener("click", capture);
  window.addEventListener("beforeunload", () => stream && stream.getTracks().forEach(t => t.stop()));
});
