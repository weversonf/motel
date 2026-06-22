// components.js - Footer and WhatsApp popup components

function getBasePath() {
  var path = window.location.pathname;
  if (path.includes('/motel/') || path.includes('/suite/')) {
    return '../';
  }
  return '';
}

function getFooterHTML() {
  var base = getBasePath();

  return '<footer class="footer">' +
    '<div class="container">' +
      '<div class="footer-grid">' +
        '<div class="footer-brand">' +
          '<h3><img src="' + base + 'img/logo.png" alt="Motéis Fortaleza" style="height: 30px; width: auto;">Motéis Fortaleza</h3>' +
          '<p>O melhor guia de motéis de Fortaleza. Encontre a suíte perfeita para seu momento especial. Conforto, privacidade e momentos inesquecíveis.</p>' +
        '</div>' +
        '<div>' +
          '<h4>Motéis</h4>' +
          '<ul>' +
            '<li><a href="' + base + 'motel/dragon-motel.html">Dragon Motel</a></li>' +
            '<li><a href="' + base + 'motel/assahi-motel.html">Assahi Motel</a></li>' +
            '<li><a href="' + base + 'motel/dreams-motel.html">Dreams Motel</a></li>' +
            '<li><a href="' + base + 'motel/spa-urbano.html">Spa Urbano</a></li>' +
          '</ul>' +
        '</div>' +
        '<div>' +
          '<h4>Links</h4>' +
          '<ul>' +
            '<li><a href="' + base + 'index.html">Início</a></li>' +
            '<li><a href="' + base + 'contato.html">Contato</a></li>' +
            '<li><a href="' + base + 'politicas.html">Políticas</a></li>' +
          '</ul>' +
        '</div>' +
        '<div>' +
          '<h4>Contato</h4>' +
          '<ul>' +
            '<li><a href="https://wa.me/558587740048" target="_blank">WhatsApp: (85) 8774-0048</a></li>' +
            '<li><a href="tel:8532730600">Tel: (85) 3273-0600</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<p>&copy; 2026 Motéis Fortaleza. Todos os direitos reservados.</p>' +
        '<div class="footer-social">' +
          '<a href="#" aria-label="Facebook">📘</a>' +
          '<a href="#" aria-label="Instagram">📷</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</footer>';
}

function getWAPopupHTML() {
  return '<button class="whatsapp-float" aria-label="Atendimento">&#x1F4AC;</button>' +
    '<div class="wa-overlay"></div>' +
    '<div class="wa-popup">' +
      '<div class="wa-popup-header">' +
        '<h3>&#x1F4AC; Atendimento</h3>' +
        '<button class="wa-popup-close">&times;</button>' +
      '</div>' +
      '<a href="https://weversonf.github.io/motel/" target="_blank" class="wa-popup-btn wa-popup-btn-chat">' +
        '<div class="wa-popup-icon">&#x1F916;</div>' +
        '<div>Auto Atendimento <br><small style="opacity:.8">Reservas online</small></div>' +
      '</a>' +
      '<a href="https://wa.me/558587740048?text=Vim%20do%20site%20e.." target="_blank" class="wa-popup-btn wa-popup-btn-whatsapp">' +
        '<div class="wa-popup-icon">&#x1F4AC;</div>' +
        '<div>WhatsApp <br><small style="opacity:.8">Falar com atendente</small></div>' +
      '</a>' +
    '</div>';
}

// Inject components
document.addEventListener('DOMContentLoaded', function() {
  var footerTarget = document.getElementById('site-footer');
  if (footerTarget) {
    footerTarget.innerHTML = getFooterHTML();
  }

  var waTarget = document.getElementById('site-wa-popup');
  if (waTarget) {
    waTarget.innerHTML = getWAPopupHTML();
  }

  // Initialize WhatsApp popup events
  setTimeout(function() {
    var waBtn = document.querySelector('.whatsapp-float');
    var waPopup = document.querySelector('.wa-popup');
    var waOverlay = document.querySelector('.wa-overlay');
    if (waBtn && waPopup) {
      waBtn.addEventListener('click', function(e) {
        e.preventDefault();
        waPopup.classList.add('open');
        if (waOverlay) waOverlay.classList.add('open');
      });
      var closePopup = function() {
        waPopup.classList.remove('open');
        if (waOverlay) waOverlay.classList.remove('open');
      };
      if (waOverlay) waOverlay.addEventListener('click', closePopup);
      document.querySelectorAll('.wa-popup-close').forEach(function(el) {
        el.addEventListener('click', closePopup);
      });
    }
  }, 200);
});
