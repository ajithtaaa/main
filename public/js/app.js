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

  // Transaction ID input: letters and digits only, upper-case, with a counter
  var utr = document.getElementById('utr');
  if (utr) {
    var count = document.getElementById('utr-count');
    utr.addEventListener('input', function () {
      utr.value = utr.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 35);
      count.textContent = utr.value.length;
      utr.classList.toggle('ok', utr.value.length >= 10);
    });
  }

  // Live countdown on the "rented out within" time bars
  function left(ms) {
    var h = Math.floor(ms / 36e5);
    if (h >= 48) return Math.floor(h / 24) + ' days';
    if (h >= 24) return '1 day ' + (h - 24) + ' hrs';
    if (h >= 1) return h + ' hrs ' + Math.floor((ms % 36e5) / 6e4) + ' min';
    return Math.max(1, Math.floor(ms / 6e4)) + ' min';
  }
  var bars = document.querySelectorAll('[data-deadline]');
  function tick() {
    bars.forEach(function (bar) {
      var ms = new Date(bar.getAttribute('data-deadline')).getTime() - Date.now();
      var out = bar.querySelector('[data-left]');
      if (ms <= 0) {
        bar.classList.add('done');
        bar.querySelector('.tb-label').textContent = 'Time is up – this property may already be taken';
        return;
      }
      if (out) out.textContent = left(ms);
      var fill = bar.querySelector('.tb-track span');
      if (fill) fill.style.width = Math.max(3, Math.min(100, Math.round(ms / (7 * 864e5) * 100))) + '%';
      bar.classList.toggle('urgent', ms < 24 * 36e5);
    });
  }
  if (bars.length) setInterval(tick, 30000);

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

// Shrink photos in the browser before upload. Hosting limits (Vercel: 4.5 MB per request)
// make 8 phone photos impossible to send as-is; 1600px JPEGs are ~200–400 KB each.
(function () {
  var MAX = 1600;
  function shrink(file, type) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type)) return resolve(file);
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var k = Math.min(1, MAX / Math.max(img.width, img.height));
        if (k === 1 && file.size < 600 * 1024) return resolve(file);
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var mime = type === 'png' ? 'image/png' : 'image/jpeg';
        c.toBlob(function (blob) {
          if (!blob) return resolve(file);
          var name = file.name.replace(/\.[^.]+$/, '') + (mime === 'image/png' ? '.png' : '.jpg');
          resolve(new File([blob], name, { type: mime }));
        }, mime, 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }
  document.querySelectorAll('input[type=file][data-compress]').forEach(function (input) {
    if (typeof DataTransfer === 'undefined') return;
    input.addEventListener('change', function () {
      if (input.dataset.busy) return;
      var form = input.form;
      var btns = form ? form.querySelectorAll('button') : [];
      btns.forEach(function (b) { b.disabled = true; });
      var type = input.getAttribute('data-compress');
      Promise.all(Array.prototype.slice.call(input.files, 0, 8).map(function (f) { return shrink(f, type); })).then(function (files) {
        var dt = new DataTransfer();
        files.forEach(function (f) { dt.items.add(f); });
        input.dataset.busy = '1';
        input.files = dt.files;
        delete input.dataset.busy;
      }).finally(function () { btns.forEach(function (b) { b.disabled = false; }); });
    });
  });
})();

// Admin listing form: quick-set the "rented out within" deadline (Kochi time)
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-sellby]');
  if (!b) return;
  var input = document.getElementById('sell_by');
  var days = Number(b.getAttribute('data-sellby'));
  if (!days) { input.value = ''; return; }
  var ist = new Date(Date.now() + days * 864e5 + 5.5 * 36e5);
  input.value = ist.toISOString().slice(0, 16);
});
