(function () {
  "use strict";

  var script = document.currentScript;
  var motelHint = script && script.dataset ? (script.dataset.catalogMotel || "") : "";
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
      .replace(/motel/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }

  function suiteKey(value) {
    var key = normalize(value);
    var aliases = {
      suiteborabora: "suiteborabora",
      suitemalibu: "suitemalibu",
      suitemalibucancun: "suitemalibucancun",
      suitecancun: "suitecancun",
      suitefortaleza: "suitefortaleza",
      suiteceara: "suiteceara",
      suitemandala: "suitemandala",
      suitemaster: "suitedelirius"
    };
    return aliases[key] || key;
  }

  function motelKey(value) {
    var key = normalize(value);
    if (key.indexOf("assahi") !== -1) return "assahi";
    if (key.indexOf("dragon") !== -1) return "dragon";
    if (key.indexOf("dreams") !== -1) return "dreams";
    if (key.indexOf("spa") !== -1) return "spaurbano";
    return key;
  }

  function numberValue(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    var normalized = String(value).replace(/[^0-9,.-]/g, "").replace(",", ".");
    var amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }

  function money(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue(value));
  }

  function rowsFromCentralCatalog(motels, suites, rates) {
    var motelById = {};
    var ratesBySuite = {};
    var rows = [];

    motels.forEach(function (motel) {
      motelById[motel.id] = motel;
    });
    rates.forEach(function (rate) {
      if (rate.ativo === false || !rate.suiteId) return;
      if (!ratesBySuite[rate.suiteId]) ratesBySuite[rate.suiteId] = [];
      ratesBySuite[rate.suiteId].push(rate);
    });

    suites.forEach(function (suite) {
      if (suite.ativo === false || suite.status === "arquivada") return;
      var motel = motelById[suite.motelId];
      if (!motel) return;
      var suiteRates = ratesBySuite[suite.id] || [];
      function rate(hours, type) {
        return suiteRates.find(function (item) {
          return (item.tipo || "periodo") === (type || "periodo") && Number(item.duracaoHoras) === hours;
        });
      }
      rows.push({
        motel: motelKey(motel.nome || motel.name || motel.id),
        suite: suiteKey(suite.nome || suite.name || suite.id),
        price3: numberValue(rate(3)?.valor ?? suite.preco3),
        price6: numberValue(rate(6)?.valor ?? suite.preco6),
        price12: numberValue(rate(12)?.valor ?? suite.preco12),
        price24: numberValue(rate(24)?.valor ?? suite.preco24),
        additionalHour: numberValue(rate(1, "fracao_adicional")?.valor ?? suite.fracao)
      });
    });
    return rows;
  }

  function priceFor(row, duration) {
    if (!row) return 0;
    if (duration === "6h") return row.price6 || row.price3;
    if (duration === "24h") return row.price24 || row.price12 || row.price3;
    if (duration === "12h" || duration === "pernoite") return row.price12 || row.price3;
    return row.price3;
  }

  function findRow(rows, motel, suite) {
    var motelKeyValue = motelKey(motel || motelHint);
    var suiteKeyValue = suiteKey(suite);
    return rows.find(function (row) {
      return row.motel === motelKeyValue && row.suite === suiteKeyValue;
    });
  }

  function updateLegacySiteArray(rows) {
    if (!Array.isArray(window.suitesData)) return;
    window.suitesData.forEach(function (item) {
      var row = findRow(rows, item.key || item.motel, item.suite);
      if (!row) return;
      item.preco = money(row.price3);
      item.preco6 = row.price6 ? money(row.price6) : null;
      item.preco12 = row.price12 ? money(row.price12) : null;
      item.preco24 = row.price24 ? money(row.price24) : null;
    });
  }

  function updateMarkedNodes(rows) {
    document.querySelectorAll("[data-suite-name]").forEach(function (title) {
      var row = findRow(rows, title.dataset.catalogMotel || motelHint, title.dataset.suiteName || title.textContent);
      if (!row) return;
      var priceNode = title.closest("[data-suite-card], .suite-card, article, .room-item")?.querySelector("[data-dynamic-price], .suite-price");
      var duration = priceNode?.dataset.priceDuration || title.dataset.priceDuration || "3h";
      var amount = priceFor(row, duration);
      if (priceNode && amount > 0) {
        priceNode.textContent = money(amount);
        priceNode.setAttribute("aria-label", "Preço de " + duration + ": " + money(amount));
      }
    });

    document.querySelectorAll("[data-catalog-price]").forEach(function (node) {
      var row = findRow(rows, node.dataset.catalogMotel || motelHint, node.dataset.catalogSuite || node.dataset.suite);
      var amount = priceFor(row, node.dataset.priceDuration || "3h");
      if (row && amount > 0) node.textContent = money(amount);
    });

    document.querySelectorAll("[data-dynamic-from]").forEach(function (node) {
      var prices = rows.filter(function (row) {
        return row.motel === motelKey(node.dataset.catalogMotel || motelHint) && row.price3 > 0;
      }).map(function (row) { return row.price3; });
      if (prices.length) node.textContent = money(Math.min.apply(Math, prices));
    });

    updateLegacySiteArray(rows);
    window.dispatchEvent(new CustomEvent("catalog:updated", { detail: { rows: rows.length } }));
  }

  function start() {
    if (!window.firebase || !firebase.firestore) {
      console.warn("Catálogo central indisponível; mantendo preços publicados.");
      return;
    }
    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      var db = firebase.firestore();
      var state = { motels: null, suites: null, rates: null };
      function render() {
        if (!state.motels || !state.suites || !state.rates) return;
        updateMarkedNodes(rowsFromCentralCatalog(state.motels, state.suites, state.rates));
      }
      function subscribe(name, collection) {
        return db.collection(collection).where("ativo", "==", true).onSnapshot(function (snapshot) {
          state[name] = snapshot.docs.map(function (doc) { return { id: doc.id, ...doc.data() }; });
          render();
        }, function (error) {
          console.warn("Não foi possível ler " + collection + ":", error);
        });
      }
      subscribe("motels", "catalog_motels");
      subscribe("suites", "catalog_suites");
      subscribe("rates", "catalog_rates");
    } catch (error) {
      console.warn("Falha ao iniciar o catálogo central:", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}());
