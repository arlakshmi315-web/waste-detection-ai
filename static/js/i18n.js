/* Kannada and Hindi language support for Waste Detection AI.
 *
 * Translates the text on every page inside the browser, so the HTML pages do
 * not need to change. English is the original text; the choice is remembered
 * in the browser (localStorage key "wd_lang"). Text that has no translation
 * stays in English.
 */
(function () {
  "use strict";
  if (window.WD_I18N) return;

  var STORE = "wd_lang";
  var LANGS = [["en", "English"], ["kn", "ಕನ್ನಡ"], ["hi", "हिन्दी"]];
  var IDX = { kn: 0, hi: 1 };            // position inside each [kn, hi] pair
  var LANG = "en";
  var everTranslated = false;
  var missing = {};

  /* English text : [Kannada, Hindi] */
  var D = {
    /* ---- app shell ---- */
    "Waste Detection": ["ಕಸ ಪತ್ತೆ", "कचरा पहचान"],
    "Waste Detection AI": ["ಕಸ ಪತ್ತೆ AI", "कचरा पहचान AI"],
    "AI Dashboard": ["AI ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "AI डैशबोर्ड"],
    "Dashboard": ["ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "डैशबोर्ड"],
    "Upload Image": ["ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", "छवि अपलोड करें"],
    "Live Detection": ["ಲೈವ್ ಪತ್ತೆ", "लाइव पहचान"],
    "Detection History": ["ಪತ್ತೆ ಇತಿಹಾಸ", "पहचान इतिहास"],
    "Waste Categories": ["ಕಸದ ವರ್ಗಗಳು", "कचरे की श्रेणियाँ"],
    "Analytics": ["ವಿಶ್ಲೇಷಣೆ", "विश्लेषण"],
    "Settings": ["ಸೆಟ್ಟಿಂಗ್‌ಗಳು", "सेटिंग्स"],
    "Sign out": ["ಸೈನ್ ಔಟ್", "साइन आउट"],
    "Model ready": ["ಮಾದರಿ ಸಿದ್ಧವಾಗಿದೆ", "मॉडल तैयार है"],
    "Model failed to load": ["ಮಾದರಿ ಲೋಡ್ ಆಗಲಿಲ್ಲ", "मॉडल लोड नहीं हो सका"],
    "Model not found": ["ಮಾದರಿ ಸಿಗಲಿಲ್ಲ", "मॉडल नहीं मिला"],
    "Server unreachable": ["ಸರ್ವರ್ ತಲುಪಲಾಗುತ್ತಿಲ್ಲ", "सर्वर तक नहीं पहुँच सके"],
    "Locating…": ["ಸ್ಥಳ ಹುಡುಕಲಾಗುತ್ತಿದೆ…", "स्थान खोजा जा रहा है…"],
    "Location unavailable": ["ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ", "स्थान उपलब्ध नहीं"],
    "Location off": ["ಸ್ಥಳ ಆಫ್ ಆಗಿದೆ", "स्थान बंद है"],
    "Enable location": ["ಸ್ಥಳವನ್ನು ಆನ್ ಮಾಡಿ", "स्थान चालू करें"],
    "Please sign in to continue.": ["ಮುಂದುವರಿಸಲು ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.", "आगे बढ़ने के लिए कृपया साइन इन करें।"],
    "Cannot reach the server. Make sure the app is still running.": ["ಸರ್ವರ್ ತಲುಪಲಾಗುತ್ತಿಲ್ಲ. ಆ್ಯಪ್ ಇನ್ನೂ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.", "सर्वर तक नहीं पहुँच सके। जाँचें कि ऐप अभी भी चल रहा है।"],

    /* ---- upload page ---- */
    "Upload waste image": ["ಕಸದ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", "कचरे की छवि अपलोड करें"],
    "Single item": ["ಒಂದು ವಸ್ತು", "एक वस्तु"],
    "Mixed waste": ["ಮಿಶ್ರ ಕಸ", "मिश्रित कचरा"],
    "Use a photo of one waste item. The result is one waste type.": ["ಒಂದು ಕಸದ ವಸ್ತುವಿನ ಫೋಟೋ ಬಳಸಿ. ಫಲಿತಾಂಶ ಒಂದು ಕಸದ ವಿಧವಾಗಿರುತ್ತದೆ.", "कचरे की एक वस्तु की फोटो लें। परिणाम एक कचरा प्रकार होगा।"],
    "Use a photo with many items. The photo is split into a grid and the share of each waste type is estimated.": ["ಹಲವು ವಸ್ತುಗಳಿರುವ ಫೋಟೋ ಬಳಸಿ. ಫೋಟೋವನ್ನು ಗ್ರಿಡ್‌ನಲ್ಲಿ ವಿಭಜಿಸಿ ಪ್ರತಿ ಕಸದ ವಿಧದ ಪಾಲನ್ನು ಅಂದಾಜಿಸಲಾಗುತ್ತದೆ.", "कई वस्तुओं वाली फोटो लें। फोटो को ग्रिड में बाँटा जाता है और हर कचरा प्रकार का हिस्सा अनुमानित किया जाता है।"],
    "Drag & drop image here": ["ಚಿತ್ರವನ್ನು ಇಲ್ಲಿಗೆ ಎಳೆದು ಬಿಡಿ", "छवि यहाँ खींचकर छोड़ें"],
    "or": ["ಅಥವಾ", "या"],
    "Choose image": ["ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ", "छवि चुनें"],
    "JPG, JPEG or PNG · up to 10 MB": ["JPG, JPEG ಅಥವಾ PNG · 10 MB ವರೆಗೆ", "JPG, JPEG या PNG · 10 MB तक"],
    "Remove": ["ತೆಗೆದುಹಾಕಿ", "हटाएँ"],
    "Detect waste": ["ಕಸ ಪತ್ತೆಹಚ್ಚಿ", "कचरा पहचानें"],
    "Detecting…": ["ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ…", "पहचान हो रही है…"],
    "Analysing image…": ["ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…", "छवि का विश्लेषण हो रहा है…"],
    "Result": ["ಫಲಿತಾಂಶ", "परिणाम"],
    "Select an image and click": ["ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು", "छवि चुनें और"],
    "to see the prediction.": ["ಒತ್ತಿ ಫಲಿತಾಂಶ ನೋಡಿ.", "पर क्लिक करके परिणाम देखें।"],
    "No image selected. Please choose an image first.": ["ಯಾವುದೇ ಚಿತ್ರ ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ. ಮೊದಲು ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.", "कोई छवि नहीं चुनी गई। पहले एक छवि चुनें।"],
    "Unsupported file. Please choose a JPG, JPEG or PNG image.": ["ಬೆಂಬಲಿಸದ ಫೈಲ್. JPG, JPEG ಅಥವಾ PNG ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.", "असमर्थित फ़ाइल। कृपया JPG, JPEG या PNG छवि चुनें।"],
    "Unsupported file type. Please upload a JPG, JPEG or PNG image.": ["ಬೆಂಬಲಿಸದ ಫೈಲ್ ಪ್ರಕಾರ. JPG, JPEG ಅಥವಾ PNG ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.", "असमर्थित फ़ाइल प्रकार। कृपया JPG, JPEG या PNG छवि अपलोड करें।"],
    "The file is not a valid JPG or PNG image.": ["ಈ ಫೈಲ್ ಮಾನ್ಯವಾದ JPG ಅಥವಾ PNG ಚಿತ್ರವಲ್ಲ.", "यह फ़ाइल मान्य JPG या PNG छवि नहीं है।"],
    "The selected file is empty.": ["ಆಯ್ಕೆ ಮಾಡಿದ ಫೈಲ್ ಖಾಲಿಯಾಗಿದೆ.", "चुनी गई फ़ाइल खाली है।"],
    "Image is too large. Maximum size is 10 MB.": ["ಚಿತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. ಗರಿಷ್ಠ ಗಾತ್ರ 10 MB.", "छवि बहुत बड़ी है। अधिकतम आकार 10 MB है।"],
    "The model could not process this image. Please try again.": ["ಮಾದರಿ ಈ ಚಿತ್ರವನ್ನು ಸಂಸ್ಕರಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "मॉडल इस छवि को प्रोसेस नहीं कर सका। कृपया फिर कोशिश करें।"],
    "Location unavailable. Detection saved without location.": ["ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳವಿಲ್ಲದೆ ಪತ್ತೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ.", "स्थान उपलब्ध नहीं। पहचान बिना स्थान के सहेजी गई।"],
    "Location is turned off in Settings.": ["ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಸ್ಥಳ ಆಫ್ ಮಾಡಲಾಗಿದೆ.", "सेटिंग्स में स्थान बंद है।"],
    "Location permission was denied. You can still detect waste without it.": ["ಸ್ಥಳದ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಅದಿಲ್ಲದೆಯೂ ನೀವು ಕಸ ಪತ್ತೆಹಚ್ಚಬಹುದು.", "स्थान की अनुमति अस्वीकार की गई। इसके बिना भी आप कचरा पहचान सकते हैं।"],
    "Location is unavailable on this device.": ["ಈ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ.", "इस डिवाइस पर स्थान उपलब्ध नहीं है।"],

    /* ---- result card ---- */
    "WASTE DETECTED": ["ಪತ್ತೆಯಾದ ಕಸ", "पहचाना गया कचरा"],
    "Confidence": ["ವಿಶ್ವಾಸ ಮಟ್ಟ", "विश्वास स्तर"],
    "Category": ["ವರ್ಗ", "श्रेणी"],
    "Suggested bin": ["ಸೂಚಿಸಿದ ತೊಟ್ಟಿ", "सुझाया गया डिब्बा"],
    "Recommended action": ["ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ", "सुझाई गई कार्रवाई"],
    "Detection time": ["ಪತ್ತೆ ಸಮಯ", "पहचान का समय"],
    "Detection date": ["ಪತ್ತೆ ದಿನಾಂಕ", "पहचान की तारीख"],
    "Location": ["ಸ್ಥಳ", "स्थान"],
    "View history": ["ಇತಿಹಾಸ ನೋಡಿ", "इतिहास देखें"],
    "Low confidence. Try a clearer photo with a plain background.": ["ಕಡಿಮೆ ವಿಶ್ವಾಸ. ಸರಳ ಹಿನ್ನೆಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ.", "कम विश्वास। साफ़ पृष्ठभूमि वाली स्पष्ट फोटो आज़माएँ।"],

    /* ---- mixed waste result ---- */
    "MOST COMMON WASTE": ["ಅತ್ಯಂತ ಹೆಚ್ಚಿನ ಕಸ", "सबसे ज़्यादा कचरा"],
    "WASTE COMPOSITION": ["ಕಸದ ಸಂಯೋಜನೆ", "कचरे की संरचना"],
    "WHAT THE MODEL SAW": ["ಮಾದರಿ ಏನನ್ನು ಕಂಡಿತು", "मॉडल ने क्या देखा"],
    "Uncertain": ["ಅನಿಶ್ಚಿತ", "अनिश्चित"],
    "TIME": ["ಸಮಯ", "समय"],
    "DATE": ["ದಿನಾಂಕ", "तारीख"],
    "LOCATION": ["ಸ್ಥಳ", "स्थान"],
    "The waste could not be identified clearly. Try a closer, clearer photo.": ["ಕಸವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ಹತ್ತಿರದ, ಸ್ಪಷ್ಟವಾದ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ.", "कचरे की स्पष्ट पहचान नहीं हो सकी। पास से ली गई, साफ़ फोटो आज़माएँ।"],

    /* ---- live detection ---- */
    "Camera": ["ಕ್ಯಾಮೆರಾ", "कैमरा"],
    "Camera off": ["ಕ್ಯಾಮೆರಾ ಆಫ್", "कैमरा बंद"],
    "Camera is off": ["ಕ್ಯಾಮೆರಾ ಆಫ್ ಆಗಿದೆ", "कैमरा बंद है"],
    "Start camera": ["ಕ್ಯಾಮೆರಾ ಆನ್ ಮಾಡಿ", "कैमरा चालू करें"],
    "Start detection": ["ಪತ್ತೆ ಪ್ರಾರಂಭಿಸಿ", "पहचान शुरू करें"],
    "Capture & predict": ["ಸೆರೆಹಿಡಿದು ಪತ್ತೆಹಚ್ಚಿ", "कैप्चर करें और पहचानें"],
    "Stop camera": ["ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ", "कैमरा बंद करें"],
    "Prediction": ["ಪತ್ತೆ ಫಲಿತಾಂಶ", "पहचान परिणाम"],
    "Start detection analyses a frame every few seconds without saving. Capture & predict saves the frame, location and time to your history.": ["ಪತ್ತೆ ಪ್ರಾರಂಭಿಸಿ ಒತ್ತಿದರೆ ಪ್ರತಿ ಕೆಲವು ಸೆಕೆಂಡುಗಳಿಗೆ ಒಂದು ಫ್ರೇಮ್ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ, ಉಳಿಸಲಾಗುವುದಿಲ್ಲ. ಸೆರೆಹಿಡಿದು ಪತ್ತೆಹಚ್ಚಿ ಒತ್ತಿದರೆ ಫ್ರೇಮ್, ಸ್ಥಳ ಮತ್ತು ಸಮಯ ನಿಮ್ಮ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲಾಗುತ್ತದೆ.", "पहचान शुरू करने पर हर कुछ सेकंड में एक फ्रेम का विश्लेषण होता है, सहेजा नहीं जाता। कैप्चर करें और पहचानें दबाने पर फ्रेम, स्थान और समय आपके इतिहास में सहेजे जाते हैं।"],

    /* ---- waste types, groups, bins ---- */
    "Plastic": ["ಪ್ಲಾಸ್ಟಿಕ್", "प्लास्टिक"],
    "Paper": ["ಕಾಗದ", "कागज़"],
    "Glass": ["ಗಾಜು", "काँच"],
    "Metal": ["ಲೋಹ", "धातु"],
    "Organic": ["ಸಾವಯವ", "जैविक"],
    "Recyclable": ["ಮರುಬಳಕೆ ಮಾಡಬಹುದಾದ", "रीसाइकिल योग्य"],
    "Biodegradable": ["ಜೈವಿಕವಾಗಿ ವಿಘಟನೀಯ", "जैव-अपघटनीय"],
    "Plastic Bin": ["ಪ್ಲಾಸ್ಟಿಕ್ ತೊಟ್ಟಿ", "प्लास्टिक डिब्बा"],
    "Paper Bin": ["ಕಾಗದದ ತೊಟ್ಟಿ", "कागज़ डिब्बा"],
    "Glass Bin": ["ಗಾಜಿನ ತೊಟ್ಟಿ", "काँच डिब्बा"],
    "Metal Bin": ["ಲೋಹದ ತೊಟ್ಟಿ", "धातु डिब्बा"],
    "Organic Bin": ["ಸಾವಯವ ತೊಟ್ಟಿ", "जैविक डिब्बा"],

    /* ---- waste category details ---- */
    "Synthetic polymer items such as bottles, containers and packaging.": ["ಬಾಟಲಿ, ಡಬ್ಬಿ ಮತ್ತು ಪ್ಯಾಕೇಜಿಂಗ್‌ನಂತಹ ಕೃತಕ ಪಾಲಿಮರ್ (ಪ್ಲಾಸ್ಟಿಕ್) ವಸ್ತುಗಳು.", "बोतल, डिब्बे और पैकेजिंग जैसी कृत्रिम बहुलक (प्लास्टिक) की वस्तुएँ।"],
    "Water bottles": ["ನೀರಿನ ಬಾಟಲಿಗಳು", "पानी की बोतलें"],
    "Food containers": ["ಆಹಾರದ ಡಬ್ಬಿಗಳು", "खाने के डिब्बे"],
    "Shampoo bottles": ["ಶಾಂಪೂ ಬಾಟಲಿಗಳು", "शैम्पू की बोतलें"],
    "Plastic bags": ["ಪ್ಲಾಸ್ಟಿಕ್ ಚೀಲಗಳು", "प्लास्टिक की थैलियाँ"],
    "Send to plastic recycling. Clean and dry the item before placing it in the plastic recycling bin.": ["ಪ್ಲಾಸ್ಟಿಕ್ ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ವಸ್ತುವನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ, ಒಣಗಿಸಿ ನಂತರ ಪ್ಲಾಸ್ಟಿಕ್ ಮರುಬಳಕೆ ತೊಟ್ಟಿಯಲ್ಲಿ ಹಾಕಿ.", "प्लास्टिक रीसाइक्लिंग में भेजें। वस्तु को साफ़ और सुखाकर प्लास्टिक रीसाइक्लिंग डिब्बे में डालें।"],
    "Rinse containers, remove caps and labels where possible and keep plastics separate from food waste.": ["ಡಬ್ಬಿಗಳನ್ನು ತೊಳೆಯಿರಿ, ಸಾಧ್ಯವಾದಲ್ಲಿ ಮುಚ್ಚಳ ಮತ್ತು ಲೇಬಲ್ ತೆಗೆಯಿರಿ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್ ಅನ್ನು ಆಹಾರ ತ್ಯಾಜ್ಯದಿಂದ ಬೇರೆ ಇಡಿ.", "डिब्बों को धो लें, जहाँ संभव हो ढक्कन और लेबल हटा दें, और प्लास्टिक को खाने के कचरे से अलग रखें।"],

    "Fibre-based items including paper sheets, newspapers and cardboard packaging.": ["ಕಾಗದದ ಹಾಳೆಗಳು, ಪತ್ರಿಕೆಗಳು ಮತ್ತು ರಟ್ಟಿನ ಪ್ಯಾಕೇಜಿಂಗ್‌ನಂತಹ ನಾರಿನ ವಸ್ತುಗಳು.", "कागज़ की शीट, अख़बार और गत्ते की पैकेजिंग जैसी रेशे से बनी वस्तुएँ।"],
    "Newspapers": ["ಪತ್ರಿಕೆಗಳು", "अख़बार"],
    "Office paper": ["ಕಚೇರಿ ಕಾಗದ", "ऑफ़िस का कागज़"],
    "Cardboard boxes": ["ರಟ್ಟಿನ ಪೆಟ್ಟಿಗೆಗಳು", "गत्ते के डिब्बे"],
    "Magazines": ["ನಿಯತಕಾಲಿಕೆಗಳು", "पत्रिकाएँ"],
    "Send to paper recycling. Keep paper clean and dry and flatten boxes where possible.": ["ಕಾಗದ ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ಕಾಗದವನ್ನು ಸ್ವಚ್ಛ ಮತ್ತು ಒಣಗಿಡಿ, ಸಾಧ್ಯವಾದಲ್ಲಿ ಪೆಟ್ಟಿಗೆಗಳನ್ನು ಚಪ್ಪಟೆ ಮಾಡಿ.", "कागज़ रीसाइक्लिंग में भेजें। कागज़ को साफ़ और सूखा रखें और जहाँ संभव हो डिब्बों को चपटा कर दें।"],
    "Wet, greasy or heavily soiled paper cannot be recycled and should go to the organic stream instead.": ["ಒದ್ದೆಯಾದ, ಎಣ್ಣೆಯ ಅಥವಾ ತುಂಬಾ ಕೊಳಕಾದ ಕಾಗದವನ್ನು ಮರುಬಳಕೆ ಮಾಡಲಾಗದು; ಅದನ್ನು ಸಾವಯವ ಕಸದಲ್ಲಿ ಹಾಕಿ.", "गीला, चिकना या बहुत गंदा कागज़ रीसाइकिल नहीं हो सकता; उसे जैविक कचरे में डालें।"],

    "Rigid, brittle containers made of glass that can be recycled repeatedly.": ["ಗಾಜಿನಿಂದ ಮಾಡಿದ ಗಟ್ಟಿಯಾದ, ಸುಲಭವಾಗಿ ಒಡೆಯುವ ಪಾತ್ರೆಗಳು; ಇವುಗಳನ್ನು ಮತ್ತೆ ಮತ್ತೆ ಮರುಬಳಕೆ ಮಾಡಬಹುದು.", "काँच से बने कठोर, भंगुर बर्तन जिन्हें बार-बार रीसाइकिल किया जा सकता है।"],
    "Bottles": ["ಬಾಟಲಿಗಳು", "बोतलें"],
    "Jars": ["ಜಾಡಿಗಳು", "मर्तबान"],
    "Drinking glasses": ["ಕುಡಿಯುವ ಲೋಟಗಳು", "पानी के गिलास"],
    "Glass containers": ["ಗಾಜಿನ ಪಾತ್ರೆಗಳು", "काँच के बर्तन"],
    "Send to glass recycling. Separate glass from other waste and handle broken glass carefully.": ["ಗಾಜು ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ಗಾಜನ್ನು ಇತರ ಕಸದಿಂದ ಬೇರ್ಪಡಿಸಿ ಮತ್ತು ಒಡೆದ ಗಾಜನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಿ.", "काँच रीसाइक्लिंग में भेजें। काँच को दूसरे कचरे से अलग रखें और टूटे काँच को सावधानी से संभालें।"],
    "Rinse containers and wrap broken pieces in paper before disposal to protect waste handlers.": ["ಪಾತ್ರೆಗಳನ್ನು ತೊಳೆಯಿರಿ ಮತ್ತು ಕಸ ನಿರ್ವಹಿಸುವವರ ರಕ್ಷಣೆಗಾಗಿ ಒಡೆದ ತುಂಡುಗಳನ್ನು ಕಾಗದದಲ್ಲಿ ಸುತ್ತಿ ಹಾಕಿ.", "बर्तनों को धो लें और कचरा उठाने वालों की सुरक्षा के लिए टूटे टुकड़ों को कागज़ में लपेटकर फेंकें।"],

    "Aluminium, steel and other metal items that are highly recyclable.": ["ಅಲ್ಯೂಮಿನಿಯಂ, ಉಕ್ಕು ಮತ್ತು ಇತರ ಲೋಹದ ವಸ್ತುಗಳು; ಇವುಗಳನ್ನು ಹೆಚ್ಚಾಗಿ ಮರುಬಳಕೆ ಮಾಡಬಹುದು.", "एल्युमिनियम, स्टील और अन्य धातु की वस्तुएँ जिन्हें आसानी से रीसाइकिल किया जा सकता है।"],
    "Soft drink cans": ["ತಂಪು ಪಾನೀಯದ ಕ್ಯಾನ್‌ಗಳು", "कोल्ड ड्रिंक के कैन"],
    "Food tins": ["ಆಹಾರದ ಟಿನ್‌ಗಳು", "खाने के टिन"],
    "Foil trays": ["ಫಾಯಿಲ್ ಟ್ರೇಗಳು", "फ़ॉइल की ट्रे"],
    "Metal lids": ["ಲೋಹದ ಮುಚ್ಚಳಗಳು", "धातु के ढक्कन"],
    "Send to metal recycling. Empty and rinse metal containers before recycling when appropriate.": ["ಲೋಹ ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ಸೂಕ್ತವಾದಲ್ಲಿ ಲೋಹದ ಪಾತ್ರೆಗಳನ್ನು ಖಾಲಿ ಮಾಡಿ ತೊಳೆಯಿರಿ.", "धातु रीसाइक्लिंग में भेजें। जहाँ उचित हो, धातु के डिब्बों को खाली करके धो लें।"],
    "Crush cans to save space and keep metals free of food residue.": ["ಜಾಗ ಉಳಿಸಲು ಕ್ಯಾನ್‌ಗಳನ್ನು ಜಜ್ಜಿ, ಲೋಹದ ಮೇಲೆ ಆಹಾರದ ಅವಶೇಷ ಇರದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.", "जगह बचाने के लिए कैन को पिचका दें और धातु पर खाना न लगा रहने दें।"],

    "Biodegradable waste from plants and food that can be composted.": ["ಸಸ್ಯಗಳು ಮತ್ತು ಆಹಾರದಿಂದ ಬರುವ ಜೈವಿಕವಾಗಿ ವಿಘಟನೀಯ ಕಸ; ಇದರಿಂದ ಗೊಬ್ಬರ ಮಾಡಬಹುದು.", "पौधों और खाने से निकला जैविक कचरा जिससे खाद बनाई जा सकती है।"],
    "Food scraps": ["ಉಳಿದ ಆಹಾರ", "बचा हुआ खाना"],
    "Fruit and vegetable peels": ["ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿ ಸಿಪ್ಪೆಗಳು", "फल और सब्ज़ियों के छिलके"],
    "Garden waste": ["ತೋಟದ ಕಸ", "बगीचे का कचरा"],
    "Leaves": ["ಎಲೆಗಳು", "पत्ते"],
    "Send to composting. Put food and other biodegradable waste into the organic-waste stream.": ["ಗೊಬ್ಬರ ತಯಾರಿಕೆಗೆ ಕಳುಹಿಸಿ. ಆಹಾರ ಮತ್ತು ಇತರ ಜೈವಿಕ ಕಸವನ್ನು ಸಾವಯವ ಕಸದ ತೊಟ್ಟಿಗೆ ಹಾಕಿ.", "खाद बनाने के लिए भेजें। खाने और अन्य जैविक कचरे को जैविक कचरे के डिब्बे में डालें।"],
    "Compost at home or use the municipal wet-waste collection. Avoid mixing with plastics.": ["ಮನೆಯಲ್ಲಿ ಗೊಬ್ಬರ ಮಾಡಿ ಅಥವಾ ನಗರಸಭೆಯ ಹಸಿ ಕಸ ಸಂಗ್ರಹಣೆಯನ್ನು ಬಳಸಿ. ಪ್ಲಾಸ್ಟಿಕ್‌ನೊಂದಿಗೆ ಬೆರೆಸಬೇಡಿ.", "घर पर खाद बनाएँ या नगरपालिका के गीले कचरे के संग्रह का उपयोग करें। प्लास्टिक के साथ न मिलाएँ।"],

    /* ---- sign in / create account / reset password ---- */
    "Welcome back": ["ಮರಳಿ ಸ್ವಾಗತ", "वापसी पर स्वागत है"],
    "Create your account": ["ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ", "अपना खाता बनाएँ"],
    "Reset your password": ["ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ", "अपना पासवर्ड रीसेट करें"],
    "Sign in to Waste Detection AI.": ["ಕಸ ಪತ್ತೆ AI ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.", "कचरा पहचान AI में साइन इन करें।"],
    "Sign up to start detecting and tracking waste.": ["ಕಸವನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸೈನ್ ಅಪ್ ಮಾಡಿ.", "कचरा पहचानना और ट्रैक करना शुरू करने के लिए साइन अप करें।"],
    "Enter your email, answer your security question, and choose a new password.": ["ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ, ಭದ್ರತಾ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಿ ಮತ್ತು ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಆರಿಸಿ.", "अपना ईमेल दर्ज करें, सुरक्षा प्रश्न का उत्तर दें और नया पासवर्ड चुनें।"],
    "Full name": ["ಪೂರ್ಣ ಹೆಸರು", "पूरा नाम"],
    "Email": ["ಇಮೇಲ್", "ईमेल"],
    "Password": ["ಪಾಸ್‌ವರ್ಡ್", "पासवर्ड"],
    "Confirm password": ["ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ", "पासवर्ड की पुष्टि करें"],
    "Security question": ["ಭದ್ರತಾ ಪ್ರಶ್ನೆ", "सुरक्षा प्रश्न"],
    "Answer to your question": ["ನಿಮ್ಮ ಪ್ರಶ್ನೆಯ ಉತ್ತರ", "आपके प्रश्न का उत्तर"],
    "You will need this answer if you forget your password. Choose something only you know.": ["ಪಾಸ್‌ವರ್ಡ್ ಮರೆತರೆ ಈ ಉತ್ತರ ಬೇಕಾಗುತ್ತದೆ. ನಿಮಗೆ ಮಾತ್ರ ತಿಳಿದಿರುವುದನ್ನು ಆರಿಸಿ.", "पासवर्ड भूल जाने पर आपको यह उत्तर चाहिए होगा। ऐसा उत्तर चुनें जो सिर्फ़ आप जानते हों।"],
    "Pick one or write your own": ["ಒಂದನ್ನು ಆರಿಸಿ ಅಥವಾ ನಿಮ್ಮದೇ ಬರೆಯಿರಿ", "एक चुनें या अपना लिखें"],
    "Sign in": ["ಸೈನ್ ಇನ್", "साइन इन"],
    "Create account": ["ಖಾತೆ ರಚಿಸಿ", "खाता बनाएँ"],
    "New here?": ["ಹೊಸಬರೇ?", "नए हैं?"],
    "Create an account": ["ಖಾತೆಯನ್ನು ರಚಿಸಿ", "नया खाता बनाएँ"],
    "Already have an account?": ["ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?", "पहले से खाता है?"],
    "Forgot password?": ["ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?", "पासवर्ड भूल गए?"],
    "Show": ["ತೋರಿಸಿ", "दिखाएँ"],
    "Show password": ["ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ", "पासवर्ड दिखाएँ"],
    "Hide": ["ಮರೆಮಾಡಿ", "छिपाएँ"],
    "Continue": ["ಮುಂದುವರಿಸಿ", "जारी रखें"],
    "Your security question": ["ನಿಮ್ಮ ಭದ್ರತಾ ಪ್ರಶ್ನೆ", "आपका सुरक्षा प्रश्न"],
    "Your answer": ["ನಿಮ್ಮ ಉತ್ತರ", "आपका उत्तर"],
    "Capital letters and extra spaces do not matter.": ["ದೊಡ್ಡ ಅಕ್ಷರಗಳು ಮತ್ತು ಹೆಚ್ಚುವರಿ ಖಾಲಿ ಜಾಗಗಳು ಮುಖ್ಯವಲ್ಲ.", "बड़े अक्षर और अतिरिक्त स्पेस मायने नहीं रखते।"],
    "New password": ["ಹೊಸ ಪಾಸ್‌ವರ್ಡ್", "नया पासवर्ड"],
    "Confirm new password": ["ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ", "नए पासवर्ड की पुष्टि करें"],
    "Reset password": ["ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ", "पासवर्ड रीसेट करें"],
    "Back to sign in": ["ಸೈನ್ ಇನ್‌ಗೆ ಹಿಂತಿರುಗಿ", "साइन इन पर वापस जाएँ"],
    "Signing in…": ["ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ…", "साइन इन हो रहा है…"],
    "Creating account…": ["ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ…", "खाता बन रहा है…"],
    "Checking…": ["ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…", "जाँच हो रही है…"],
    "Resetting…": ["ಮರುಹೊಂದಿಸಲಾಗುತ್ತಿದೆ…", "रीसेट हो रहा है…"],
    "Your password was changed. Please sign in with the new password.": ["ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಹೊಸ ಪಾಸ್‌ವರ್ಡ್‌ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.", "आपका पासवर्ड बदल दिया गया है। कृपया नए पासवर्ड से साइन इन करें।"],

    /* ---- sign-in messages ---- */
    "Please enter your name.": ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.", "कृपया अपना नाम दर्ज करें।"],
    "Please enter a valid email address.": ["ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.", "कृपया सही ईमेल पता दर्ज करें।"],
    "Please enter your email.": ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ.", "कृपया अपना ईमेल दर्ज करें।"],
    "Please enter your answer.": ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರ ನಮೂದಿಸಿ.", "कृपया अपना उत्तर दर्ज करें।"],
    "Please enter your email and password.": ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.", "कृपया अपना ईमेल और पासवर्ड दर्ज करें।"],
    "Password must be at least 6 characters.": ["ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು.", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"],
    "New password must be at least 6 characters.": ["ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು.", "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"],
    "The two passwords do not match.": ["ಎರಡು ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.", "दोनों पासवर्ड मेल नहीं खाते।"],
    "Please choose or write a security question.": ["ದಯವಿಟ್ಟು ಭದ್ರತಾ ಪ್ರಶ್ನೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ಬರೆಯಿರಿ.", "कृपया सुरक्षा प्रश्न चुनें या लिखें।"],
    "Please enter the answer to your security question.": ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭದ್ರತಾ ಪ್ರಶ್ನೆಯ ಉತ್ತರ ನಮೂದಿಸಿ.", "कृपया अपने सुरक्षा प्रश्न का उत्तर दर्ज करें।"],
    "An account with this email already exists. Please sign in.": ["ಈ ಇಮೇಲ್‌ನ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ. ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.", "इस ईमेल से खाता पहले से मौजूद है। कृपया साइन इन करें।"],
    "No account found with this email. Please create an account.": ["ಈ ಇಮೇಲ್‌ನ ಖಾತೆ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಖಾತೆ ರಚಿಸಿ.", "इस ईमेल से कोई खाता नहीं मिला। कृपया खाता बनाएँ।"],
    "Wrong password. Try again, or use \"Forgot password\".": ["ತಪ್ಪು ಪಾಸ್‌ವರ್ಡ್. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ \"ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?\" ಬಳಸಿ.", "गलत पासवर्ड। फिर कोशिश करें या \"पासवर्ड भूल गए?\" का उपयोग करें।"],
    "Too many failed attempts. Please wait 10 minutes and try again.": ["ತುಂಬಾ ವಿಫಲ ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು 10 ನಿಮಿಷ ಕಾಯಿದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "बहुत सारे असफल प्रयास। कृपया 10 मिनट रुककर फिर कोशिश करें।"],
    "Too many attempts. Please wait 10 minutes and try again.": ["ತುಂಬಾ ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು 10 ನಿಮಿಷ ಕಾಯಿದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "बहुत सारे प्रयास। कृपया 10 मिनट रुककर फिर कोशिश करें।"],
    "The email or the answer is not correct.": ["ಇಮೇಲ್ ಅಥವಾ ಉತ್ತರ ಸರಿಯಾಗಿಲ್ಲ.", "ईमेल या उत्तर सही नहीं है।"],
    "Something went wrong. Please try again.": ["ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "कुछ गलत हो गया। कृपया फिर कोशिश करें।"],
    "Cannot reach the server. Please try again.": ["ಸರ್ವರ್ ತಲುಪಲಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "सर्वर तक नहीं पहुँच सके। कृपया फिर कोशिश करें।"],
    "Cannot reach the server. Make sure the app is running.": ["ಸರ್ವರ್ ತಲುಪಲಾಗುತ್ತಿಲ್ಲ. ಆ್ಯಪ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.", "सर्वर तक नहीं पहुँच सके। जाँचें कि ऐप चल रहा है।"],

    /* ---- messages from the server ---- */
    "Not found.": ["ಸಿಗಲಿಲ್ಲ.", "नहीं मिला।"],
    "Something went wrong on the server. Please try again.": ["ಸರ್ವರ್‌ನಲ್ಲಿ ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "सर्वर पर कुछ गलत हो गया। कृपया फिर कोशिश करें।"],
    "That detection no longer exists.": ["ಆ ಪತ್ತೆ ಇನ್ನು ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ.", "वह पहचान अब मौजूद नहीं है।"],
    "The analysis worked but could not be saved to history.": ["ವಿಶ್ಲೇಷಣೆ ಯಶಸ್ವಿಯಾಯಿತು ಆದರೆ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲಾಗಲಿಲ್ಲ.", "विश्लेषण सफल रहा लेकिन इतिहास में सहेजा नहीं जा सका।"],
    "The prediction worked but could not be saved to history.": ["ಪತ್ತೆ ಯಶಸ್ವಿಯಾಯಿತು ಆದರೆ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲಾಗಲಿಲ್ಲ.", "पहचान सफल रही लेकिन इतिहास में सहेजी नहीं जा सकी।"],
    "The image could not be read. Please try another file.": ["ಚಿತ್ರವನ್ನು ಓದಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಫೈಲ್ ಪ್ರಯತ್ನಿಸಿ.", "छवि पढ़ी नहीं जा सकी। कृपया कोई दूसरी फ़ाइल आज़माएँ।"],
    "The trained model could not be loaded. Please check the model file and your TensorFlow installation.": ["ತರಬೇತಿ ಪಡೆದ ಮಾದರಿ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮಾದರಿ ಫೈಲ್ ಮತ್ತು TensorFlow ಸ್ಥಾಪನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.", "प्रशिक्षित मॉडल लोड नहीं हो सका। कृपया मॉडल फ़ाइल और अपना TensorFlow इंस्टॉलेशन जाँचें।"],
    "Trained model not found. Train the model first by running 'python train_model.py', then restart the app.": ["ತರಬೇತಿ ಪಡೆದ ಮಾದರಿ ಸಿಗಲಿಲ್ಲ. ಮೊದಲು 'python train_model.py' ಚಲಾಯಿಸಿ ಮಾದರಿಯನ್ನು ತರಬೇತಿಗೊಳಿಸಿ, ನಂತರ ಆ್ಯಪ್ ಮರುಪ್ರಾರಂಭಿಸಿ.", "प्रशिक्षित मॉडल नहीं मिला। पहले 'python train_model.py' चलाकर मॉडल को प्रशिक्षित करें, फिर ऐप दोबारा शुरू करें।"],

    /* ---- app shell extras ---- */
    "Checking model…": ["ಮಾದರಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…", "मॉडल की जाँच हो रही है…"],
    "Open menu": ["ಮೆನು ತೆರೆಯಿರಿ", "मेनू खोलें"],
    "Detection location": ["ಪತ್ತೆ ಸ್ಥಳ", "पहचान का स्थान"],
    "Close": ["ಮುಚ್ಚಿ", "बंद करें"],
    "View": ["ನೋಡಿ", "देखें"],
    "Delete": ["ಅಳಿಸಿ", "हटाएँ"],
    "Cancel": ["ರದ್ದುಮಾಡಿ", "रद्द करें"],
    "Trained model not found.": ["ತರಬೇತಿ ಪಡೆದ ಮಾದರಿ ಸಿಗಲಿಲ್ಲ.", "प्रशिक्षित मॉडल नहीं मिला।"],
    "Train the model with": ["ಮಾದರಿಯನ್ನು ಇದರೊಂದಿಗೆ ತರಬೇತಿಗೊಳಿಸಿ", "मॉडल को इससे प्रशिक्षित करें"],
    "and restart the app to enable detection.": ["ಮತ್ತು ಪತ್ತೆ ಸಕ್ರಿಯಗೊಳಿಸಲು ಆ್ಯಪ್ ಮರುಪ್ರಾರಂಭಿಸಿ.", "और पहचान चालू करने के लिए ऐप दोबारा शुरू करें।"],
    "and restart the app.": ["ಮತ್ತು ಆ್ಯಪ್ ಮರುಪ್ರಾರಂಭಿಸಿ.", "और ऐप दोबारा शुरू करें।"],

    /* ---- dashboard ---- */
    "AI waste intelligence": ["AI ಕಸ ಬುದ್ಧಿಮತ್ತೆ", "AI कचरा इंटेलिजेंस"],
    "Welcome back to your waste operations dashboard.": ["ನಿಮ್ಮ ಕಸ ನಿರ್ವಹಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮರಳಿ ಸ್ವಾಗತ.", "आपके कचरा प्रबंधन डैशबोर्ड में वापसी पर स्वागत है।"],
    "Track disposal patterns, review recent detections, and keep your recycling workflow moving with live AI insights.": ["ವಿಲೇವಾರಿ ಮಾದರಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಇತ್ತೀಚಿನ ಪತ್ತೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲೈವ್ AI ಒಳನೋಟಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಮರುಬಳಕೆ ಕೆಲಸವನ್ನು ಮುಂದುವರಿಸಿ.", "निपटान के पैटर्न ट्रैक करें, हाल की पहचानें देखें और लाइव AI जानकारी के साथ अपना रीसाइक्लिंग कार्य आगे बढ़ाएँ।"],
    "Upload image": ["ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", "छवि अपलोड करें"],
    "View analytics": ["ವಿಶ್ಲೇಷಣೆ ನೋಡಿ", "विश्लेषण देखें"],
    "Smart detections": ["ಸ್ಮಾರ್ಟ್ ಪತ್ತೆಗಳು", "स्मार्ट पहचानें"],
    "Live": ["ಲೈವ್", "लाइव"],
    "Today": ["ಇಂದು", "आज"],
    "Updated": ["ನವೀಕರಿಸಲಾಗಿದೆ", "अपडेट किया गया"],
    "Top category": ["ಅಗ್ರ ವರ್ಗ", "शीर्ष श्रेणी"],
    "AI-led": ["AI ಚಾಲಿತ", "AI-संचालित"],
    "Total detections": ["ಒಟ್ಟು ಪತ್ತೆಗಳು", "कुल पहचानें"],
    "Avg. confidence": ["ಸರಾಸರಿ ವಿಶ್ವಾಸ", "औसत विश्वास"],
    "Waste distribution": ["ಕಸದ ಹಂಚಿಕೆ", "कचरे का वितरण"],
    "No detection data available yet.": ["ಇನ್ನೂ ಯಾವುದೇ ಪತ್ತೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.", "अभी कोई पहचान डेटा उपलब्ध नहीं है।"],
    "Detection activity": ["ಪತ್ತೆ ಚಟುವಟಿಕೆ", "पहचान गतिविधि"],
    "Week": ["ವಾರ", "सप्ताह"],
    "Month": ["ತಿಂಗಳು", "महीना"],
    "Recent detections": ["ಇತ್ತೀಚಿನ ಪತ್ತೆಗಳು", "हाल की पहचानें"],
    "View all": ["ಎಲ್ಲವನ್ನೂ ನೋಡಿ", "सभी देखें"],
    "Quick start": ["ತ್ವರಿತ ಆರಂಭ", "त्वरित शुरुआत"],
    "Detect waste from a photo": ["ಫೋಟೋದಿಂದ ಕಸ ಪತ್ತೆಹಚ್ಚಿ", "फोटो से कचरा पहचानें"],
    "Live detection": ["ಲೈವ್ ಪತ್ತೆ", "लाइव पहचान"],
    "Use your webcam": ["ನಿಮ್ಮ ವೆಬ್‌ಕ್ಯಾಮ್ ಬಳಸಿ", "अपना वेबकैम इस्तेमाल करें"],
    "Explore detection trends": ["ಪತ್ತೆ ಪ್ರವೃತ್ತಿಗಳನ್ನು ಅನ್ವೇಷಿಸಿ", "पहचान के रुझान देखें"],
    "Waste categories": ["ಕಸದ ವರ್ಗಗಳು", "कचरे की श्रेणियाँ"],
    "What the model recognises": ["ಮಾದರಿ ಏನನ್ನು ಗುರುತಿಸುತ್ತದೆ", "मॉडल क्या पहचानता है"],
    "Could not load recent detections.": ["ಇತ್ತೀಚಿನ ಪತ್ತೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಲಿಲ್ಲ.", "हाल की पहचानें लोड नहीं हो सकीं।"],

    /* ---- detection history ---- */
    "Detection timeline": ["ಪತ್ತೆ ಕಾಲಾನುಕ್ರಮ", "पहचान समयरेखा"],
    "Search, filter, and review your saved detections and waste records across time and location.": ["ಸಮಯ ಮತ್ತು ಸ್ಥಳದ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಉಳಿಸಿದ ಪತ್ತೆಗಳು ಮತ್ತು ಕಸದ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ, ಫಿಲ್ಟರ್ ಮಾಡಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ.", "समय और स्थान के आधार पर अपनी सहेजी गई पहचानें और कचरा रिकॉर्ड खोजें, फ़िल्टर करें और देखें।"],
    "Search by file, waste type, location or date": ["ಫೈಲ್, ಕಸದ ವಿಧ, ಸ್ಥಳ ಅಥವಾ ದಿನಾಂಕದಿಂದ ಹುಡುಕಿ", "फ़ाइल, कचरा प्रकार, स्थान या तारीख से खोजें"],
    "Search detections": ["ಪತ್ತೆಗಳನ್ನು ಹುಡುಕಿ", "पहचानें खोजें"],
    "Image": ["ಚಿತ್ರ", "छवि"],
    "Waste type": ["ಕಸದ ವಿಧ", "कचरा प्रकार"],
    "Date": ["ದಿನಾಂಕ", "तारीख"],
    "Time": ["ಸಮಯ", "समय"],
    "Action": ["ಕ್ರಿಯೆ", "कार्रवाई"],
    "All": ["ಎಲ್ಲಾ", "सभी"],
    "Unavailable": ["ಲಭ್ಯವಿಲ್ಲ", "उपलब्ध नहीं"],
    "Detection details": ["ಪತ್ತೆ ವಿವರಗಳು", "पहचान का विवरण"],
    "Delete detection?": ["ಪತ್ತೆಯನ್ನು ಅಳಿಸಬೇಕೇ?", "पहचान हटाएँ?"],
    "This removes the record and its saved image. This cannot be undone.": ["ಇದು ದಾಖಲೆ ಮತ್ತು ಉಳಿಸಿದ ಚಿತ್ರವನ್ನು ತೆಗೆದುಹಾಕುತ್ತದೆ. ಇದನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗದು.", "यह रिकॉर्ड और उसकी सहेजी गई छवि हटा देगा। इसे वापस नहीं किया जा सकता।"],
    "No detections match your search or filter.": ["ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಪತ್ತೆಗಳಿಲ್ಲ.", "आपकी खोज या फ़िल्टर से कोई पहचान मेल नहीं खाती।"],
    "Detection deleted.": ["ಪತ್ತೆಯನ್ನು ಅಳಿಸಲಾಗಿದೆ.", "पहचान हटा दी गई।"],
    "File · Timestamp · Source": ["ಫೈಲ್ · ಸಮಯಮುದ್ರೆ · ಮೂಲ", "फ़ाइल · टाइमस्टैंप · स्रोत"],

    /* ---- waste categories ---- */
    "Waste recognition library": ["ಕಸ ಗುರುತಿಸುವಿಕೆ ಗ್ರಂಥಾಲಯ", "कचरा पहचान लाइब्रेरी"],
    "The model is trained to recognise": ["ಮಾದರಿಯು", "मॉडल को"],
    "waste categories with tailored disposal guidance for each stream.": ["ಕಸದ ವರ್ಗಗಳನ್ನು ಗುರುತಿಸಲು ತರಬೇತಿ ಪಡೆದಿದೆ, ಪ್ರತಿ ವರ್ಗಕ್ಕೂ ತಕ್ಕ ವಿಲೇವಾರಿ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ.", "कचरा श्रेणियाँ पहचानने के लिए प्रशिक्षित किया गया है, हर श्रेणी के लिए अनुकूल निपटान मार्गदर्शन के साथ।"],
    "Examples": ["ಉದಾಹರಣೆಗಳು", "उदाहरण"],
    "Disposal recommendation": ["ವಿಲೇವಾರಿ ಶಿಫಾರಸು", "निपटान की सिफ़ारिश"],

    /* ---- analytics ---- */
    "Performance overview": ["ಕಾರ್ಯಕ್ಷಮತೆ ಅವಲೋಕನ", "प्रदर्शन अवलोकन"],
    "Monitor category mix, confidence quality, and recent disposal trends across your waste detections.": ["ನಿಮ್ಮ ಕಸ ಪತ್ತೆಗಳಲ್ಲಿ ವರ್ಗ ಮಿಶ್ರಣ, ವಿಶ್ವಾಸದ ಗುಣಮಟ್ಟ ಮತ್ತು ಇತ್ತೀಚಿನ ವಿಲೇವಾರಿ ಪ್ರವೃತ್ತಿಗಳನ್ನು ಗಮನಿಸಿ.", "अपनी कचरा पहचानों में श्रेणी मिश्रण, विश्वास की गुणवत्ता और हाल के निपटान रुझानों पर नज़र रखें।"],
    "Most common waste": ["ಅತ್ಯಂತ ಸಾಮಾನ್ಯ ಕಸ", "सबसे आम कचरा"],
    "Detect your first image": ["ನಿಮ್ಮ ಮೊದಲ ಚಿತ್ರವನ್ನು ಪತ್ತೆಹಚ್ಚಿ", "अपनी पहली छवि पहचानें"],
    "Category distribution": ["ವರ್ಗ ಹಂಚಿಕೆ", "श्रेणी वितरण"],
    "Average confidence by category": ["ವರ್ಗದ ಪ್ರಕಾರ ಸರಾಸರಿ ವಿಶ್ವಾಸ", "श्रेणी के अनुसार औसत विश्वास"],
    "Daily · last 14 days": ["ದೈನಂದಿನ · ಕಳೆದ 14 ದಿನ", "दैनिक · पिछले 14 दिन"],
    "Weekly · last 8 weeks": ["ಸಾಪ್ತಾಹಿಕ · ಕಳೆದ 8 ವಾರ", "साप्ताहिक · पिछले 8 सप्ताह"],
    "Monthly · last 6 months": ["ಮಾಸಿಕ · ಕಳೆದ 6 ತಿಂಗಳು", "मासिक · पिछले 6 महीने"],
    "Confidence spread": ["ವಿಶ್ವಾಸದ ಹರಡುವಿಕೆ", "विश्वास का फैलाव"],

    /* ---- settings ---- */
    "Application controls": ["ಅಪ್ಲಿಕೇಶನ್ ನಿಯಂತ್ರಣಗಳು", "ऐप नियंत्रण"],
    "Manage location usage, model health, and saved detection data without changing the underlying AI workflow.": ["ಮೂಲ AI ಕಾರ್ಯವಿಧಾನವನ್ನು ಬದಲಾಯಿಸದೆ ಸ್ಥಳ ಬಳಕೆ, ಮಾದರಿಯ ಆರೋಗ್ಯ ಮತ್ತು ಉಳಿಸಿದ ಪತ್ತೆ ಡೇಟಾವನ್ನು ನಿರ್ವಹಿಸಿ.", "मूल AI कार्यप्रवाह को बदले बिना स्थान उपयोग, मॉडल की स्थिति और सहेजा गया पहचान डेटा प्रबंधित करें।"],
    "Detection": ["ಪತ್ತೆ", "पहचान"],
    "Use my location": ["ನನ್ನ ಸ್ಥಳವನ್ನು ಬಳಸಿ", "मेरा स्थान उपयोग करें"],
    "Attach your browser location to every detection. Your browser will ask for permission.": ["ಪ್ರತಿ ಪತ್ತೆಗೆ ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸ್ಥಳವನ್ನು ಜೋಡಿಸಿ. ನಿಮ್ಮ ಬ್ರೌಸರ್ ಅನುಮತಿ ಕೇಳುತ್ತದೆ.", "हर पहचान के साथ अपने ब्राउज़र का स्थान जोड़ें। आपका ब्राउज़र अनुमति माँगेगा।"],
    "Live detection interval": ["ಲೈವ್ ಪತ್ತೆ ಅಂತರ", "लाइव पहचान अंतराल"],
    "How often a frame is analysed while live detection is running.": ["ಲೈವ್ ಪತ್ತೆ ನಡೆಯುವಾಗ ಎಷ್ಟು ಬಾರಿ ಫ್ರೇಮ್ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ.", "लाइव पहचान चलने के दौरान कितनी बार फ्रेम का विश्लेषण होता है।"],
    "Model": ["ಮಾದರಿ", "मॉडल"],
    "Status": ["ಸ್ಥಿತಿ", "स्थिति"],
    "Checking…": ["ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…", "जाँच हो रही है…"],
    "Model file": ["ಮಾದರಿ ಫೈಲ್", "मॉडल फ़ाइल"],
    "Trained classes": ["ತರಬೇತಿ ಪಡೆದ ವರ್ಗಗಳು", "प्रशिक्षित श्रेणियाँ"],
    "Accepted images": ["ಸ್ವೀಕರಿಸುವ ಚಿತ್ರಗಳು", "स्वीकृत छवियाँ"],
    "JPG, JPEG, PNG · max 10 MB": ["JPG, JPEG, PNG · ಗರಿಷ್ಠ 10 MB", "JPG, JPEG, PNG · अधिकतम 10 MB"],
    "Data": ["ಡೇಟಾ", "डेटा"],
    "Clear detection history": ["ಪತ್ತೆ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಿ", "पहचान इतिहास साफ़ करें"],
    "Deletes all records and saved images.": ["ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಮತ್ತು ಉಳಿಸಿದ ಚಿತ್ರಗಳನ್ನು ಅಳಿಸುತ್ತದೆ.", "सभी रिकॉर्ड और सहेजी गई छवियाँ हटा देता है।"],
    "Clear history": ["ಇತಿಹಾಸ ಅಳಿಸಿ", "इतिहास साफ़ करें"],
    "Clear all history?": ["ಎಲ್ಲಾ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಬೇಕೇ?", "पूरा इतिहास साफ़ करें?"],
    "All detections and saved images will be permanently deleted.": ["ಎಲ್ಲಾ ಪತ್ತೆಗಳು ಮತ್ತು ಉಳಿಸಿದ ಚಿತ್ರಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ.", "सभी पहचानें और सहेजी गई छवियाँ हमेशा के लिए हटा दी जाएँगी।"],
    "Clear all": ["ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ", "सब साफ़ करें"],
    "Loaded": ["ಲೋಡ್ ಆಗಿದೆ", "लोड हो गया"],
    "Failed to load": ["ಲೋಡ್ ಆಗಲಿಲ್ಲ", "लोड नहीं हुआ"],
    "Not found": ["ಸಿಗಲಿಲ್ಲ", "नहीं मिला"],
    "Unreachable": ["ತಲುಪಲಾಗುತ್ತಿಲ್ಲ", "पहुँच से बाहर"],
    "Location enabled.": ["ಸ್ಥಳವನ್ನು ಆನ್ ಮಾಡಲಾಗಿದೆ.", "स्थान चालू किया गया।"],
    "Location turned off.": ["ಸ್ಥಳವನ್ನು ಆಫ್ ಮಾಡಲಾಗಿದೆ.", "स्थान बंद किया गया।"],
    "Live interval updated.": ["ಲೈವ್ ಅಂತರವನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.", "लाइव अंतराल अपडेट किया गया।"],
    "History cleared.": ["ಇತಿಹಾಸವನ್ನು ಅಳಿಸಲಾಗಿದೆ.", "इतिहास साफ़ कर दिया गया।"],

    /* ---- live detection ---- */
    "Live waste monitoring": ["ಲೈವ್ ಕಸ ಮೇಲ್ವಿಚಾರಣೆ", "लाइव कचरा निगरानी"],
    "Review live camera frames, track the current prediction, and save a specific capture to your history whenever it matters.": ["ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫ್ರೇಮ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಪ್ರಸ್ತುತ ಪತ್ತೆಯನ್ನು ಗಮನಿಸಿ ಮತ್ತು ಮುಖ್ಯವಾದಾಗ ಒಂದು ನಿರ್ದಿಷ್ಟ ಚಿತ್ರವನ್ನು ನಿಮ್ಮ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಿ.", "लाइव कैमरा फ्रेम देखें, मौजूदा पहचान पर नज़र रखें और ज़रूरत पड़ने पर किसी खास कैप्चर को अपने इतिहास में सहेजें।"],
    "Detecting": ["ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ", "पहचान जारी है"],
    "Stop detection": ["ಪತ್ತೆ ನಿಲ್ಲಿಸಿ", "पहचान रोकें"],
    "Predicting…": ["ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ…", "पहचान हो रही है…"],
    "Start the camera to see predictions here.": ["ಇಲ್ಲಿ ಪತ್ತೆ ಫಲಿತಾಂಶ ನೋಡಲು ಕ್ಯಾಮೆರಾ ಆನ್ ಮಾಡಿ.", "यहाँ परिणाम देखने के लिए कैमरा चालू करें।"],
    "Live preview, not saved. Use": ["ಲೈವ್ ಪೂರ್ವವೀಕ್ಷಣೆ, ಉಳಿಸಿಲ್ಲ. ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲು", "लाइव पूर्वावलोकन, सहेजा नहीं गया। इतिहास में सहेजने के लिए"],
    "to save to history.": ["ಬಳಸಿ.", "का उपयोग करें।"],
    "Camera active": ["ಕ್ಯಾಮೆರಾ ಸಕ್ರಿಯ", "कैमरा चालू है"],
    "Camera unavailable": ["ಕ್ಯಾಮೆರಾ ಲಭ್ಯವಿಲ್ಲ", "कैमरा उपलब्ध नहीं"],
    "Camera is not supported here. Open the app at http://127.0.0.1:5000 in a modern browser.": ["ಇಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಬೆಂಬಲಿತವಿಲ್ಲ. ಆಧುನಿಕ ಬ್ರೌಸರ್‌ನಲ್ಲಿ http://127.0.0.1:5000 ನಲ್ಲಿ ಆ್ಯಪ್ ತೆರೆಯಿರಿ.", "यहाँ कैमरा समर्थित नहीं है। किसी आधुनिक ब्राउज़र में http://127.0.0.1:5000 पर ऐप खोलें।"],
    "Camera permission was denied. Allow camera access in your browser and try again.": ["ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶಕ್ಕೆ ಅನುಮತಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "कैमरा अनुमति अस्वीकार की गई। अपने ब्राउज़र में कैमरा एक्सेस की अनुमति दें और फिर कोशिश करें।"],
    "No camera was found on this device.": ["ಈ ಸಾಧನದಲ್ಲಿ ಯಾವುದೇ ಕ್ಯಾಮೆರಾ ಸಿಗಲಿಲ್ಲ.", "इस डिवाइस पर कोई कैमरा नहीं मिला।"],
    "The camera is being used by another application.": ["ಕ್ಯಾಮೆರಾವನ್ನು ಬೇರೆ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸುತ್ತಿದೆ.", "कैमरा किसी दूसरे ऐप द्वारा इस्तेमाल हो रहा है।"],
    "The camera could not be started.": ["ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಲಾಗಲಿಲ್ಲ.", "कैमरा शुरू नहीं हो सका।"],
    "The camera frame is not ready yet. Try again in a moment.": ["ಕ್ಯಾಮೆರಾ ಫ್ರೇಮ್ ಇನ್ನೂ ಸಿದ್ಧವಾಗಿಲ್ಲ. ಸ್ವಲ್ಪ ಹೊತ್ತಿನ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", "कैमरा फ्रेम अभी तैयार नहीं है। थोड़ी देर बाद फिर कोशिश करें।"],
    "Saved to detection history.": ["ಪತ್ತೆ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲಾಗಿದೆ.", "पहचान इतिहास में सहेजा गया।"],
    "Location unavailable. Saved without location.": ["ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳವಿಲ್ಲದೆ ಉಳಿಸಲಾಗಿದೆ.", "स्थान उपलब्ध नहीं। बिना स्थान के सहेजा गया।"],

    /* ---- upload page intro ---- */
    "Smart upload flow": ["ಸ್ಮಾರ್ಟ್ ಅಪ್‌ಲೋಡ್ ಪ್ರಕ್ರಿಯೆ", "स्मार्ट अपलोड प्रक्रिया"],
    "Choose a clear waste image, pick a single-item or mixed-waste mode, and let the AI classify the item with the same detection pipeline used across the app.": ["ಸ್ಪಷ್ಟವಾದ ಕಸದ ಚಿತ್ರವನ್ನು ಆರಿಸಿ, ಒಂದು ವಸ್ತು ಅಥವಾ ಮಿಶ್ರ ಕಸದ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ, ಆ್ಯಪ್‌ನಾದ್ಯಂತ ಬಳಸುವ ಅದೇ ಪತ್ತೆ ವಿಧಾನದಿಂದ AI ವಸ್ತುವನ್ನು ವರ್ಗೀಕರಿಸಲಿ.", "कचरे की साफ़ छवि चुनें, एक वस्तु या मिश्रित कचरा मोड चुनें, और ऐप में इस्तेमाल होने वाली उसी पहचान प्रक्रिया से AI को वस्तु का वर्गीकरण करने दें।"],
    "Choose an image": ["ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ", "एक छवि चुनें"],
    "Selected image preview": ["ಆಯ್ಕೆ ಮಾಡಿದ ಚಿತ್ರದ ಪೂರ್ವವೀಕ್ಷಣೆ", "चुनी गई छवि का पूर्वावलोकन"],

    /* ---- the language box itself ---- */
    "Language": ["ಭಾಷೆ", "भाषा"]
  };

  var MONTHS = {
    January: ["ಜನವರಿ", "जनवरी"], February: ["ಫೆಬ್ರವರಿ", "फ़रवरी"], March: ["ಮಾರ್ಚ್", "मार्च"],
    April: ["ಏಪ್ರಿಲ್", "अप्रैल"], May: ["ಮೇ", "मई"], June: ["ಜೂನ್", "जून"],
    July: ["ಜುಲೈ", "जुलाई"], August: ["ಆಗಸ್ಟ್", "अगस्त"], September: ["ಸೆಪ್ಟೆಂಬರ್", "सितंबर"],
    October: ["ಅಕ್ಟೋಬರ್", "अक्टूबर"], November: ["ನವೆಂಬರ್", "नवंबर"], December: ["ಡಿಸೆಂಬರ್", "दिसंबर"]
  };
  var AMPM = { AM: ["ಪೂರ್ವಾಹ್ನ", "पूर्वाह्न"], PM: ["ಅಪರಾಹ್ನ", "अपराह्न"] };

  function cls(name, i) {
    var k = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return D[k] ? D[k][i] : name;
  }

  /* Texts that contain numbers or names: [pattern, function(match, i)] */
  var P = [
    [/^(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/,
      function (r, i) { return r[1] + " " + MONTHS[r[2]][i] + " " + r[3]; }],
    [/^(\d{1,2}:\d{2}(?::\d{2})?) (AM|PM)$/,
      function (r, i) { return r[1] + " " + AMPM[r[2]][i]; }],
    [/^SUGGESTED BIN \(FOR ([A-Z]+)\)$/,
      function (r, i) {
        return i === 0 ? "ಸೂಚಿಸಿದ ತೊಟ್ಟಿ (" + cls(r[1], 0) + "\u200cಗಾಗಿ)"
                       : "सुझाया गया डिब्बा (" + cls(r[1], 1) + " के लिए)";
      }],
    [/^(\d+(?:\.\d+)?)% of the identified area$/,
      function (r, i) { return i === 0 ? "ಗುರುತಿಸಿದ ಪ್ರದೇಶದ " + r[1] + "%" : "पहचाने गए क्षेत्र का " + r[1] + "%"; }],
    [/^\((\d+) of (\d+) tiles\)$/,
      function (r, i) { return i === 0 ? "(" + r[2] + " ರಲ್ಲಿ " + r[1] + " ತುಣುಕುಗಳು)" : "(" + r[2] + " में से " + r[1] + " टुकड़े)"; }],
    [/^(\d+) of (\d+) tiles were uncertain and not counted\. This is an estimate\.$/,
      function (r, i) {
        return i === 0 ? r[2] + " ರಲ್ಲಿ " + r[1] + " ತುಣುಕುಗಳು ಅನಿಶ್ಚಿತವಾಗಿದ್ದವು ಮತ್ತು ಎಣಿಸಲಾಗಿಲ್ಲ. ಇದು ಅಂದಾಜು."
                       : r[2] + " में से " + r[1] + " टुकड़े अनिश्चित थे और गिने नहीं गए। यह एक अनुमान है।";
      }]
  ];


  var SRC = { upload: ["ಅಪ್‌ಲೋಡ್", "अपलोड"], camera: ["ಕ್ಯಾಮೆರಾ", "कैमरा"] };
  P.push(
    /* history detail line: file name · timestamp · upload/camera */
    [/^(.*) · (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) · (upload|camera)$/,
      function (r, i) { return r[1] + " · " + r[2] + " · " + SRC[r[3]][i]; }],
    /* dashboard recent list: 17/10/26 · 03:07 PM · place */
    [/^(\d{2}\/\d{2}\/\d{2}) · (\d{1,2}:\d{2}) (AM|PM)(.*)$/,
      function (r, i) { return r[1] + " · " + r[2] + " " + AMPM[r[3]][i] + r[4]; }],
    /* waste-category link: View plastic detections */
    [/^View (plastic|paper|glass|metal|organic) detections$/,
      function (r, i) { return i === 0 ? cls(r[1], 0) + " ಪತ್ತೆಗಳನ್ನು ನೋಡಿ" : cls(r[1], 1) + " की पहचानें देखें"; }],
    /* live interval choices: 1.5 s, 2 s ... */
    [/^(\d+(?:\.\d+)?) s$/,
      function (r, i) { return r[1] + (i === 0 ? " ಸೆ" : " से."); }]
  );

  /* translated text -> English key (so text can be switched between languages) */
  var REV = {};
  Object.keys(D).forEach(function (k) {
    for (var i = 0; i < 2; i++) { if (!REV[D[k][i]]) REV[D[k][i]] = k; }
  });

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }

  function lookup(key, lang) {
    var i = IDX[lang];
    if (D[key]) return D[key][i];
    for (var n = 0; n < P.length; n++) {
      var r = P[n][0].exec(key);
      if (r) return P[n][1](r, i);
    }
    return null;
  }

  function looksEnglish(key) {
    return /[A-Za-z]{3,}/.test(key) && !/^[\d\s.,:%()\-–·]+$/.test(key);
  }

  /* en0 = current text; returns {en: English text, out: text to show} */
  function compute(en0, lang) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(en0);
    var core = norm(m[2]);
    if (!core) return { en: en0, out: en0 };
    var key = REV[core] || core;
    var en = REV[core] ? m[1] + key + m[3] : en0;
    if (lang === "en") return { en: en, out: en };
    var t = lookup(key, lang);
    if (t == null) {
      if (looksEnglish(key)) missing[key] = 1;
      return { en: en, out: en };
    }
    return { en: en, out: m[1] + t + m[3] };
  }

  /* ---------- apply to the page ---------- */
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  var textState = new WeakMap();
  var attrState = new WeakMap();

  function skipEl(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
      var tag = n.nodeName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" ||
          n.hasAttribute("data-no-i18n")) return true;
    }
    return false;
  }

  function setText(node, lang) {
    var v = node.nodeValue, st = textState.get(node);
    var en0 = (st && v === st.out) ? st.en : v;
    var r = compute(en0, lang);
    textState.set(node, r);
    if (node.nodeValue !== r.out) node.nodeValue = r.out;
  }

  function setAttr(el, name, lang) {
    if (!el.hasAttribute(name)) return;
    var v = el.getAttribute(name), all = attrState.get(el) || {}, s = all[name];
    var en0 = (s && v === s.out) ? s.en : v;
    var r = compute(en0, lang);
    all[name] = r;
    attrState.set(el, all);
    if (v !== r.out) el.setAttribute(name, r.out);
  }

  function walk(root, lang) {
    if (root.nodeType === 3) {
      if (!skipEl(root.parentNode)) setText(root, lang);
      return;
    }
    if (root.nodeType !== 1 || skipEl(root)) return;
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = tw.nextNode())) list.push(n);
    list.forEach(function (t) { if (!skipEl(t.parentNode)) setText(t, lang); });
    var els = [root].concat([].slice.call(
      root.querySelectorAll("[placeholder],[title],[aria-label],[alt]")));
    els.forEach(function (el) {
      if (skipEl(el)) return;
      ATTRS.forEach(function (a) { setAttr(el, a, lang); });
    });
  }

  var titleState = null;
  function setTitle(lang) {
    var v = document.title, en0 = (titleState && v === titleState.out) ? titleState.en : v;
    var parts = en0.split(" · ");
    var en = parts.map(function (p) { return compute(p, "en").out; }).join(" · ");
    var out = parts.map(function (p) { return compute(p, lang).out; }).join(" · ");
    titleState = { en: en, out: out };
    if (document.title !== out) document.title = out;
  }

  function active() { return LANG !== "en" || everTranslated; }

  function setLang(lang, save) {
    if (lang !== "en" && !IDX.hasOwnProperty(lang)) lang = "en";
    LANG = lang;
    if (save !== false) { try { localStorage.setItem(STORE, lang); } catch (e) { /* ignore */ } }
    document.documentElement.setAttribute("lang", lang);
    if (lang !== "en") everTranslated = true;
    if (active() && document.body) { walk(document.body, lang); setTitle(lang); }
    var sel = document.getElementById("wdLang");
    if (sel && sel.value !== lang) sel.value = lang;
  }

  /* ---------- language box ---------- */
  var FONT_CSS =
    "html[lang=hi] body,html[lang=hi] button,html[lang=hi] input,html[lang=hi] select{font-family:'Inter','Noto Sans Devanagari','Nirmala UI','Mangal',system-ui,sans-serif}" +
    "html[lang=kn] body,html[lang=kn] button,html[lang=kn] input,html[lang=kn] select{font-family:'Inter','Noto Sans Kannada','Nirmala UI','Tunga',system-ui,sans-serif}" +
    "html[lang=hi] h1,html[lang=hi] h2,html[lang=hi] h3{font-family:'Noto Sans Devanagari','Nirmala UI','Mangal',system-ui,sans-serif}" +
    "html[lang=kn] h1,html[lang=kn] h2,html[lang=kn] h3{font-family:'Noto Sans Kannada','Nirmala UI','Tunga',system-ui,sans-serif}" +
    "#wdLang{max-width:130px}" +
    "@media(max-width:560px){#wdLang{max-width:96px;padding:0 6px}}";

  function buildSwitcher() {
    if (document.getElementById("wdLang")) return;
    var css = document.createElement("style");
    css.textContent = FONT_CSS;
    document.head.appendChild(css);

    var sel = document.createElement("select");
    sel.id = "wdLang";
    sel.setAttribute("data-no-i18n", "");
    sel.setAttribute("aria-label", "Language / ಭಾಷೆ / भाषा");
    sel.style.cssText = "height:36px;padding:0 10px;border:1px solid #e2e8f0;border-radius:999px;" +
      "background:#fff;color:#12231d;font:inherit;font-weight:600;cursor:pointer";
    LANGS.forEach(function (l) {
      var o = document.createElement("option");
      o.value = l[0]; o.textContent = l[1];
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { setLang(sel.value); });

    var wrap = document.createElement("div");
    wrap.setAttribute("data-no-i18n", "");
    wrap.appendChild(sel);

    var chip = document.getElementById("locChip");
    var sb = document.getElementById("sidebar");
    if (chip && chip.parentNode) {            // app pages: top bar, next to the location chip
      wrap.style.cssText = "flex:none;margin-right:8px";
      chip.parentNode.insertBefore(wrap, chip);
    } else if (sb) {                          // fallback: bottom of the sidebar
      sel.style.width = "100%"; sel.style.borderRadius = "8px";
      wrap.style.cssText = "margin:12px 14px";
      sb.appendChild(wrap);
    } else {                                  // sign-in pages: top right corner
      wrap.style.cssText = "position:fixed;top:14px;right:14px;z-index:50";
      document.body.appendChild(wrap);
    }
  }

  function init() {
    var saved = "en";
    try { saved = localStorage.getItem(STORE) || "en"; } catch (e) { /* ignore */ }
    buildSwitcher();

    new MutationObserver(function (muts) {
      if (!active()) return;
      muts.forEach(function (m) {
        if (m.type === "childList") {
          [].forEach.call(m.addedNodes, function (n) { walk(n, LANG); });
        } else if (m.type === "characterData") {
          if (!skipEl(m.target.parentNode)) setText(m.target, LANG);
        } else if (m.type === "attributes") {
          if (!skipEl(m.target)) setAttr(m.target, m.attributeName, LANG);
        }
      });
    }).observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS
    });

    setLang(saved, false);
  }

  window.WD_I18N = {
    set: function (l) { setLang(l); },
    get: function () { return LANG; },
    missing: function () { return Object.keys(missing); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
