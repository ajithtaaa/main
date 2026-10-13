(function () {
  // Confirm dialogs for destructive buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-confirm]');
    if (btn && !window.confirm(btn.getAttribute('data-confirm'))) e.preventDefault();

    var copy = e.target.closest('[data-copy]');
    if (copy) {
      var text = copy.getAttribute('data-copy');
      var done = function () { var t = copy.textContent; copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = t; }, 1200); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    }

    var thumb = e.target.closest('[data-thumb]');
    if (thumb) {
      var g = thumb.closest('[data-gallery]');
      g.querySelector('.gallery-main').src = thumb.src;
      g.querySelectorAll('[data-thumb]').forEach(function (t) { t.classList.toggle('active', t === thumb); });
    }
  });

  // UTR input: digits only + counter
  var utr = document.getElementById('utr');
  if (utr) {
    var count = document.getElementById('utr-count');
    utr.addEventListener('input', function () {
      utr.value = utr.value.replace(/\D/g, '').slice(0, 12);
      count.textContent = utr.value.length;
      utr.classList.toggle('ok', utr.value.length === 12);
    });
  }

  // Image previews in admin listing form
  var input = document.querySelector('[data-preview]');
  if (input) {
    input.addEventListener('change', function () {
      var box = document.getElementById('preview');
      box.innerHTML = '';
      Array.prototype.slice.call(input.files, 0, 8).forEach(function (f) {
        var img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        var wrap = document.createElement('div');
        wrap.className = 'img-item';
        wrap.appendChild(img);
        box.appendChild(wrap);
      });
    });
  }
})();
