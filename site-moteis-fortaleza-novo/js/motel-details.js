(function () {
  "use strict";

  var CHAT_URL = "https://reservas.moteisfortaleza.com/";
  var firebaseConfig = {
    apiKey: "AIzaSyCln4mcb1j46UcmG-sTVb3bUudTQCpdfvY",
    authDomain: "moteisfortaleza-9dadd.firebaseapp.com",
    projectId: "moteisfortaleza-9dadd",
    storageBucket: "moteisfortaleza-9dadd.firebasestorage.app",
    messagingSenderId: "285292896374",
    appId: "1:285292896374:web:ef6d3ad37e94313ad3bf57"
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function motelKey(value) {
    var name = normalize(value);
    if (name.indexOf("assahi") !== -1) return "assahi";
    if (name.indexOf("dragon") !== -1) return "dragon";
    if (name.indexOf("dreams") !== -1) return "dreams";
    if (name.indexOf("spa") !== -1) return "spa";
    return name;
  }

  function suiteKey(value) {
    var name = normalize(value);
    var aliases = {
      "suite master": "suite delirius",
      "suite economica": "suite delirius",
      "suite bora bora": "suite bora bora",
      "suite bora bora ": "suite bora bora"
    };
    return aliases[name] || name;
  }

  function numericValue(value) {
    if (value === null || value === undefined || value === "") return null;
    var amount = Number(String(value).replace(/[^0-9,.-]/g, "").replace(",", "."));
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  }

  function currency(value) {
    var amount = numericValue(value);
    return amount === null ? null : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  }

  function decodeFirestoreValue(value) {
    if (!value || typeof value !== "object") return value;
    if (Object.prototype.hasOwnProperty.call(value, "stringValue")) return value.stringValue;
    if (Object.prototype.hasOwnProperty.call(value, "integerValue")) return Number(value.integerValue);
    if (Object.prototype.hasOwnProperty.call(value, "doubleValue")) return Number(value.doubleValue);
    if (Object.prototype.hasOwnProperty.call(value, "booleanValue")) return Boolean(value.booleanValue);
    if (Object.prototype.hasOwnProperty.call(value, "timestampValue")) return value.timestampValue;
    if (value.arrayValue) return (value.arrayValue.values || []).map(decodeFirestoreValue);
    if (value.mapValue) {
      var fields = value.mapValue.fields || {};
      return Object.keys(fields).reduce(function (result, key) {
        result[key] = decodeFirestoreValue(fields[key]);
        return result;
      }, {});
    }
    return null;
  }

  function catalogSuiteMatches(catalogSuite, pageSuite) {
    var catalogName = suiteKey(catalogSuite);
    var pageName = suiteKey(pageSuite);
    if (catalogName === pageName) return true;
    // O catálogo atual publica Malibú/Cancún em uma única entrada.
    return (catalogName.indexOf("malibu") !== -1 && pageName.indexOf("malibu") !== -1) ||
      (catalogName.indexOf("cancun") !== -1 && pageName.indexOf("cancun") !== -1);
  }

  function extractCatalog(data) {
    var catalog = data && data.motels && typeof data.motels === "object" ? data.motels : data;
    var result = [];
    if (!catalog || typeof catalog !== "object") return result;

    Object.keys(catalog).forEach(function (name) {
      var motel = catalog[name];
      if (!motel || typeof motel !== "object" || !Array.isArray(motel.suites)) return;
      motel.suites.forEach(function (suite) {
        if (!suite || typeof suite !== "object") return;
        var amount3 = numericValue(suite.preco3 ?? suite.price3h ?? suite.priceRotativo ?? suite.preco);
        if (amount3 === null) return;
        result.push({
          motel: motelKey(name),
          suite: suiteKey(suite.nome || suite.name || suite.suite),
          preco3: amount3,
          preco6: numericValue(suite.preco6 ?? suite.price6h),
          preco12: numericValue(suite.preco12 ?? suite.price12h ?? suite.pricePernoite ?? suite.precoPernoite),
          hora: numericValue(suite.hora_adicional ?? suite.preco_hora_adicional ?? suite.priceAdditionalHour),
          pessoa: numericValue(suite.pessoa_adicional ?? suite.preco_pessoa_adicional ?? suite.priceAdditionalPerson)
        });
      });
    });
    return result;
  }

  function updatePrices(data) {
    var catalog = extractCatalog(data);
    var pageMotel = motelKey(document.body.dataset.motelKey);
    if (!catalog.length) return;

    document.querySelectorAll("[data-suite-price]").forEach(function (element) {
      var match = catalog.find(function (suite) {
        return suite.motel === pageMotel && catalogSuiteMatches(suite.suite, element.dataset.suite);
      });
      if (!match) return;
      element.innerHTML = '<i class="fa fa-tag"></i> ' + currency(match.preco3) + ' / 3h';
    });

    document.querySelectorAll("[data-rate-suite]").forEach(function (row) {
      var match = catalog.find(function (suite) {
        return suite.motel === pageMotel && catalogSuiteMatches(suite.suite, row.dataset.rateSuite);
      });
      if (!match) return;
      var values = {
        "3h": match.preco3,
        "6h": match.preco6,
        "12h": match.preco12,
        "hora": match.hora,
        "pessoa": match.pessoa
      };
      Object.keys(values).forEach(function (key) {
        var cell = row.querySelector('[data-rate-value="' + key + '"]');
        var value = values[key];
        if (cell && value !== null) cell.textContent = currency(value);
      });
    });

    var source = document.querySelector("[data-rate-source]");
    if (source) source.textContent = "Atualizado pelo catálogo central de tarifas.";
  }

  function loadPublicCatalog() {
    var endpoint = "https://firestore.googleapis.com/v1/projects/moteisfortaleza-9dadd/databases/(default)/documents/config/motels";
    fetch(endpoint, { cache: "no-store" })
      .then(function (response) { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); })
      .then(function (documentData) { updatePrices(decodeFirestoreValue({ mapValue: { fields: documentData.fields || {} } })); })
      .catch(function (error) { console.warn("Catálogo público indisponível; usando valores publicados:", error); });
  }

  function initPrices() {
    loadPublicCatalog();
    try {
      if (!window.firebase || !firebase.firestore) return;
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      firebase.firestore().collection("config").doc("motels").onSnapshot(updatePrices, function (error) {
        console.warn("Não foi possível atualizar os preços desta página:", error);
      });
    } catch (error) {
      console.warn("Sincronização de preços indisponível; mantendo valores publicados:", error);
    }
  }

  function initGallery() {
    var lightbox = document.createElement("div");
    lightbox.className = "mf-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Visualização ampliada da foto");
    lightbox.innerHTML = '<button type="button" aria-label="Fechar foto">&times;</button><img alt="" />';
    document.body.appendChild(lightbox);
    var image = lightbox.querySelector("img");
    var close = function () { lightbox.classList.remove("is-visible"); };
    lightbox.addEventListener("click", function (event) { if (event.target === lightbox) close(); });
    lightbox.querySelector("button").addEventListener("click", close);
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") close(); });
    document.querySelectorAll("[data-gallery-image]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        image.src = link.href;
        image.alt = link.dataset.galleryAlt || "Foto da suíte";
        lightbox.classList.add("is-visible");
      });
    });
  }

  function initChatWidget() {
    var widget = document.createElement("div");
    widget.className = "mf-chat-widget";
    widget.innerHTML = '<span class="mf-chat-bubble">Reserve agora</span><div class="mf-chat-panel" aria-hidden="true"><iframe title="Chat de reservas" loading="lazy"></iframe></div><button type="button" class="mf-chat-trigger" aria-label="Abrir chat de reservas"><i class="fa fa-whatsapp" aria-hidden="true"></i></button>';
    document.body.appendChild(widget);
    var panel = widget.querySelector(".mf-chat-panel");
    var trigger = widget.querySelector(".mf-chat-trigger");
    var iframe = widget.querySelector("iframe");
    trigger.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 767px)").matches) {
        window.location.href = CHAT_URL;
        return;
      }
      if (!iframe.src) iframe.src = CHAT_URL;
      var isOpen = panel.classList.toggle("is-open");
      panel.setAttribute("aria-hidden", String(!isOpen));
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initGallery();
    initChatWidget();
    initPrices();
  });
}());
