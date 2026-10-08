"""
Waste Detection AI - Flask backend.

Reuses the original project's ML pipeline (Keras model, OpenCV preprocessing,
five trained classes) and adds a dashboard, detection history, analytics,
location and timestamp recording.
"""
import functools
import logging
import os
import re
import secrets
import sqlite3
import threading
import time
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path

import cv2
import numpy as np
from flask import (Flask, g, jsonify, redirect, render_template, request,
                   send_from_directory, session)
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
DB_DIR = BASE_DIR / "database"
MODEL_PATH = BASE_DIR / "model" / "waste_classifier.keras"
TFLITE_PATH = BASE_DIR / "model" / "waste_classifier.tflite"
DB_PATH = DB_DIR / "waste_detection.db"

UPLOAD_DIR.mkdir(exist_ok=True)
DB_DIR.mkdir(exist_ok=True)

MAX_UPLOAD_MB = 10
ALLOWED_EXT = {"jpg", "jpeg", "png"}
LOW_CONFIDENCE = 60.0

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024
log = logging.getLogger("waste_ai")
logging.basicConfig(level=logging.INFO)


def _load_secret_key():
    """Secret used to sign login cookies. Set SECRET_KEY in production."""
    env = os.environ.get("SECRET_KEY")
    if env:
        return env
    key_file = DB_DIR / "secret.key"
    if key_file.exists():
        return key_file.read_text().strip()
    key = secrets.token_hex(32)
    key_file.write_text(key)
    return key


app.secret_key = _load_secret_key()
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=timedelta(days=14),
)

# --------------------------------------------------------------------------
# Classes the model was trained on (must match train_model.py order)
# --------------------------------------------------------------------------
CLASS_NAMES = ["Plastic", "Paper", "Glass", "Metal", "Organic"]

CATEGORY_INFO = {
    "Plastic": {
        "icon": "bottle", "color": "#3b82f6", "group": "Recyclable",
        "bin": "Plastic Bin",
        "description": "Synthetic polymer items such as bottles, containers "
                       "and packaging.",
        "examples": ["Water bottles", "Food containers", "Shampoo bottles",
                     "Plastic bags"],
        "tip": "Send to plastic recycling. Clean and dry the item before "
               "placing it in the plastic recycling bin.",
        "disposal": "Rinse containers, remove caps and labels where possible "
                    "and keep plastics separate from food waste.",
    },
    "Paper": {
        "icon": "paper", "color": "#f59e0b", "group": "Recyclable",
        "bin": "Paper Bin",
        "description": "Fibre-based items including paper sheets, newspapers "
                       "and cardboard packaging.",
        "examples": ["Newspapers", "Office paper", "Cardboard boxes",
                     "Magazines"],
        "tip": "Send to paper recycling. Keep paper clean and dry and "
               "flatten boxes where possible.",
        "disposal": "Wet, greasy or heavily soiled paper cannot be recycled "
                    "and should go to the organic stream instead.",
    },
    "Glass": {
        "icon": "glass", "color": "#14b8a6", "group": "Recyclable",
        "bin": "Glass Bin",
        "description": "Rigid, brittle containers made of glass that can be "
                       "recycled repeatedly.",
        "examples": ["Bottles", "Jars", "Drinking glasses",
                     "Glass containers"],
        "tip": "Send to glass recycling. Separate glass from other waste "
               "and handle broken glass carefully.",
        "disposal": "Rinse containers and wrap broken pieces in paper before "
                    "disposal to protect waste handlers.",
    },
    "Metal": {
        "icon": "can", "color": "#64748b", "group": "Recyclable",
        "bin": "Metal Bin",
        "description": "Aluminium, steel and other metal items that are "
                       "highly recyclable.",
        "examples": ["Soft drink cans", "Food tins", "Foil trays",
                     "Metal lids"],
        "tip": "Send to metal recycling. Empty and rinse metal containers "
               "before recycling when appropriate.",
        "disposal": "Crush cans to save space and keep metals free of food "
                    "residue.",
    },
    "Organic": {
        "icon": "leaf", "color": "#65a30d", "group": "Biodegradable",
        "bin": "Organic Bin",
        "description": "Biodegradable waste from plants and food that can be "
                       "composted.",
        "examples": ["Food scraps", "Fruit and vegetable peels",
                     "Garden waste", "Leaves"],
        "tip": "Send to composting. Put food and other biodegradable waste "
               "into the organic-waste stream.",
        "disposal": "Compost at home or use the municipal wet-waste "
                    "collection. Avoid mixing with plastics.",
    },
}

# --------------------------------------------------------------------------
# Model loading (original logic, now thread-safe)
# --------------------------------------------------------------------------
MODEL = None
MODEL_ERROR = None
_model_lock = threading.Lock()
_predict_lock = threading.Lock()


class TFLiteModel:
    """Small, fast stand-in for the Keras model (needs no TensorFlow).

    It offers the same predict() call the rest of the app already uses.
    """

    def __init__(self, path):
        try:
            from ai_edge_litert.interpreter import Interpreter
        except ImportError:
            try:
                from tflite_runtime.interpreter import Interpreter
            except ImportError:
                import tensorflow as tf
                Interpreter = tf.lite.Interpreter
        self._it = Interpreter(model_path=str(path), num_threads=1)
        self._it.allocate_tensors()
        self._in = self._it.get_input_details()[0]
        self._out = self._it.get_output_details()[0]

    def predict(self, batch, batch_size=None, verbose=0):
        results = []
        for i in range(len(batch)):
            x = np.asarray(batch[i:i + 1], dtype=self._in["dtype"])
            self._it.set_tensor(self._in["index"], x)
            self._it.invoke()
            results.append(self._it.get_tensor(self._out["index"])[0].copy())
        return np.stack(results)


def get_model():
    """Load the trained model once. Returns None if unavailable.

    Uses the small .tflite file when it exists (Render / low-memory hosting),
    otherwise the full Keras model. Set USE_KERAS=1 to force the Keras model.
    """
    global MODEL, MODEL_ERROR
    if MODEL is not None:
        return MODEL
    with _model_lock:
        if MODEL is not None:
            return MODEL
        use_lite = TFLITE_PATH.exists() and os.environ.get("USE_KERAS") != "1"
        if not use_lite and not MODEL_PATH.exists():
            MODEL_ERROR = "not_found"
            return None
        try:
            if use_lite:
                MODEL = TFLiteModel(TFLITE_PATH)
            else:
                os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
                from tensorflow.keras.models import load_model
                MODEL = load_model(MODEL_PATH)
            MODEL_ERROR = None
        except Exception:  # noqa: BLE001
            log.exception("Model failed to load")
            MODEL_ERROR = "load_failed"
            MODEL = None
    return MODEL


def preprocess_image(file_bytes):
    """OpenCV preprocessing: decode, BGR->RGB, resize.

    Pixels are kept in the 0-255 range. The model itself applies the
    MobileNetV2 scaling inside (see train_model.py), so do NOT divide by 255.
    """
    array = np.frombuffer(file_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("The file is not a valid image.")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (224, 224), interpolation=cv2.INTER_AREA)
    image = image.astype(np.float32)
    return np.expand_dims(image, axis=0)


def run_model(model, file_bytes):
    """Run the real model. Returns (category, confidence_percent, scores)."""
    batch = preprocess_image(file_bytes)
    with _predict_lock:
        predictions = model.predict(batch, verbose=0)[0]
    predictions = np.asarray(predictions, dtype=np.float32)

    if predictions.ndim != 1 or len(predictions) != len(CLASS_NAMES):
        raise RuntimeError("Model output does not match the five classes.")
    if not np.isclose(predictions.sum(), 1.0, atol=1e-2):
        exp = np.exp(predictions - np.max(predictions))
        predictions = exp / exp.sum()

    best = int(np.argmax(predictions))
    scores = {n: round(float(s) * 100, 2)
              for n, s in zip(CLASS_NAMES, predictions)}
    return CLASS_NAMES[best], round(float(predictions[best]) * 100, 2), scores


# Mixed-waste mode: the photo is cut into a GRID x GRID set of tiles, each tile
# is classified, and the tiles are counted per waste type.
GRID = 6                # 6 x 6 = 36 tiles
TILE_MIN_CONF = 50.0    # tiles the model is less sure about are not counted


def analyse_mixed(model, file_bytes, grid=GRID):
    """Estimate the share of each waste type in a photo with many items."""
    array = np.frombuffer(file_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("The file is not a valid image.")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    h, w = image.shape[:2]
    if h < grid * 8 or w < grid * 8:
        raise ValueError("The image is too small for mixed-waste analysis.")

    tiles = []
    for r in range(grid):
        for c in range(grid):
            y0, y1 = r * h // grid, (r + 1) * h // grid
            x0, x1 = c * w // grid, (c + 1) * w // grid
            tile = cv2.resize(image[y0:y1, x0:x1], (224, 224),
                              interpolation=cv2.INTER_AREA)
            tiles.append(tile.astype(np.float32))   # 0-255, no /255
    batch = np.stack(tiles)

    with _predict_lock:
        preds = model.predict(batch, batch_size=16, verbose=0)
    preds = np.asarray(preds, dtype=np.float32)
    if preds.ndim != 2 or preds.shape[1] != len(CLASS_NAMES):
        raise RuntimeError("Model output does not match the five classes.")

    counts = {n: 0 for n in CLASS_NAMES}
    conf_sum = {n: 0.0 for n in CLASS_NAMES}
    grid_labels, uncertain = [], 0
    for p in preds:
        best = int(np.argmax(p))
        conf = float(p[best]) * 100
        if conf < TILE_MIN_CONF:
            uncertain += 1
            grid_labels.append(None)
            continue
        name = CLASS_NAMES[best]
        counts[name] += 1
        conf_sum[name] += conf
        grid_labels.append(name)

    counted = sum(counts.values())
    composition = []
    for n in CLASS_NAMES:
        composition.append({
            "name": n,
            "tiles": counts[n],
            "percent": round(counts[n] * 100 / counted, 1) if counted else 0,
            "avg_confidence": round(conf_sum[n] / counts[n], 1)
            if counts[n] else 0,
            "color": CATEGORY_INFO[n]["color"],
        })
    composition.sort(key=lambda x: x["tiles"], reverse=True)

    dominant = composition[0]["name"] if counted else None
    return {
        "dominant": dominant,
        "composition": composition,
        "grid": grid,
        "grid_labels": grid_labels,
        "grid_colors": {n: CATEGORY_INFO[n]["color"] for n in CLASS_NAMES},
        "tiles_total": grid * grid,
        "tiles_counted": counted,
        "tiles_uncertain": uncertain,
    }


# --------------------------------------------------------------------------
# Database
# --------------------------------------------------------------------------
@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_name TEXT NOT NULL,
                image_path TEXT NOT NULL,
                waste_type TEXT NOT NULL,
                confidence REAL NOT NULL,
                category_group TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                location TEXT,
                location_timestamp TEXT,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'upload',
                user_id INTEGER
            )
        """)
        cols = [r["name"] for r in conn.execute("PRAGMA table_info(detections)")]
        if "user_id" not in cols:          # database made before login existed
            conn.execute("ALTER TABLE detections ADD COLUMN user_id INTEGER")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_det_user ON detections(user_id)")


def row_to_dict(row):
    d = dict(row)
    ts = datetime.strptime(d["timestamp"], "%Y-%m-%d %H:%M:%S")
    d["date_display"] = ts.strftime("%d %B %Y")
    d["time_display"] = ts.strftime("%I:%M:%S %p")
    d["date_short"] = ts.strftime("%d/%m/%y")
    d["time_short"] = ts.strftime("%I:%M %p")
    d["image_url"] = f"/uploads/{d['image_path']}"
    d["recommendation"] = CATEGORY_INFO[d["waste_type"]]["tip"]
    d["bin"] = CATEGORY_INFO[d["waste_type"]]["bin"]
    return d


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def fail(message, status=400, **extra):
    return jsonify({"error": message, **extra}), status


def read_valid_image(req):
    """Return (filename, bytes) or raise ValueError with a friendly message."""
    if "image" not in req.files:
        raise ValueError("No image selected. Please choose an image first.")
    f = req.files["image"]
    name = (f.filename or "").strip()
    if not name:
        raise ValueError("No image selected. Please choose an image first.")
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in ALLOWED_EXT:
        raise ValueError("Unsupported file type. Please upload a JPG, JPEG "
                         "or PNG image.")
    data = f.read()
    if not data:
        raise ValueError("The selected file is empty.")
    is_jpg = data[:3] == b"\xff\xd8\xff"
    is_png = data[:8] == b"\x89PNG\r\n\x1a\n"
    if not (is_jpg or is_png):
        raise ValueError("The file is not a valid JPG or PNG image.")
    return name, data, ("png" if is_png else "jpg")


def model_unavailable_response():
    if MODEL_ERROR == "load_failed":
        return fail("The trained model could not be loaded. Please check the "
                    "model file and your TensorFlow installation.", 503,
                    code="model_load_failed")
    return fail("Trained model not found. Train the model first by running "
                "'python train_model.py', then restart the app.", 503,
                code="model_not_found")


def parse_location(form):
    try:
        lat = float(form.get("latitude", ""))
        lng = float(form.get("longitude", ""))
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            raise ValueError
    except (TypeError, ValueError):
        return None, None, None, None
    name = (form.get("location") or "").strip()[:200] or None
    loc_ts = (form.get("location_timestamp") or "").strip()[:40] or None
    return lat, lng, name, loc_ts


def build_prediction_payload(category, confidence, scores, now):
    info = CATEGORY_INFO[category]
    return {
        "category": category,
        "waste_type": category,
        "confidence": confidence,
        "group": info["group"],
        "bin": info["bin"],
        "recommendation": info["tip"],
        "scores": scores,
        "low_confidence": confidence < LOW_CONFIDENCE,
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "date_display": now.strftime("%d %B %Y"),
        "time_display": now.strftime("%I:%M:%S %p"),
    }


# --------------------------------------------------------------------------
# Login helpers
# --------------------------------------------------------------------------
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_failed_logins = {}


def current_user():
    uid = session.get("uid")
    if not uid:
        return None
    with db() as conn:
        return conn.execute("SELECT id, name, email FROM users WHERE id=?",
                            (uid,)).fetchone()


def login_required(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user()
        if user is None:
            is_api = (request.path.startswith("/api/")
                      or request.method != "GET"
                      or request.path in ("/history/data", "/analytics/data"))
            if is_api:
                return fail("Please sign in to continue.", 401, code="auth")
            return redirect("/login?next=" + request.path)
        g.user = user
        return fn(*args, **kwargs)
    return wrapper


def _too_many_failures(key):
    now = time.time()
    recent = [t for t in _failed_logins.get(key, []) if now - t < 600]
    _failed_logins[key] = recent
    return len(recent) >= 5


def _start_session(user_id):
    session.clear()
    session["uid"] = user_id
    session.permanent = True


# --------------------------------------------------------------------------
# Pages
# --------------------------------------------------------------------------
@app.route("/")
@login_required
def dashboard():
    return render_template("dashboard.html", active="dashboard")


@app.route("/upload")
@login_required
def upload_page():
    return render_template("upload.html", active="upload")


@app.route("/live")
@login_required
def live_page():
    return render_template("live_detection.html", active="live")


@app.route("/history")
@login_required
def history_page():
    return render_template("history.html", active="history")


@app.route("/categories")
@login_required
def categories_page():
    cats = [{"name": n, **CATEGORY_INFO[n]} for n in CLASS_NAMES]
    return render_template("categories.html", active="categories",
                           categories=cats)


@app.route("/analytics")
@login_required
def analytics_page():
    return render_template("analytics.html", active="analytics")


@app.route("/settings")
@login_required
def settings_page():
    return render_template("settings.html", active="settings",
                           model_file=MODEL_PATH.name, classes=CLASS_NAMES,
                           max_mb=MAX_UPLOAD_MB)


@app.route("/uploads/<path:filename>")
@login_required
def uploaded_file(filename):
    with db() as conn:
        row = conn.execute(
            "SELECT 1 FROM detections WHERE image_path=? AND user_id=?",
            (filename, g.user["id"])).fetchone()
    if row is None:
        return fail("Not found.", 404)
    return send_from_directory(UPLOAD_DIR, filename)


# --------------------------------------------------------------------------
# API
# --------------------------------------------------------------------------
@app.get("/api/status")
def api_status():
    return jsonify({
        "model_loaded": get_model() is not None,
        "model_file": MODEL_PATH.name,
        "model_error": MODEL_ERROR,
        "classes": CLASS_NAMES,
    })


@app.get("/api/categories")
@login_required
def api_categories():
    return jsonify([{"name": n, **CATEGORY_INFO[n]} for n in CLASS_NAMES])


def _predict(save):
    try:
        name, data, ext = read_valid_image(request)
    except ValueError as exc:
        return fail(str(exc), 400)

    model = get_model()
    if model is None:
        return model_unavailable_response()

    try:
        category, confidence, scores = run_model(model, data)
    except ValueError:
        return fail("The image could not be read. Please try another file.",
                    400)
    except Exception:  # noqa: BLE001
        log.exception("Prediction failed")
        return fail("The model could not process this image. Please try "
                    "again.", 500)

    now = datetime.now()
    payload = build_prediction_payload(category, confidence, scores, now)
    payload["image_name"] = name

    if not save:
        return jsonify(payload)

    lat, lng, loc_name, loc_ts = parse_location(request.form)
    source = "camera" if request.form.get("source") == "camera" else "upload"
    stored = f"{now.strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{ext}"
    try:
        (UPLOAD_DIR / stored).write_bytes(data)
        with db() as conn:
            cur = conn.execute(
                """INSERT INTO detections
                   (image_name, image_path, waste_type, confidence,
                    category_group, latitude, longitude, location,
                    location_timestamp, date, time, timestamp, source,
                    user_id)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (name, stored, category, confidence,
                 CATEGORY_INFO[category]["group"], lat, lng, loc_name,
                 loc_ts, payload["date"], payload["time"],
                 payload["timestamp"], source, g.user["id"]))
            payload["id"] = cur.lastrowid
    except Exception:  # noqa: BLE001
        log.exception("Could not save detection")
        return fail("The prediction worked but could not be saved to "
                    "history.", 500)

    payload.update({
        "image_url": f"/uploads/{stored}",
        "latitude": lat, "longitude": lng,
        "location": loc_name, "location_timestamp": loc_ts,
        "source": source,
    })
    return jsonify(payload)


@app.post("/api/predict")
@app.post("/predict")
@login_required
def api_predict():
    """Predict and save to history."""
    return _predict(save=True)


@app.post("/api/live-predict")
@app.post("/live-predict")
@login_required
def api_live_predict():
    """Predict a live camera frame without saving it to history."""
    return _predict(save=False)


@app.post("/api/predict-mixed")
@login_required
def api_predict_mixed():
    """Analyse a photo with many items and save the dominant type to history."""
    try:
        name, data, ext = read_valid_image(request)
    except ValueError as exc:
        return fail(str(exc), 400)

    model = get_model()
    if model is None:
        return model_unavailable_response()

    try:
        result = analyse_mixed(model, data)
    except ValueError as exc:
        return fail(str(exc), 400)
    except Exception:  # noqa: BLE001
        log.exception("Mixed analysis failed")
        return fail("The model could not process this image. Please try "
                    "again.", 500)

    now = datetime.now()
    payload = dict(result)
    payload.update({
        "mode": "mixed",
        "image_name": name,
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "date_display": now.strftime("%d %B %Y"),
        "time_display": now.strftime("%I:%M:%S %p"),
        "saved": False,
    })

    dominant = result["dominant"]
    if dominant is None:
        return jsonify(payload)

    info = CATEGORY_INFO[dominant]
    top = result["composition"][0]
    payload.update({"group": info["group"], "bin": info["bin"],
                    "recommendation": info["tip"]})

    lat, lng, loc_name, loc_ts = parse_location(request.form)
    stored = f"{now.strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{ext}"
    try:
        (UPLOAD_DIR / stored).write_bytes(data)
        with db() as conn:
            cur = conn.execute(
                """INSERT INTO detections
                   (image_name, image_path, waste_type, confidence,
                    category_group, latitude, longitude, location,
                    location_timestamp, date, time, timestamp, source,
                    user_id)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (f"{name} (mixed)", stored, dominant, top["avg_confidence"],
                 info["group"], lat, lng, loc_name, loc_ts,
                 payload["date"], payload["time"], payload["timestamp"],
                 "upload", g.user["id"]))
            payload["id"] = cur.lastrowid
    except Exception:  # noqa: BLE001
        log.exception("Could not save mixed detection")
        return fail("The analysis worked but could not be saved to "
                    "history.", 500)

    payload.update({
        "saved": True,
        "image_url": f"/uploads/{stored}",
        "latitude": lat, "longitude": lng,
        "location": loc_name, "location_timestamp": loc_ts,
    })
    return jsonify(payload)


@app.get("/api/history")
@app.get("/history/data")
@login_required
def api_history():
    q = (request.args.get("q") or "").strip().lower()
    wtype = (request.args.get("type") or "").strip()
    try:
        limit = max(1, min(int(request.args.get("limit", 1000)), 5000))
    except ValueError:
        limit = 1000

    sql = "SELECT * FROM detections"
    where, params = ["user_id = ?"], [g.user["id"]]
    if wtype in CLASS_NAMES:
        where.append("waste_type = ?")
        params.append(wtype)
    if q:
        where.append("(LOWER(image_name) LIKE ? OR LOWER(waste_type) LIKE ? "
                     "OR LOWER(COALESCE(location,'')) LIKE ? OR date LIKE ?)")
        params += [f"%{q}%"] * 4
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    with db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@app.delete("/api/history/<int:det_id>")
@app.delete("/history/<int:det_id>")
@login_required
def api_delete(det_id):
    with db() as conn:
        row = conn.execute(
            "SELECT image_path FROM detections WHERE id=? AND user_id=?",
            (det_id, g.user["id"])).fetchone()
        if row is None:
            return fail("That detection no longer exists.", 404)
        conn.execute("DELETE FROM detections WHERE id=? AND user_id=?",
                     (det_id, g.user["id"]))
    _remove_file(row["image_path"])
    return jsonify({"success": True})


@app.post("/api/history/clear")
@login_required
def api_clear():
    with db() as conn:
        files = [r["image_path"] for r in
                 conn.execute("SELECT image_path FROM detections "
                              "WHERE user_id=?", (g.user["id"],))]
        conn.execute("DELETE FROM detections WHERE user_id=?",
                     (g.user["id"],))
    for f in files:
        _remove_file(f)
    return jsonify({"success": True})


def _remove_file(name):
    try:
        p = (UPLOAD_DIR / name).resolve()
        if p.parent == UPLOAD_DIR.resolve() and p.exists():
            p.unlink()
    except OSError:
        log.warning("Could not remove %s", name)


@app.get("/api/analytics")
@app.get("/analytics/data")
@login_required
def api_analytics():
    with db() as conn:
        rows = conn.execute(
            "SELECT waste_type, confidence, date, time FROM detections "
            "WHERE user_id=?", (g.user["id"],)
        ).fetchall()

    total = len(rows)
    today = datetime.now().date()
    today_s = today.isoformat()
    counts = {n: 0 for n in CLASS_NAMES}
    conf_sum = {n: 0.0 for n in CLASS_NAMES}
    by_day, by_hour = {}, [0] * 24
    buckets = [0, 0, 0, 0]  # <50, 50-70, 70-90, 90-100

    for r in rows:
        t, c = r["waste_type"], r["confidence"]
        if t in counts:
            counts[t] += 1
            conf_sum[t] += c
        by_day[r["date"]] = by_day.get(r["date"], 0) + 1
        if r["date"] == today_s:
            by_hour[int(r["time"][:2])] += 1
        buckets[0 if c < 50 else 1 if c < 70 else 2 if c < 90 else 3] += 1

    def day_count(d):
        return by_day.get(d.isoformat(), 0)

    last7 = [today - timedelta(days=i) for i in range(6, -1, -1)]
    last30 = [today - timedelta(days=i) for i in range(29, -1, -1)]
    weeks = []
    for w in range(7, -1, -1):
        end = today - timedelta(days=7 * w)
        start = end - timedelta(days=6)
        n = sum(day_count(start + timedelta(days=i)) for i in range(7))
        weeks.append((start.strftime("%d %b"), n))
    months = []
    y, m = today.year, today.month
    for _ in range(6):
        months.append((y, m))
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    months.reverse()
    month_counts = []
    for y, m in months:
        prefix = f"{y:04d}-{m:02d}"
        month_counts.append((datetime(y, m, 1).strftime("%b %Y"),
                             sum(v for k, v in by_day.items()
                                 if k.startswith(prefix))))

    top = max(counts, key=counts.get) if total else None
    avg = round(sum(r["confidence"] for r in rows) / total, 1) if total else 0

    return jsonify({
        "total": total,
        "today": by_day.get(today_s, 0),
        "top_category": top,
        "avg_confidence": avg,
        "distribution": [
            {"name": n, "count": counts[n], "color": CATEGORY_INFO[n]["color"],
             "percent": round(counts[n] * 100 / total, 1) if total else 0}
            for n in CLASS_NAMES],
        "confidence_by_class": [
            {"name": n, "avg": round(conf_sum[n] / counts[n], 1)
             if counts[n] else 0} for n in CLASS_NAMES],
        "confidence_buckets": {"labels": ["Below 50%", "50-70%", "70-90%",
                                          "90-100%"], "values": buckets},
        "activity": {
            "today": {"labels": [f"{h:02d}:00" for h in range(24)],
                      "values": by_hour},
            "week": {"labels": [d.strftime("%a %d") for d in last7],
                     "values": [day_count(d) for d in last7]},
            "month": {"labels": [d.strftime("%d %b") for d in last30],
                      "values": [day_count(d) for d in last30]},
        },
        "weekly": {"labels": [w[0] for w in weeks],
                   "values": [w[1] for w in weeks]},
        "monthly": {"labels": [m[0] for m in month_counts],
                    "values": [m[1] for m in month_counts]},
    })


# --------------------------------------------------------------------------
# Sign up / sign in
# --------------------------------------------------------------------------
@app.get("/login")
def login_page():
    if current_user():
        return redirect("/")
    return render_template("auth.html", mode="login")


@app.get("/register")
def register_page():
    if current_user():
        return redirect("/")
    return render_template("auth.html", mode="register")


@app.post("/api/auth/register")
def api_register():
    d = request.get_json(silent=True) or {}
    name = (d.get("name") or "").strip()[:80]
    email = (d.get("email") or "").strip().lower()[:120]
    password = d.get("password") or ""
    if len(name) < 2:
        return fail("Please enter your name.", 400)
    if not EMAIL_RE.match(email):
        return fail("Please enter a valid email address.", 400)
    if len(password) < 6:
        return fail("Password must be at least 6 characters.", 400)
    try:
        with db() as conn:
            first_user = conn.execute(
                "SELECT COUNT(*) FROM users").fetchone()[0] == 0
            cur = conn.execute(
                "INSERT INTO users (name, email, password_hash, created_at) "
                "VALUES (?,?,?,?)",
                (name, email,
                 generate_password_hash(password, method="pbkdf2:sha256"),
                 datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            uid = cur.lastrowid
            if first_user:   # detections saved before login existed
                conn.execute("UPDATE detections SET user_id=? "
                             "WHERE user_id IS NULL", (uid,))
    except sqlite3.IntegrityError:
        return fail("An account with this email already exists. "
                    "Please sign in.", 409)
    _start_session(uid)
    return jsonify({"success": True})


@app.post("/api/auth/login")
def api_login():
    d = request.get_json(silent=True) or {}
    email = (d.get("email") or "").strip().lower()[:120]
    password = d.get("password") or ""
    key = f"{request.remote_addr}|{email}"
    if _too_many_failures(key):
        return fail("Too many failed attempts. Please wait 10 minutes and "
                    "try again.", 429)
    with db() as conn:
        row = conn.execute("SELECT id, password_hash FROM users WHERE email=?",
                           (email,)).fetchone()
    if row is None or not check_password_hash(row["password_hash"], password):
        _failed_logins.setdefault(key, []).append(time.time())
        return fail("Incorrect email or password.", 401)
    _failed_logins.pop(key, None)
    _start_session(row["id"])
    return jsonify({"success": True})


@app.post("/api/auth/logout")
def api_logout():
    session.clear()
    return jsonify({"success": True})


@app.get("/api/me")
@login_required
def api_me():
    return jsonify({"name": g.user["name"], "email": g.user["email"]})


# --------------------------------------------------------------------------
# Errors
# --------------------------------------------------------------------------
@app.errorhandler(413)
def too_large(_):
    return fail(f"Image is too large. Maximum size is {MAX_UPLOAD_MB} MB.",
                413)


@app.errorhandler(404)
def not_found(_):
    if request.path.startswith("/api/"):
        return fail("Not found.", 404)
    return render_template("dashboard.html", active="dashboard"), 404


@app.errorhandler(500)
def server_error(_):
    return fail("Something went wrong on the server. Please try again.", 500)


init_db()

if __name__ == "__main__":
    threading.Thread(target=get_model, daemon=True).start()  # warm up
    print("\n  Waste Detection AI is running -> http://127.0.0.1:5000\n")
    # Plain http on this laptop (camera and location work on 127.0.0.1).
    # Online (Hugging Face) the site runs through gunicorn with real https.
    app.run(debug=False, host="127.0.0.1", port=5000, threaded=True)