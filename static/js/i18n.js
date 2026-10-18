/* Waste Detection AI - language switcher (English / Hindi / Kannada)
 * Adds a language dropdown to every page and translates the page text.
 * Works on any markup: it matches exact English strings from the dictionary below.
 * To translate more text, add a row to ROWS:  ["English text", "हिन्दी", "ಕನ್ನಡ"]
 * To find text that is still English, open the browser console (F12) and run:  WD_I18N.missing()
 */
(function () {
  "use strict";
  var LANGS = { en: "English", hi: "हिन्दी", kn: "ಕನ್ನಡ" };
  var KEY = "wd_lang";

  var ROWS = [
    // ---- navigation & chrome ----
    ["Dashboard", "डैशबोर्ड", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"],
    ["Upload Image", "छवि अपलोड करें", "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"],
    ["Live Detection", "लाइव पहचान", "ಲೈವ್ ಪತ್ತೆ"],
    ["Detection History", "पहचान का इतिहास", "ಪತ್ತೆಯ ಇತಿಹಾಸ"],
    ["Waste Categories", "कचरे की श्रेणियाँ", "ಕಸದ ವರ್ಗಗಳು"],
    ["Analytics", "विश्लेषण", "ವಿಶ್ಲೇಷಣೆ"],
    ["Settings", "सेटिंग्स", "ಸೆಟ್ಟಿಂಗ್‌ಗಳು"],
    ["Waste Detection", "कचरा पहचान", "ಕಸ ಪತ್ತೆ"],
    ["Waste Detection AI", "कचरा पहचान AI", "ಕಸ ಪತ್ತೆ AI"],
    ["AI Dashboard", "AI डैशबोर्ड", "AI ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"],
    ["Smart waste classification dashboard", "स्मार्ट कचरा वर्गीकरण डैशबोर्ड", "ಸ್ಮಾರ್ಟ್ ಕಸ ವರ್ಗೀಕರಣ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"],
    ["Checking model…", "मॉडल जाँचा जा रहा है…", "ಮಾಡೆಲ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…"],
    ["Model ready", "मॉडल तैयार है", "ಮಾಡೆಲ್ ಸಿದ್ಧವಾಗಿದೆ"],
    ["Model not found", "मॉडल नहीं मिला", "ಮಾಡೆಲ್ ಸಿಗಲಿಲ್ಲ"],
    ["Model failed to load", "मॉडल लोड नहीं हुआ", "ಮಾಡೆಲ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ"],
    ["Server unreachable", "सर्वर से संपर्क नहीं हो पा रहा", "ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿಲ್ಲ"],
    ["Enable location", "स्थान चालू करें", "ಸ್ಥಳ ಸಕ್ರಿಯಗೊಳಿಸಿ"],
    ["Locating…", "स्थान खोजा जा रहा है…", "ಸ್ಥಳ ಹುಡುಕಲಾಗುತ್ತಿದೆ…"],
    ["Location unavailable", "स्थान उपलब्ध नहीं", "ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ"],
    ["Location off", "स्थान बंद", "ಸ್ಥಳ ಆಫ್"],
    ["Sign out", "साइन आउट", "ಸೈನ್ ಔಟ್"],
    ["Language", "भाषा", "ಭಾಷೆ"],
    ["Open menu", "मेनू खोलें", "ಮೆನು ತೆರೆಯಿರಿ"],
    ["Choose an image", "छवि चुनें", "ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ"],
    ["Selected image preview", "चुनी गई छवि का पूर्वावलोकन", "ಆಯ್ಕೆ ಮಾಡಿದ ಚಿತ್ರದ ಪೂರ್ವವೀಕ್ಷಣೆ"],
    ["Analysed image", "विश्लेषित छवि", "ವಿಶ್ಲೇಷಿಸಿದ ಚಿತ್ರ"],
    ["Search detections", "पहचान खोजें", "ಪತ್ತೆಗಳನ್ನು ಹುಡುಕಿ"],
    ["Detection location", "पहचान का स्थान", "ಪತ್ತೆಯ ಸ್ಥಳ"],

    // ---- banners ----
    ["Trained model not found.", "प्रशिक्षित मॉडल नहीं मिला।", "ತರಬೇತಿ ಪಡೆದ ಮಾಡೆಲ್ ಸಿಗಲಿಲ್ಲ."],
    ["Train the model with", "मॉडल को इस कमांड से प्रशिक्षित करें:", "ಮಾಡೆಲ್ ಅನ್ನು ಈ ಕಮಾಂಡ್‌ನಿಂದ ತರಬೇತಿಗೊಳಿಸಿ:"],
    ["and restart the app to enable detection.", "और पहचान चालू करने के लिए ऐप दोबारा शुरू करें।", "ಮತ್ತು ಪತ್ತೆ ಸಕ್ರಿಯಗೊಳಿಸಲು ಆ್ಯಪ್ ಅನ್ನು ಮರುಪ್ರಾರಂಭಿಸಿ."],
    ["and restart the app.", "और ऐप दोबारा शुरू करें।", "ಮತ್ತು ಆ್ಯಪ್ ಅನ್ನು ಮರುಪ್ರಾರಂಭಿಸಿ."],

    // ---- dashboard ----
    ["Total detections", "कुल पहचान", "ಒಟ್ಟು ಪತ್ತೆಗಳು"],
    ["Today", "आज", "ಇಂದು"],
    ["Top category", "शीर्ष श्रेणी", "ಪ್ರಮುಖ ವರ್ಗ"],
    ["Avg. confidence", "औसत विश्वास", "ಸರಾಸರಿ ವಿಶ್ವಾಸ"],
    ["Waste distribution", "कचरे का वितरण", "ಕಸದ ಹಂಚಿಕೆ"],
    ["Detection activity", "पहचान गतिविधि", "ಪತ್ತೆ ಚಟುವಟಿಕೆ"],
    ["Week", "सप्ताह", "ವಾರ"],
    ["Month", "महीना", "ತಿಂಗಳು"],
    ["No detection data available yet.", "अभी तक कोई पहचान डेटा उपलब्ध नहीं है।", "ಇನ್ನೂ ಯಾವುದೇ ಪತ್ತೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ."],
    ["Recent detections", "हाल की पहचान", "ಇತ್ತೀಚಿನ ಪತ್ತೆಗಳು"],
    ["View all", "सभी देखें", "ಎಲ್ಲವನ್ನೂ ನೋಡಿ"],
    ["Quick start", "त्वरित शुरुआत", "ತ್ವರಿತ ಆರಂಭ"],
    ["Upload image", "छवि अपलोड करें", "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"],
    ["Detect waste from a photo", "फोटो से कचरा पहचानें", "ಫೋಟೋದಿಂದ ಕಸ ಪತ್ತೆ ಮಾಡಿ"],
    ["Live detection", "लाइव पहचान", "ಲೈವ್ ಪತ್ತೆ"],
    ["Use your webcam", "अपने वेबकैम का उपयोग करें", "ನಿಮ್ಮ ವೆಬ್‌ಕ್ಯಾಮ್ ಬಳಸಿ"],
    ["Explore detection trends", "पहचान के रुझान देखें", "ಪತ್ತೆಯ ಪ್ರವೃತ್ತಿಗಳನ್ನು ನೋಡಿ"],
    ["Waste categories", "कचरे की श्रेणियाँ", "ಕಸದ ವರ್ಗಗಳು"],
    ["What the model recognises", "मॉडल क्या पहचानता है", "ಮಾಡೆಲ್ ಏನನ್ನು ಗುರುತಿಸುತ್ತದೆ"],
    ["Could not load recent detections.", "हाल की पहचान लोड नहीं हो सकी।", "ಇತ್ತೀಚಿನ ಪತ್ತೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಲಿಲ್ಲ."],

    // ---- upload ----
    ["Upload waste image", "कचरे की छवि अपलोड करें", "ಕಸದ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"],
    ["Single item", "एक वस्तु", "ಒಂದು ವಸ್ತು"],
    ["Mixed waste", "मिश्रित कचरा", "ಮಿಶ್ರ ಕಸ"],
    ["Use a photo of one waste item. The result is one waste type.", "एक कचरा वस्तु की फोटो लें। परिणाम एक कचरा प्रकार होगा।", "ಒಂದು ಕಸದ ವಸ್ತುವಿನ ಫೋಟೋ ಬಳಸಿ. ಫಲಿತಾಂಶ ಒಂದು ಕಸದ ಪ್ರಕಾರವಾಗಿರುತ್ತದೆ."],
    ["Use a photo of one waste item. The photo is analysed as a whole.", "एक कचरा वस्तु की फोटो लें। पूरी फोटो का विश्लेषण होता है।", "ಒಂದು ಕಸದ ವಸ್ತುವಿನ ಫೋಟೋ ಬಳಸಿ. ಇಡೀ ಫೋಟೋವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ."],
    ["Use a photo with many items. The photo is split into a grid and the share of each waste type is estimated.", "कई वस्तुओं वाली फोटो लें। फोटो को ग्रिड में बाँटकर हर कचरा प्रकार का हिस्सा अनुमानित किया जाता है।", "ಹಲವು ವಸ್ತುಗಳಿರುವ ಫೋಟೋ ಬಳಸಿ. ಫೋಟೋವನ್ನು ಗ್ರಿಡ್‌ ಆಗಿ ವಿಭಜಿಸಿ ಪ್ರತಿ ಕಸದ ಪ್ರಕಾರದ ಪಾಲನ್ನು ಅಂದಾಜಿಸಲಾಗುತ್ತದೆ."],
    ["Drag & drop image here", "छवि यहाँ खींचकर छोड़ें", "ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ"],
    ["or", "या", "ಅಥವಾ"],
    ["Choose image", "छवि चुनें", "ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ"],
    ["Remove", "हटाएँ", "ತೆಗೆದುಹಾಕಿ"],
    ["Result", "परिणाम", "ಫಲಿತಾಂಶ"],
    ["Select an image and click", "एक छवि चुनें और क्लिक करें", "ಒಂದು ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಕ್ಲಿಕ್ ಮಾಡಿ"],
    ["Detect waste", "कचरा पहचानें", "ಕಸ ಪತ್ತೆ ಮಾಡಿ"],
    ["to see the prediction.", "ताकि अनुमान दिखे।", "ಮುನ್ಸೂಚನೆ ನೋಡಲು."],
    ["Detecting…", "पहचान हो रही है…", "ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ…"],
    ["Analysing image…", "छवि का विश्लेषण हो रहा है…", "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…"],
    ["No image selected. Please choose an image first.", "कोई छवि नहीं चुनी गई। कृपया पहले एक छवि चुनें।", "ಯಾವುದೇ ಚಿತ್ರ ಆಯ್ಕೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ."],
    ["Unsupported file. Please choose a JPG, JPEG or PNG image.", "असमर्थित फ़ाइल। कृपया JPG, JPEG या PNG छवि चुनें।", "ಬೆಂಬಲಿಸದ ಫೈಲ್. ದಯವಿಟ್ಟು JPG, JPEG ಅಥವಾ PNG ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ."],
    ["Unsupported file type. Please upload a JPG, JPEG or PNG image.", "असमर्थित फ़ाइल प्रकार। कृपया JPG, JPEG या PNG छवि अपलोड करें।", "ಬೆಂಬಲಿಸದ ಫೈಲ್ ಪ್ರಕಾರ. ದಯವಿಟ್ಟು JPG, JPEG ಅಥವಾ PNG ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."],
    ["The file is not a valid JPG or PNG image.", "यह फ़ाइल मान्य JPG या PNG छवि नहीं है।", "ಈ ಫೈಲ್ ಮಾನ್ಯ JPG ಅಥವಾ PNG ಚಿತ್ರವಲ್ಲ."],
    ["The selected file is empty.", "चुनी गई फ़ाइल खाली है।", "ಆಯ್ಕೆ ಮಾಡಿದ ಫೈಲ್ ಖಾಲಿಯಾಗಿದೆ."],
    ["Location unavailable. Detection saved without location.", "स्थान उपलब्ध नहीं। पहचान स्थान के बिना सहेजी गई।", "ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳವಿಲ್ಲದೆ ಪತ್ತೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ."],

    // ---- result card ----
    ["WASTE DETECTED", "कचरा पहचाना गया", "ಕಸ ಪತ್ತೆಯಾಗಿದೆ"],
    ["Confidence", "विश्वास", "ವಿಶ್ವಾಸ"],
    ["Low confidence. Try a clearer photo with a plain background.", "कम विश्वास। साफ़ बैकग्राउंड वाली स्पष्ट फोटो आज़माएँ।", "ಕಡಿಮೆ ವಿಶ್ವಾಸ. ಸರಳ ಹಿನ್ನೆಲೆಯಿರುವ ಸ್ಪಷ್ಟ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ."],
    ["Category", "श्रेणी", "ವರ್ಗ"],
    ["Suggested bin", "सुझाया गया कूड़ेदान", "ಸೂಚಿತ ಕಸದ ಡಬ್ಬಿ"],
    ["Recommended action", "अनुशंसित कार्रवाई", "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ"],
    ["Detection time", "पहचान का समय", "ಪತ್ತೆಯ ಸಮಯ"],
    ["Detection date", "पहचान की तारीख", "ಪತ್ತೆಯ ದಿನಾಂಕ"],
    ["Location", "स्थान", "ಸ್ಥಳ"],
    ["View history", "इतिहास देखें", "ಇತಿಹಾಸ ನೋಡಿ"],
    ["Recyclable", "पुनर्चक्रण योग्य", "ಮರುಬಳಕೆ ಮಾಡಬಹುದಾದ"],
    ["Biodegradable", "जैव-अपघटनीय", "ಜೈವಿಕವಾಗಿ ಕರಗುವ"],
    // mixed waste result
    ["MOST COMMON WASTE", "सबसे आम कचरा", "ಅತ್ಯಂತ ಸಾಮಾನ್ಯ ಕಸ"],
    ["WASTE COMPOSITION", "कचरे की संरचना", "ಕಸದ ಸಂಯೋಜನೆ"],
    ["WHAT THE MODEL SAW", "मॉडल ने क्या देखा", "ಮಾಡೆಲ್ ಏನು ಕಂಡಿತು"],
    ["Uncertain", "अनिश्चित", "ಅನಿಶ್ಚಿತ"],
    ["TIME", "समय", "ಸಮಯ"],
    ["DATE", "तारीख", "ದಿನಾಂಕ"],
    ["LOCATION", "स्थान", "ಸ್ಥಳ"],
    ["The waste could not be identified clearly. Try a closer, clearer photo.", "कचरे की साफ़ पहचान नहीं हो सकी। नज़दीक से ली गई स्पष्ट फोटो आज़माएँ।", "ಕಸವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ಹತ್ತಿರದ, ಸ್ಪಷ್ಟ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ."],

    // ---- waste classes (from the model) ----
    ["Plastic", "प्लास्टिक", "ಪ್ಲಾಸ್ಟಿಕ್"],
    ["Paper", "कागज़", "ಕಾಗದ"],
    ["Glass", "काँच", "ಗಾಜು"],
    ["Metal", "धातु", "ಲೋಹ"],
    ["Organic", "जैविक", "ಸಾವಯವ"],
    ["Plastic Bin", "प्लास्टिक कूड़ेदान", "ಪ್ಲಾಸ್ಟಿಕ್ ಡಬ್ಬಿ"],
    ["Paper Bin", "कागज़ कूड़ेदान", "ಕಾಗದ ಡಬ್ಬಿ"],
    ["Glass Bin", "काँच कूड़ेदान", "ಗಾಜಿನ ಡಬ್ಬಿ"],
    ["Metal Bin", "धातु कूड़ेदान", "ಲೋಹ ಡಬ್ಬಿ"],
    ["Organic Bin", "जैविक कूड़ेदान", "ಸಾವಯವ ಡಬ್ಬಿ"],
    ["Synthetic polymer items such as bottles, containers and packaging.", "बोतलें, डिब्बे और पैकेजिंग जैसी कृत्रिम बहुलक वस्तुएँ।", "ಬಾಟಲಿಗಳು, ಡಬ್ಬಿಗಳು ಮತ್ತು ಪ್ಯಾಕೇಜಿಂಗ್‌ನಂತಹ ಕೃತಕ ಪಾಲಿಮರ್ ವಸ್ತುಗಳು."],
    ["Fibre-based items including paper sheets, newspapers and cardboard packaging.", "कागज़ की शीट, अख़बार और गत्ते की पैकेजिंग जैसी रेशे-आधारित वस्तुएँ।", "ಕಾಗದದ ಹಾಳೆಗಳು, ಪತ್ರಿಕೆಗಳು ಮತ್ತು ರಟ್ಟಿನ ಪ್ಯಾಕೇಜಿಂಗ್‌ನಂತಹ ನಾರು ಆಧಾರಿತ ವಸ್ತುಗಳು."],
    ["Rigid, brittle containers made of glass that can be recycled repeatedly.", "काँच से बने कठोर, भंगुर बर्तन जिन्हें बार-बार पुनर्चक्रित किया जा सकता है।", "ಪದೇ ಪದೇ ಮರುಬಳಕೆ ಮಾಡಬಹುದಾದ, ಗಾಜಿನಿಂದ ಮಾಡಿದ ಗಟ್ಟಿ, ಸುಲಭವಾಗಿ ಒಡೆಯುವ ಪಾತ್ರೆಗಳು."],
    ["Aluminium, steel and other metal items that are highly recyclable.", "एल्युमिनियम, स्टील और अन्य धातु की वस्तुएँ जो आसानी से पुनर्चक्रित होती हैं।", "ಅಲ್ಯೂಮಿನಿಯಂ, ಉಕ್ಕು ಮತ್ತು ಇತರ ಲೋಹದ ವಸ್ತುಗಳು, ಇವು ಸುಲಭವಾಗಿ ಮರುಬಳಕೆಯಾಗುತ್ತವೆ."],
    ["Biodegradable waste from plants and food that can be composted.", "पौधों और भोजन से निकला जैव-अपघटनीय कचरा जिससे खाद बन सकती है।", "ಸಸ್ಯ ಮತ್ತು ಆಹಾರದಿಂದ ಬರುವ ಜೈವಿಕವಾಗಿ ಕರಗುವ ಕಸ, ಇದರಿಂದ ಗೊಬ್ಬರ ಮಾಡಬಹುದು."],
    ["Water bottles", "पानी की बोतलें", "ನೀರಿನ ಬಾಟಲಿಗಳು"],
    ["Food containers", "खाने के डिब्बे", "ಆಹಾರದ ಡಬ್ಬಿಗಳು"],
    ["Shampoo bottles", "शैंपू की बोतलें", "ಶಾಂಪೂ ಬಾಟಲಿಗಳು"],
    ["Plastic bags", "प्लास्टिक की थैलियाँ", "ಪ್ಲಾಸ್ಟಿಕ್ ಚೀಲಗಳು"],
    ["Newspapers", "अख़बार", "ಪತ್ರಿಕೆಗಳು"],
    ["Office paper", "दफ़्तर का कागज़", "ಕಚೇರಿ ಕಾಗದ"],
    ["Cardboard boxes", "गत्ते के डिब्बे", "ರಟ್ಟಿನ ಪೆಟ್ಟಿಗೆಗಳು"],
    ["Magazines", "पत्रिकाएँ", "ಮ್ಯಾಗಜೀನ್‌ಗಳು"],
    ["Bottles", "बोतलें", "ಬಾಟಲಿಗಳು"],
    ["Jars", "जार", "ಜಾಡಿಗಳು"],
    ["Drinking glasses", "पीने के गिलास", "ಕುಡಿಯುವ ಲೋಟಗಳು"],
    ["Glass containers", "काँच के बर्तन", "ಗಾಜಿನ ಪಾತ್ರೆಗಳು"],
    ["Soft drink cans", "कोल्ड ड्रिंक के कैन", "ತಂಪು ಪಾನೀಯದ ಕ್ಯಾನ್‌ಗಳು"],
    ["Food tins", "खाने के टिन", "ಆಹಾರದ ಟಿನ್‌ಗಳು"],
    ["Foil trays", "फ़ॉइल की ट्रे", "ಫಾಯಿಲ್ ಟ್ರೇಗಳು"],
    ["Metal lids", "धातु के ढक्कन", "ಲೋಹದ ಮುಚ್ಚಳಗಳು"],
    ["Food scraps", "बचा हुआ खाना", "ಉಳಿದ ಆಹಾರ"],
    ["Fruit and vegetable peels", "फल और सब्ज़ियों के छिलके", "ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿ ಸಿಪ್ಪೆಗಳು"],
    ["Garden waste", "बगीचे का कचरा", "ತೋಟದ ಕಸ"],
    ["Leaves", "पत्तियाँ", "ಎಲೆಗಳು"],
    ["Send to plastic recycling. Clean and dry the item before placing it in the plastic recycling bin.", "प्लास्टिक पुनर्चक्रण में भेजें। वस्तु को साफ़ और सुखाकर प्लास्टिक पुनर्चक्रण डिब्बे में डालें।", "ಪ್ಲಾಸ್ಟಿಕ್ ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ವಸ್ತುವನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ ಒಣಗಿಸಿ ಪ್ಲಾಸ್ಟಿಕ್ ಮರುಬಳಕೆ ಡಬ್ಬಿಗೆ ಹಾಕಿ."],
    ["Send to paper recycling. Keep paper clean and dry and flatten boxes where possible.", "कागज़ पुनर्चक्रण में भेजें। कागज़ को साफ़ और सूखा रखें और डिब्बों को जहाँ संभव हो चपटा करें।", "ಕಾಗದ ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ಕಾಗದವನ್ನು ಸ್ವಚ್ಛ ಮತ್ತು ಒಣಗಿರಿಸಿ, ಸಾಧ್ಯವಾದಲ್ಲಿ ಪೆಟ್ಟಿಗೆಗಳನ್ನು ಚಪ್ಪಟೆ ಮಾಡಿ."],
    ["Send to glass recycling. Separate glass from other waste and handle broken glass carefully.", "काँच पुनर्चक्रण में भेजें। काँच को अन्य कचरे से अलग रखें और टूटे काँच को सावधानी से संभालें।", "ಗಾಜು ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ಗಾಜನ್ನು ಇತರ ಕಸದಿಂದ ಪ್ರತ್ಯೇಕಿಸಿ ಮತ್ತು ಒಡೆದ ಗಾಜನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಿ."],
    ["Send to metal recycling. Empty and rinse metal containers before recycling when appropriate.", "धातु पुनर्चक्रण में भेजें। जहाँ उचित हो, पुनर्चक्रण से पहले धातु के डिब्बों को खाली करके धो लें।", "ಲೋಹ ಮರುಬಳಕೆಗೆ ಕಳುಹಿಸಿ. ಸೂಕ್ತವಾದಲ್ಲಿ ಮರುಬಳಕೆಗೆ ಮೊದಲು ಲೋಹದ ಡಬ್ಬಿಗಳನ್ನು ಖಾಲಿ ಮಾಡಿ ತೊಳೆಯಿರಿ."],
    ["Send to composting. Put food and other biodegradable waste into the organic-waste stream.", "खाद बनाने के लिए भेजें। भोजन और अन्य जैव-अपघटनीय कचरे को जैविक कचरे में डालें।", "ಗೊಬ್ಬರ ತಯಾರಿಕೆಗೆ ಕಳುಹಿಸಿ. ಆಹಾರ ಮತ್ತು ಇತರ ಜೈವಿಕವಾಗಿ ಕರಗುವ ಕಸವನ್ನು ಸಾವಯವ ಕಸದ ವಿಭಾಗಕ್ಕೆ ಹಾಕಿ."],
    ["Rinse containers, remove caps and labels where possible and keep plastics separate from food waste.", "डिब्बों को धोएँ, संभव हो तो ढक्कन और लेबल हटाएँ और प्लास्टिक को खाने के कचरे से अलग रखें।", "ಡಬ್ಬಿಗಳನ್ನು ತೊಳೆಯಿರಿ, ಸಾಧ್ಯವಾದರೆ ಮುಚ್ಚಳ ಮತ್ತು ಲೇಬಲ್ ತೆಗೆಯಿರಿ ಹಾಗೂ ಪ್ಲಾಸ್ಟಿಕ್ ಅನ್ನು ಆಹಾರದ ಕಸದಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿಡಿ."],
    ["Wet, greasy or heavily soiled paper cannot be recycled and should go to the organic stream instead.", "गीला, चिकना या बहुत गंदा कागज़ पुनर्चक्रित नहीं हो सकता; उसे जैविक कचरे में डालें।", "ಒದ್ದೆ, ಎಣ್ಣೆಯುಕ್ತ ಅಥವಾ ತುಂಬಾ ಕೊಳಕಾದ ಕಾಗದವನ್ನು ಮರುಬಳಕೆ ಮಾಡಲಾಗುವುದಿಲ್ಲ; ಅದನ್ನು ಸಾವಯವ ಕಸದ ವಿಭಾಗಕ್ಕೆ ಹಾಕಿ."],
    ["Rinse containers and wrap broken pieces in paper before disposal to protect waste handlers.", "डिब्बों को धोएँ और कचरा संभालने वालों की सुरक्षा के लिए टूटे टुकड़ों को कागज़ में लपेटकर फेंकें।", "ಡಬ್ಬಿಗಳನ್ನು ತೊಳೆಯಿರಿ ಮತ್ತು ಕಸ ನಿರ್ವಹಿಸುವವರ ರಕ್ಷಣೆಗಾಗಿ ಒಡೆದ ತುಂಡುಗಳನ್ನು ಕಾಗದದಲ್ಲಿ ಸುತ್ತಿ ಎಸೆಯಿರಿ."],
    ["Crush cans to save space and keep metals free of food residue.", "जगह बचाने के लिए कैन को पिचका दें और धातु को खाने के अवशेष से मुक्त रखें।", "ಜಾಗ ಉಳಿಸಲು ಕ್ಯಾನ್‌ಗಳನ್ನು ಜಜ್ಜಿ, ಲೋಹವನ್ನು ಆಹಾರದ ಅವಶೇಷಗಳಿಲ್ಲದಂತೆ ಇಡಿ."],
    ["Compost at home or use the municipal wet-waste collection. Avoid mixing with plastics.", "घर पर खाद बनाएँ या नगरपालिका के गीले कचरे के संग्रह का उपयोग करें। प्लास्टिक के साथ न मिलाएँ।", "ಮನೆಯಲ್ಲಿ ಗೊಬ್ಬರ ಮಾಡಿ ಅಥವಾ ನಗರಸಭೆಯ ಹಸಿ ಕಸ ಸಂಗ್ರಹವನ್ನು ಬಳಸಿ. ಪ್ಲಾಸ್ಟಿಕ್‌ನೊಂದಿಗೆ ಬೆರೆಸಬೇಡಿ."],

    // ---- live detection ----
    ["Camera", "कैमरा", "ಕ್ಯಾಮೆರಾ"],
    ["Camera off", "कैमरा बंद", "ಕ್ಯಾಮೆರಾ ಆಫ್"],
    ["Camera active", "कैमरा चालू", "ಕ್ಯಾಮೆರಾ ಸಕ್ರಿಯ"],
    ["Camera unavailable", "कैमरा उपलब्ध नहीं", "ಕ್ಯಾಮೆರಾ ಲಭ್ಯವಿಲ್ಲ"],
    ["Camera is off", "कैमरा बंद है", "ಕ್ಯಾಮೆರಾ ಆಫ್ ಆಗಿದೆ"],
    ["Detecting", "पहचान जारी", "ಪತ್ತೆ ನಡೆಯುತ್ತಿದೆ"],
    ["Start camera", "कैमरा शुरू करें", "ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ"],
    ["Start detection", "पहचान शुरू करें", "ಪತ್ತೆ ಪ್ರಾರಂಭಿಸಿ"],
    ["Stop detection", "पहचान रोकें", "ಪತ್ತೆ ನಿಲ್ಲಿಸಿ"],
    ["Capture & predict", "फोटो लें और पहचानें", "ಫೋಟೋ ತೆಗೆದು ಪತ್ತೆ ಮಾಡಿ"],
    ["Stop camera", "कैमरा बंद करें", "ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ"],
    ["Start detection analyses a frame every few seconds without saving. Capture & predict saves the frame, location and time to your history.", "पहचान शुरू करने पर हर कुछ सेकंड में एक फ़्रेम का विश्लेषण होता है, सहेजा नहीं जाता। फोटो लें और पहचानें दबाने पर फ़्रेम, स्थान और समय इतिहास में सहेजे जाते हैं।", "ಪತ್ತೆ ಪ್ರಾರಂಭಿಸಿದರೆ ಕೆಲವು ಸೆಕೆಂಡ್‌ಗಳಿಗೊಮ್ಮೆ ಒಂದು ಫ್ರೇಮ್ ಅನ್ನು ಉಳಿಸದೆ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ. ಫೋಟೋ ತೆಗೆದು ಪತ್ತೆ ಮಾಡಿ ಒತ್ತಿದರೆ ಫ್ರೇಮ್, ಸ್ಥಳ ಮತ್ತು ಸಮಯ ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಯುತ್ತದೆ."],
    ["Prediction", "अनुमान", "ಮುನ್ಸೂಚನೆ"],
    ["Start the camera to see predictions here.", "यहाँ अनुमान देखने के लिए कैमरा शुरू करें।", "ಇಲ್ಲಿ ಮುನ್ಸೂಚನೆಗಳನ್ನು ನೋಡಲು ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ."],
    ["Predicting…", "पहचान हो रही है…", "ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ…"],
    ["Live preview, not saved. Use", "लाइव पूर्वावलोकन, सहेजा नहीं गया। इसका उपयोग करें:", "ಲೈವ್ ಪೂರ್ವವೀಕ್ಷಣೆ, ಉಳಿಸಿಲ್ಲ. ಇದನ್ನು ಬಳಸಿ:"],
    ["to save to history.", "इतिहास में सहेजने के लिए।", "ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲು."],
    ["Saved to detection history.", "पहचान इतिहास में सहेजा गया।", "ಪತ್ತೆ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲಾಗಿದೆ."],
    ["Location unavailable. Saved without location.", "स्थान उपलब्ध नहीं। स्थान के बिना सहेजा गया।", "ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳವಿಲ್ಲದೆ ಉಳಿಸಲಾಗಿದೆ."],
    ["The camera frame is not ready yet. Try again in a moment.", "कैमरा फ़्रेम अभी तैयार नहीं है। कुछ क्षण बाद फिर प्रयास करें।", "ಕ್ಯಾಮೆರಾ ಫ್ರೇಮ್ ಇನ್ನೂ ಸಿದ್ಧವಾಗಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."],
    ["Camera permission was denied. Allow camera access in your browser and try again.", "कैमरा की अनुमति अस्वीकार की गई। ब्राउज़र में कैमरा एक्सेस की अनुमति दें और फिर प्रयास करें।", "ಕ್ಯಾಮೆರಾ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶ ಅನುಮತಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."],
    ["No camera was found on this device.", "इस डिवाइस पर कोई कैमरा नहीं मिला।", "ಈ ಸಾಧನದಲ್ಲಿ ಯಾವುದೇ ಕ್ಯಾಮೆರಾ ಸಿಗಲಿಲ್ಲ."],
    ["The camera is being used by another application.", "कैमरा किसी अन्य ऐप द्वारा उपयोग में है।", "ಕ್ಯಾಮೆರಾವನ್ನು ಬೇರೆ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸುತ್ತಿದೆ."],
    ["The camera could not be started.", "कैमरा शुरू नहीं हो सका।", "ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಲಾಗಲಿಲ್ಲ."],

    // ---- history ----
    ["Search by file, waste type, location or date", "फ़ाइल, कचरा प्रकार, स्थान या तारीख से खोजें", "ಫೈಲ್, ಕಸದ ಪ್ರಕಾರ, ಸ್ಥಳ ಅಥವಾ ದಿನಾಂಕದಿಂದ ಹುಡುಕಿ"],
    ["All", "सभी", "ಎಲ್ಲಾ"],
    ["Image", "छवि", "ಚಿತ್ರ"],
    ["Waste type", "कचरे का प्रकार", "ಕಸದ ಪ್ರಕಾರ"],
    ["Date", "तारीख", "ದಿನಾಂಕ"],
    ["Time", "समय", "ಸಮಯ"],
    ["Action", "कार्रवाई", "ಕ್ರಿಯೆ"],
    ["Unavailable", "उपलब्ध नहीं", "ಲಭ್ಯವಿಲ್ಲ"],
    ["View", "देखें", "ನೋಡಿ"],
    ["Delete", "हटाएँ", "ಅಳಿಸಿ"],
    ["Close", "बंद करें", "ಮುಚ್ಚಿ"],
    ["Cancel", "रद्द करें", "ರದ್ದುಮಾಡಿ"],
    ["No detections match your search or filter.", "आपकी खोज या फ़िल्टर से कोई पहचान मेल नहीं खाती।", "ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಪತ್ತೆಗಳಿಲ್ಲ."],
    ["Detection details", "पहचान का विवरण", "ಪತ್ತೆಯ ವಿವರಗಳು"],
    ["File · Timestamp · Source", "फ़ाइल · टाइमस्टैम्प · स्रोत", "ಫೈಲ್ · ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್ · ಮೂಲ"],
    ["Delete detection?", "पहचान हटाएँ?", "ಪತ್ತೆಯನ್ನು ಅಳಿಸಬೇಕೇ?"],
    ["This removes the record and its saved image. This cannot be undone.", "इससे रिकॉर्ड और उसकी सहेजी गई छवि हट जाएगी। इसे वापस नहीं किया जा सकता।", "ಇದು ದಾಖಲೆ ಮತ್ತು ಉಳಿಸಿದ ಚಿತ್ರವನ್ನು ತೆಗೆದುಹಾಕುತ್ತದೆ. ಇದನ್ನು ಹಿಂಪಡೆಯಲಾಗುವುದಿಲ್ಲ."],
    ["Detection deleted.", "पहचान हटा दी गई।", "ಪತ್ತೆಯನ್ನು ಅಳಿಸಲಾಗಿದೆ."],
    ["That detection no longer exists.", "वह पहचान अब मौजूद नहीं है।", "ಆ ಪತ್ತೆ ಇನ್ನು ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ."],

    // ---- categories ----
    ["The model is trained to recognise", "मॉडल इन्हें पहचानने के लिए प्रशिक्षित है:", "ಮಾಡೆಲ್ ಇವುಗಳನ್ನು ಗುರುತಿಸಲು ತರಬೇತಿ ಪಡೆದಿದೆ:"],
    ["waste categories.", "कचरा श्रेणियाँ।", "ಕಸದ ವರ್ಗಗಳು."],
    ["Examples", "उदाहरण", "ಉದಾಹರಣೆಗಳು"],
    ["Disposal recommendation", "निपटान की सलाह", "ವಿಲೇವಾರಿ ಶಿಫಾರಸು"],

    // ---- analytics ----
    ["Most common waste", "सबसे आम कचरा", "ಅತ್ಯಂತ ಸಾಮಾನ್ಯ ಕಸ"],
    ["Category distribution", "श्रेणी वितरण", "ವರ್ಗ ಹಂಚಿಕೆ"],
    ["Average confidence by category", "श्रेणी के अनुसार औसत विश्वास", "ವರ್ಗದ ಪ್ರಕಾರ ಸರಾಸರಿ ವಿಶ್ವಾಸ"],
    ["Daily · last 14 days", "दैनिक · पिछले 14 दिन", "ದೈನಂದಿನ · ಕಳೆದ 14 ದಿನ"],
    ["Weekly · last 8 weeks", "साप्ताहिक · पिछले 8 सप्ताह", "ಸಾಪ್ತಾಹಿಕ · ಕಳೆದ 8 ವಾರ"],
    ["Monthly · last 6 months", "मासिक · पिछले 6 महीने", "ಮಾಸಿಕ · ಕಳೆದ 6 ತಿಂಗಳು"],
    ["Confidence spread", "विश्वास का फैलाव", "ವಿಶ್ವಾಸದ ಹರಡುವಿಕೆ"],
    ["Detect your first image", "अपनी पहली छवि पहचानें", "ನಿಮ್ಮ ಮೊದಲ ಚಿತ್ರವನ್ನು ಪತ್ತೆ ಮಾಡಿ"],

    // ---- settings ----
    ["Detection", "पहचान", "ಪತ್ತೆ"],
    ["Use my location", "मेरे स्थान का उपयोग करें", "ನನ್ನ ಸ್ಥಳವನ್ನು ಬಳಸಿ"],
    ["Attach your browser location to every detection. Your browser will ask for permission.", "हर पहचान के साथ अपने ब्राउज़र का स्थान जोड़ें। आपका ब्राउज़र अनुमति माँगेगा।", "ಪ್ರತಿ ಪತ್ತೆಗೆ ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸ್ಥಳವನ್ನು ಜೋಡಿಸಿ. ನಿಮ್ಮ ಬ್ರೌಸರ್ ಅನುಮತಿ ಕೇಳುತ್ತದೆ."],
    ["Live detection interval", "लाइव पहचान अंतराल", "ಲೈವ್ ಪತ್ತೆ ಅಂತರ"],
    ["How often a frame is analysed while live detection is running.", "लाइव पहचान चलते समय फ़्रेम का विश्लेषण कितनी बार हो।", "ಲೈವ್ ಪತ್ತೆ ನಡೆಯುವಾಗ ಎಷ್ಟು ಬಾರಿ ಫ್ರೇಮ್ ವಿಶ್ಲೇಷಿಸಬೇಕು."],
    ["Model", "मॉडल", "ಮಾಡೆಲ್"],
    ["Status", "स्थिति", "ಸ್ಥಿತಿ"],
    ["Model file", "मॉडल फ़ाइल", "ಮಾಡೆಲ್ ಫೈಲ್"],
    ["Trained classes", "प्रशिक्षित श्रेणियाँ", "ತರಬೇತಿ ಪಡೆದ ವರ್ಗಗಳು"],
    ["Accepted images", "स्वीकृत छवियाँ", "ಸ್ವೀಕೃತ ಚಿತ್ರಗಳು"],
    ["Loaded", "लोड हुआ", "ಲೋಡ್ ಆಗಿದೆ"],
    ["Failed to load", "लोड नहीं हुआ", "ಲೋಡ್ ಆಗಲಿಲ್ಲ"],
    ["Not found", "नहीं मिला", "ಸಿಗಲಿಲ್ಲ"],
    ["Unreachable", "संपर्क नहीं हुआ", "ಸಂಪರ್ಕವಾಗಲಿಲ್ಲ"],
    ["Checking…", "जाँच हो रही है…", "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…"],
    ["Data", "डेटा", "ಡೇಟಾ"],
    ["Clear history", "इतिहास साफ़ करें", "ಇತಿಹಾಸ ಅಳಿಸಿ"],
    ["Clear detection history", "पहचान का इतिहास साफ़ करें", "ಪತ್ತೆ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಿ"],
    ["Deletes all records and saved images.", "सभी रिकॉर्ड और सहेजी गई छवियाँ हटा देता है।", "ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಮತ್ತು ಉಳಿಸಿದ ಚಿತ್ರಗಳನ್ನು ಅಳಿಸುತ್ತದೆ."],
    ["Clear all history?", "पूरा इतिहास साफ़ करें?", "ಎಲ್ಲಾ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಬೇಕೇ?"],
    ["All detections and saved images will be permanently deleted.", "सभी पहचान और सहेजी गई छवियाँ हमेशा के लिए हट जाएँगी।", "ಎಲ್ಲಾ ಪತ್ತೆಗಳು ಮತ್ತು ಉಳಿಸಿದ ಚಿತ್ರಗಳು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲ್ಪಡುತ್ತವೆ."],
    ["Clear all", "सब साफ़ करें", "ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ"],
    ["Location enabled.", "स्थान चालू किया गया।", "ಸ್ಥಳ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ."],
    ["Location turned off.", "स्थान बंद किया गया।", "ಸ್ಥಳ ಆಫ್ ಮಾಡಲಾಗಿದೆ."],
    ["Live interval updated.", "लाइव अंतराल अपडेट हुआ।", "ಲೈವ್ ಅಂತರವನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ."],
    ["History cleared.", "इतिहास साफ़ किया गया।", "ಇತಿಹಾಸವನ್ನು ಅಳಿಸಲಾಗಿದೆ."],
    ["Location is turned off in Settings.", "सेटिंग्स में स्थान बंद है।", "ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಸ್ಥಳ ಆಫ್ ಆಗಿದೆ."],
    ["Location permission was denied. You can still detect waste without it.", "स्थान की अनुमति अस्वीकार की गई। फिर भी आप इसके बिना कचरा पहचान सकते हैं।", "ಸ್ಥಳ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಅದಿಲ್ಲದೆಯೂ ನೀವು ಕಸ ಪತ್ತೆ ಮಾಡಬಹುದು."],
    ["Location is unavailable on this device.", "इस डिवाइस पर स्थान उपलब्ध नहीं है।", "ಈ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ."],

    // ---- login / register ----
    ["Welcome back", "वापसी पर स्वागत है", "ಮರಳಿ ಸ್ವಾಗತ"],
    ["Sign in to open your dashboard.", "अपना डैशबोर्ड खोलने के लिए साइन इन करें।", "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲು ಸೈನ್ ಇನ್ ಮಾಡಿ."],
    ["Email", "ईमेल", "ಇಮೇಲ್"],
    ["Password", "पासवर्ड", "ಪಾಸ್‌ವರ್ಡ್"],
    ["Keep me signed in for 7 days", "मुझे 7 दिन तक साइन इन रखें", "7 ದಿನ ನನ್ನನ್ನು ಸೈನ್ ಇನ್ ಆಗಿರಿಸಿ"],
    ["Sign in", "साइन इन", "ಸೈನ್ ಇನ್"],
    ["New here?", "यहाँ नए हैं?", "ಇಲ್ಲಿ ಹೊಸಬರೇ?"],
    ["Create an account", "खाता बनाएँ", "ಖಾತೆ ರಚಿಸಿ"],
    ["Create account", "खाता बनाएँ", "ಖಾತೆ ರಚಿಸಿ"],
    ["Create your account", "अपना खाता बनाएँ", "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ"],
    ["It takes a few seconds.", "इसमें कुछ ही सेकंड लगते हैं।", "ಇದಕ್ಕೆ ಕೆಲವೇ ಸೆಕೆಂಡ್‌ಗಳು ಬೇಕು."],
    ["Full name", "पूरा नाम", "ಪೂರ್ಣ ಹೆಸರು"],
    ["At least 8 characters", "कम से कम 8 अक्षर", "ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು"],
    ["Confirm password", "पासवर्ड की पुष्टि करें", "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ"],
    ["Already have an account?", "पहले से खाता है?", "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?"],
    ["Incorrect email or password.", "ईमेल या पासवर्ड गलत है।", "ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ."],
    ["Please enter your name.", "कृपया अपना नाम दर्ज करें।", "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ."],
    ["Please enter a valid email address.", "कृपया मान्य ईमेल पता दर्ज करें।", "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ."],
    ["Password must be at least 8 characters.", "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।", "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು."],
    ["Passwords do not match.", "पासवर्ड मेल नहीं खाते।", "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ."],
    ["An account with this email already exists.", "इस ईमेल से खाता पहले से मौजूद है।", "ಈ ಇಮೇಲ್‌ನೊಂದಿಗೆ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ."],
    ["Your detections are private to your account.", "आपकी पहचान केवल आपके खाते में निजी रहती हैं।", "ನಿಮ್ಮ ಪತ್ತೆಗಳು ನಿಮ್ಮ ಖಾತೆಗೆ ಮಾತ್ರ ಖಾಸಗಿಯಾಗಿವೆ."],

    // ---- server / network messages ----
    ["Please sign in to continue.", "जारी रखने के लिए कृपया साइन इन करें।", "ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ."],
    ["Something went wrong. Please try again.", "कुछ गड़बड़ हो गई। कृपया फिर प्रयास करें।", "ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."],
    ["Something went wrong on the server. Please try again.", "सर्वर पर कुछ गड़बड़ हो गई। कृपया फिर प्रयास करें।", "ಸರ್ವರ್‌ನಲ್ಲಿ ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."],
    ["Cannot reach the server. Make sure the app is still running.", "सर्वर से संपर्क नहीं हो पा रहा। सुनिश्चित करें कि ऐप चल रहा है।", "ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿಲ್ಲ. ಆ್ಯಪ್ ಇನ್ನೂ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."],
    ["Trained model not found. Train the model first by running 'python train_model.py', then restart the app.", "प्रशिक्षित मॉडल नहीं मिला। पहले 'python train_model.py' चलाकर मॉडल प्रशिक्षित करें, फिर ऐप दोबारा शुरू करें।", "ತರಬೇತಿ ಪಡೆದ ಮಾಡೆಲ್ ಸಿಗಲಿಲ್ಲ. ಮೊದಲು 'python train_model.py' ಚಲಾಯಿಸಿ ಮಾಡೆಲ್ ತರಬೇತಿಗೊಳಿಸಿ, ನಂತರ ಆ್ಯಪ್ ಮರುಪ್ರಾರಂಭಿಸಿ."],
    ["The trained model could not be loaded. Please check the model file and your TensorFlow installation.", "प्रशिक्षित मॉडल लोड नहीं हो सका। कृपया मॉडल फ़ाइल और अपना TensorFlow इंस्टॉलेशन जाँचें।", "ತರಬೇತಿ ಪಡೆದ ಮಾಡೆಲ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮಾಡೆಲ್ ಫೈಲ್ ಮತ್ತು ನಿಮ್ಮ TensorFlow ಅನ್ನು ಪರಿಶೀಲಿಸಿ."],
    ["The image could not be read. Please try another file.", "छवि पढ़ी नहीं जा सकी। कृपया दूसरी फ़ाइल आज़माएँ।", "ಚಿತ್ರವನ್ನು ಓದಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಫೈಲ್ ಪ್ರಯತ್ನಿಸಿ."],
    ["The model could not process this image. Please try again.", "मॉडल इस छवि को संसाधित नहीं कर सका। कृपया फिर प्रयास करें।", "ಮಾಡೆಲ್ ಈ ಚಿತ್ರವನ್ನು ಸಂಸ್ಕರಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."],
    ["The prediction worked but could not be saved to history.", "पहचान हो गई लेकिन इतिहास में सहेजी नहीं जा सकी।", "ಪತ್ತೆ ಯಶಸ್ವಿಯಾಯಿತು ಆದರೆ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲಾಗಲಿಲ್ಲ."],
    ["The analysis worked but could not be saved to history.", "विश्लेषण हो गया लेकिन इतिहास में सहेजा नहीं जा सका।", "ವಿಶ್ಲೇಷಣೆ ಯಶಸ್ವಿಯಾಯಿತು ಆದರೆ ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಲಾಗಲಿಲ್ಲ."],
    ["The image is too small for mixed-waste analysis.", "मिश्रित कचरे के विश्लेषण के लिए छवि बहुत छोटी है।", "ಮಿಶ್ರ ಕಸದ ವಿಶ್ಲೇಷಣೆಗೆ ಚಿತ್ರ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ."]
  ];

  // Patterns for text that contains numbers or names. $1 = capture, {c1} = capture as a waste class, {m2} = month name.
  var MONTHS = {
    January: ["जनवरी", "ಜನವರಿ"], February: ["फ़रवरी", "ಫೆಬ್ರವರಿ"], March: ["मार्च", "ಮಾರ್ಚ್"],
    April: ["अप्रैल", "ಏಪ್ರಿಲ್"], May: ["मई", "ಮೇ"], June: ["जून", "ಜೂನ್"], July: ["जुलाई", "ಜುಲೈ"],
    August: ["अगस्त", "ಆಗಸ್ಟ್"], September: ["सितंबर", "ಸೆಪ್ಟೆಂಬರ್"], October: ["अक्टूबर", "ಅಕ್ಟೋಬರ್"],
    November: ["नवंबर", "ನವೆಂಬರ್"], December: ["दिसंबर", "ಡಿಸೆಂಬರ್"]
  };
  var PATTERNS = [
    [/^(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/, "$1 {m2} $3", "$1 {m2} $3"],
    [/^\((\d+) of (\d+) tiles\)$/, "($2 में से $1 टाइल)", "($2 ರಲ್ಲಿ $1 ಟೈಲ್‌ಗಳು)"],
    [/^([\d.]+)% of the identified area$/, "पहचाने गए क्षेत्र का $1%", "ಗುರುತಿಸಿದ ಪ್ರದೇಶದ $1%"],
    [/^(\d+) of (\d+) tiles were uncertain and not counted\. This is an estimate\.$/, "$2 में से $1 टाइल अनिश्चित थे और गिने नहीं गए। यह एक अनुमान है।", "$2 ರಲ್ಲಿ $1 ಟೈಲ್‌ಗಳು ಅನಿಶ್ಚಿತವಾಗಿದ್ದು ಲೆಕ್ಕಕ್ಕೆ ಸೇರಿಲ್ಲ. ಇದು ಅಂದಾಜು ಮಾತ್ರ."],
    [/^SUGGESTED BIN \(FOR (.+)\)$/, "सुझाया गया कूड़ेदान ({c1} के लिए)", "ಸೂಚಿತ ಕಸದ ಡಬ್ಬಿ ({c1} ಗಾಗಿ)"],
    [/^View (.+) detections$/, "{c1} की पहचान देखें", "{c1} ಪತ್ತೆಗಳನ್ನು ನೋಡಿ"],
    [/^JPG, JPEG or PNG · up to (\d+) MB$/, "JPG, JPEG या PNG · अधिकतम $1 MB", "JPG, JPEG ಅಥವಾ PNG · ಗರಿಷ್ಠ $1 MB"],
    [/^JPG, JPEG, PNG · max (\d+) MB$/, "JPG, JPEG, PNG · अधिकतम $1 MB", "JPG, JPEG, PNG · ಗರಿಷ್ಠ $1 MB"],
    [/^Image is too large\. Maximum size is (\d+) MB\.$/, "छवि बहुत बड़ी है। अधिकतम आकार $1 MB है।", "ಚಿತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. ಗರಿಷ್ಠ ಗಾತ್ರ $1 MB."]
  ];

  var IDX = { hi: 1, kn: 2 };
  var DICT = { hi: {}, kn: {} };
  var CATS = { Plastic: 1, Paper: 1, Glass: 1, Metal: 1, Organic: 1 };
  ROWS.forEach(function (r) { DICT.hi[r[0]] = r[1]; DICT.kn[r[0]] = r[2]; });

  var lang = "en";
  try { lang = localStorage.getItem(KEY) || "en"; } catch (e) {}
  if (!LANGS[lang]) lang = "en";
  var missing = {};

  function cat(x, L) {
    var t = x.charAt(0).toUpperCase() + x.slice(1).toLowerCase();
    return (DICT[L][t]) || x;
  }

  function tr(text) {
    if (lang === "en") return text;
    var m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var core = m[2].replace(/\s+/g, " ");
    if (!core) return text;
    var out = DICT[lang][core];
    if (out === undefined) {
      for (var i = 0; i < PATTERNS.length; i++) {
        var hit = core.match(PATTERNS[i][0]);
        if (hit) {
          var tpl = PATTERNS[i][IDX[lang]];
          out = tpl.replace(/\$(\d)/g, function (_, n) { return hit[n]; })
                   .replace(/\{c(\d)\}/g, function (_, n) { return cat(hit[n], lang); })
                   .replace(/\{m(\d)\}/g, function (_, n) { return (MONTHS[hit[n]] || [])[IDX[lang] - 1] || hit[n]; });
          break;
        }
      }
    }
    if (out === undefined) {
      if (/[A-Za-z]{3,}/.test(core)) missing[core] = 1;
      return text;
    }
    return m[1] + out + m[3];
  }

  // ---------- DOM walking ----------
  var textStore = new WeakMap();
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  var SKIP = { SCRIPT: 1, STYLE: 1, CODE: 1, TEXTAREA: 1, CANVAS: 1, SVG: 1, NOSCRIPT: 1 };

  function skipEl(el) {
    for (; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP[el.tagName.toUpperCase()] || el.hasAttribute("data-no-i18n") || el.id === "langSelect") return true;
    }
    return false;
  }

  function doText(n) {
    if (!n.parentNode || skipEl(n.parentNode)) return;
    var cur = n.nodeValue, rec = textStore.get(n);
    if (!rec || cur !== rec.out) rec = { orig: cur };
    rec.out = tr(rec.orig);
    textStore.set(n, rec);
    if (n.nodeValue !== rec.out) n.nodeValue = rec.out;
  }

  function doAttrs(el) {
    if (el.nodeType !== 1 || skipEl(el)) return;
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      var ok = "data-i18n-" + a, orig = el.getAttribute(ok);
      var cur = el.getAttribute(a);
      if (orig === null) { orig = cur; el.setAttribute(ok, orig); }
      el.__i18nOut = el.__i18nOut || {};
      if (el.__i18nOut[a] !== undefined && cur !== el.__i18nOut[a]) { orig = cur; el.setAttribute(ok, orig); }
      var out = tr(orig);
      el.__i18nOut[a] = out;
      if (cur !== out) el.setAttribute(a, out);
    });
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) { if (skipEl(root)) return; doAttrs(root); }
    var kids = root.childNodes;
    for (var i = 0; i < kids.length; i++) walk(kids[i]);
  }

  var titleOrig = null;
  function doTitle() {
    if (titleOrig === null) titleOrig = document.title;
    var parts = titleOrig.split(" · ");
    document.title = parts.map(function (p) { return tr(p); }).join(" · ");
  }

  // ---------- language picker ----------
  var CSS = "" +
    "#langWrap{display:inline-flex;align-items:center;gap:6px;flex:none}" +
    "#langWrap.floating{position:fixed;top:12px;right:12px;z-index:200;background:#fff;border:1px solid #e3e7fb;border-radius:999px;padding:4px 10px;box-shadow:0 4px 14px rgba(19,27,46,.1)}" +
    "#langWrap svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.7}" +
    "#langSelect{font:inherit;font-size:13px;font-weight:600;color:inherit;border:1px solid #e3e7fb;background:#fff;border-radius:999px;padding:7px 10px;cursor:pointer;max-width:120px}" +
    "#langWrap.floating #langSelect{border:0;padding:4px 2px;background:transparent}" +
    "#langSelect:focus{outline:2px solid #9ae9c8}" +
    "html[lang=hi] body,html[lang=hi] button,html[lang=hi] input,html[lang=hi] select{font-family:'Inter','Noto Sans Devanagari','Nirmala UI','Mangal',system-ui,sans-serif}" +
    "html[lang=kn] body,html[lang=kn] button,html[lang=kn] input,html[lang=kn] select{font-family:'Inter','Noto Sans Kannada','Nirmala UI','Tunga',system-ui,sans-serif}" +
    "html[lang=hi] h1,html[lang=hi] h2,html[lang=hi] h3,html[lang=hi] .stat-value,html[lang=hi] .res-title,html[lang=hi] .auth-title{font-family:'Noto Sans Devanagari','Nirmala UI','Mangal',system-ui,sans-serif}" +
    "html[lang=kn] h1,html[lang=kn] h2,html[lang=kn] h3,html[lang=kn] .stat-value,html[lang=kn] .res-title,html[lang=kn] .auth-title{font-family:'Noto Sans Kannada','Nirmala UI','Tunga',system-ui,sans-serif}" +
    "@media(max-width:560px){#langSelect{max-width:92px;padding:6px 8px}}";

  function buildPicker() {
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    var wrap = document.createElement("div");
    wrap.id = "langWrap";
    wrap.setAttribute("data-no-i18n", "");
    wrap.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    var sel = document.createElement("select");
    sel.id = "langSelect";
    sel.setAttribute("aria-label", "Language");
    Object.keys(LANGS).forEach(function (k) {
      var o = document.createElement("option");
      o.value = k; o.textContent = LANGS[k];
      if (k === lang) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { setLang(sel.value); });
    wrap.appendChild(sel);

    var bar = document.querySelector(".topbar, header");
    var chip = document.getElementById("locChip");
    if (bar && chip && chip.parentNode === bar) bar.insertBefore(wrap, chip);
    else if (bar) bar.appendChild(wrap);
    else { wrap.className = "floating"; document.body.appendChild(wrap); }
  }

  function setLang(l) {
    if (!LANGS[l]) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.setAttribute("lang", l);
    var sel = document.getElementById("langSelect");
    if (sel) sel.value = l;
    walk(document.body);
    doTitle();
  }

  function init() {
    document.documentElement.setAttribute("lang", lang);
    buildPicker();
    walk(document.body);
    doTitle();
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === "characterData") doText(m.target);
        else m.addedNodes.forEach(function (n) { walk(n); });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.WD_I18N = {
    setLang: setLang,
    lang: function () { return lang; },
    missing: function () { return Object.keys(missing); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
