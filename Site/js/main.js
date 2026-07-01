document.addEventListener('DOMContentLoaded', function() {
  // Nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.querySelector('.nav-list');
  if (toggle) {
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      navList.classList.toggle('open');
    });
    document.querySelectorAll('.nav-list a').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('active');
        navList.classList.remove('open');
      });
    });
  }

  // Header scroll effect
  var header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('header-scrolled', window.scrollY > 50);
    });
  }

  // Hero slider
  var slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 1) {
    var current = 0;
    setInterval(function() {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5000);
  }

  // Motel filter
  var filterSelect = document.getElementById('filterMotel');
  if (filterSelect) {
    filterSelect.addEventListener('change', function() {
      var value = this.value;
      var cards = document.querySelectorAll('.motel-card');
      cards.forEach(function(card) {
        if (!value || card.dataset.motel === value) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Scroll animations
  if ('IntersectionObserver' in window) {
    var animElements = document.querySelectorAll('.motel-card, .suite-card, .service-card, .feature-item, .region-card, .contact-info-card');
    var animObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          animObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px', threshold: 0.1 });

    animElements.forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      animObserver.observe(el);
    });

    // Lazy load images
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    var imgObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImages.forEach(function(img) { imgObserver.observe(img); });
  }
});
