(function () {
  // v4: Sincronização central via config/motels (público) e catalog_* (v02)
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
      suitemalibu: "suitemalibucancun",
      suitemalibucancun: "suitemalibucancun",
      suitecancun: "suitemalibucancun",
      suitemaui: "suitemauicadeirante",
      suitemauicadeirante: "suitemauicadeirante",
      suitefortaleza: "suitefortaleza",
      suiteceara: "suiteceara",
      suitemandala: "suitemandala",
      suitemaster: "suitedelirius",
      suiteromantica: "suiteromantica",
      suiteformula1: "suiteformula1",
      suitef1: "suiteformula1",
      suitetahiti: "suitetahiti",
      suitejade: "suitejade",
      suitesafira: "suitesafira",
      suiterubi: "suiterubi",
      suiteesmeralda: "suiteesmeralda",
      suitediamante: "suitediamante",
      suitenice: "suitenice",
      suitemonaco: "suitemonaco",
      suiteparis: "suiteparis",
      suitesucesso: "suitesucesso",
      suitefelicidade: "suitefelicidade",
      suiteinspiracao: "suiteinspiracao",
      suitesonho: "suitesonho",
      suitefantasia: "suitefantasia",
      suitesonhoamado: "suitesonhoamado",
      suitesonhomolhado: "suitesonhomolhado",
      suitehonolulu: "suitehonolulu",
      suitekauai: "suitekauai"
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
    var num = numberValue(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  }

  function decodeFirestoreFields(fields) {
    if (!fields || typeof fields !== "object") return fields;
    var res = {};
    Object.keys(fields).forEach(function (k) {
      var v = fields[k];
      if (v.stringValue !== undefined) res[k] = v.stringValue;
      else if (v.integerValue !== undefined) res[k] = Number(v.integerValue);
      else if (v.doubleValue !== undefined) res[k] = Number(v.doubleValue);
      else if (v.booleanValue !== undefined) res[k] = Boolean(v.booleanValue);
      else if (v.mapValue && v.mapValue.fields) res[k] = decodeFirestoreFields(v.mapValue.fields);
      else if (v.arrayValue) res[k] = (v.arrayValue.values || []).map(function (item) {
        return item.mapValue ? decodeFirestoreFields(item.mapValue.fields) : (item.stringValue || item.integerValue || item.doubleValue || item);
      });
      else res[k] = v;
    });
    return res;
  }

  function rowsFromConfigMotels(configData) {
    var rows = [];
    var motelsObj = configData && configData.motels && typeof configData.motels === "object" ? configData.motels : configData;
    if (!motelsObj || typeof motelsObj !== "object") return rows;
    Object.keys(motelsObj).forEach(function (mKey) {
      var motel = motelsObj[mKey];
      if (!motel || !Array.isArray(motel.suites)) return;
      var mKeyNorm = motelKey(mKey);
      motel.suites.forEach(function (suite) {
        if (!suite) return;
        var p3 = numberValue(suite.preco3 || suite.price3h || suite.priceRotativo || suite.preco || 0);
        var p6 = numberValue(suite.preco6 || suite.price6h || 0);
        var p12 = numberValue(suite.preco12 || suite.price12h || suite.pricePernoite || 0);
        var p24 = numberValue(suite.preco24 || suite.price24h || 0);
        var fracao = numberValue(suite.fracao || suite.hora_adicional || suite.preco_hora_adicional || 0);
        rows.push({
          motel: mKeyNorm,
          suite: suiteKey(suite.nome || suite.name || ""),
          rawName: suite.nome || suite.name || "",
          price3: p3,
          price6: p6,
          price12: p12,
          price24: p24,
          additionalHour: fracao
        });
      });
    });
    return rows;
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
        rawName: suite.nome || suite.name || suite.id,
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
      return row.motel === motelKeyValue && (
        row.suite === suiteKeyValue ||
        row.suite.indexOf(suiteKeyValue) !== -1 ||
        suiteKeyValue.indexOf(row.suite) !== -1
      );
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
    if (!rows || !rows.length) return;

    // Atualiza [data-suite-name] e [data-dynamic-price]
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

    // Atualiza nós com data-dynamic-price direto (ex: site-moteis-fortaleza-novo/index.html)
    document.querySelectorAll("[data-dynamic-price]").forEach(function (node) {
      if (node.dataset.suite) {
        var row = findRow(rows, node.dataset.motel || motelHint, node.dataset.catalogSuite || node.dataset.suite);
        var amount = priceFor(row, node.dataset.priceDuration || "3h");
        if (row && amount > 0) {
          var suiteName = node.dataset.suite;
          node.textContent = suiteName + " - " + money(amount);
        }
      }
    });

    // Atualiza [data-catalog-price]
    document.querySelectorAll("[data-catalog-price]").forEach(function (node) {
      var row = findRow(rows, node.dataset.catalogMotel || motelHint, node.dataset.catalogSuite || node.dataset.suite);
      var amount = priceFor(row, node.dataset.priceDuration || "3h");
      if (row && amount > 0) node.textContent = money(amount);
    });

    // Atualiza [data-dynamic-from]
    document.querySelectorAll("[data-dynamic-from]").forEach(function (node) {
      var mTarget = motelKey(node.dataset.catalogMotel || motelHint);
      var prices = rows.filter(function (row) {
        return row.motel === mTarget && row.price3 > 0;
      }).map(function (row) { return row.price3; });
      if (prices.length) {
        node.textContent = money(Math.min.apply(Math, prices));
      }
    });

    // Atualiza nós de detalhes do site ([data-suite-price] e [data-rate-suite]) se existirem
    document.querySelectorAll("[data-suite-price]").forEach(function (element) {
      var row = findRow(rows, document.body.dataset.motelKey || motelHint, element.dataset.suite);
      if (row && row.price3 > 0) {
        element.innerHTML = '<i class="fa fa-tag"></i> ' + money(row.price3) + ' / 3h';
      }
    });

    updateLegacySiteArray(rows);
    window.dispatchEvent(new CustomEvent("catalog:updated", { detail: { rows: rows.length } }));
  }

  function start() {
    // 1. Fetch REST imediato para resposta ultrarrápida
    var restEndpoint = "https://firestore.googleapis.com/v1/projects/moteisfortaleza-9dadd/databases/(default)/documents/config/motels";
    fetch(restEndpoint, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (docData) {
        var decoded = decodeFirestoreFields(docData.fields || {});
        if (decoded) {
          var rows = rowsFromConfigMotels(decoded);
          if (rows.length > 0) updateMarkedNodes(rows);
        }
      })
      .catch(function () {
        // Fallback silencioso mantendo conteúdo pré-renderizado
      });

    // 2. Realtime listener via Firebase SDK
    if (!window.firebase || !firebase.firestore) {
      return;
    }
    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      var db = firebase.firestore();

      // Escuta documento config/motels (público e em tempo real)
      db.collection("config").doc("motels").onSnapshot(function (snapshot) {
        if (snapshot.exists) {
          var rows = rowsFromConfigMotels(snapshot.data());
          if (rows.length > 0) updateMarkedNodes(rows);
        }
      }, function (error) {
        console.warn("Realtime config/motels indisponível:", error);
      });

      // Também escuta catalog_* se estiverem disponíveis
      var state = { motels: null, suites: null, rates: null };
      function renderCentral() {
        if (!state.motels || !state.suites || !state.rates) return;
        var rows = rowsFromCentralCatalog(state.motels, state.suites, state.rates);
        if (rows.length > 0) updateMarkedNodes(rows);
      }
      function subscribeCentral(name, collection) {
        return db.collection(collection).where("ativo", "==", true).onSnapshot(function (snapshot) {
          state[name] = snapshot.docs.map(function (doc) { return { id: doc.id, ...doc.data() }; });
          renderCentral();
        }, function () {
          // Ignorado se anônimo não tiver permissão de query
        });
      }
      subscribeCentral("motels", "catalog_motels");
      subscribeCentral("suites", "catalog_suites");
      subscribeCentral("rates", "catalog_rates");
    } catch (error) {
      console.warn("Falha ao iniciar sincronizador de catálogo:", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}());
