// Shared front-end code for every page: talking to the PHP API, the header and footer,
// and the small helpers used by the forms.
(function () {
  'use strict';
  var API = 'api/';
  var csrf = '';

  var WX = {
    STUDENT_ID: /^[A-Za-z0-9\/\-]{4,20}$/,
    PHONE: /^0\d{9}$/,

    /** Ask the server who is logged in. Also stores the CSRF token. */
    me: function () {
      return fetch(API + 'me.php', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (d) { csrf = d.csrf || ''; return d; });
    },

    get: function (path) {
      return fetch(API + path, { credentials: 'same-origin' }).then(function (r) { return r.json(); });
    },

    /** Send JSON to the server. Always resolves with {ok, errors, ...}. */
    post: function (path, body) {
      return fetch(API + path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify(body || {})
      }).then(function (r) {
        return r.text().then(function (text) {
          var data;
          try {
            data = JSON.parse(text);
          } catch (error) {
            return {
              ok: false,
              errors: ['The server returned an invalid response. Check the PHP error log.'],
              status: r.status
            };
          }
          data.status = r.status;
          return data;
        });
      }).catch(function () {
        return { ok: false, errors: ['Cannot reach the server. Open this page through http://localhost/wayamba-exchange/signup.html.'] };
      });
    },

    /** Show or clear an error under a form field. */
    setError: function (input, message) {
      var field = input.closest('.field');
      if (!field) return;
      var old = field.querySelector('.error-text');
      if (old) old.remove();
      field.classList.toggle('invalid', !!message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message) {
        var p = document.createElement('span');
        p.className = 'error-text';
        p.setAttribute('role', 'alert');
        p.textContent = message;
        field.appendChild(p);
      }
    },

    /** Show a box with one or more messages. type = "error" or "ok". */
    showAlert: function (box, type, messages) {
      box.innerHTML = '';
      box.className = 'alert alert-' + (type === 'ok' ? 'ok' : 'error');
      box.setAttribute('role', type === 'ok' ? 'status' : 'alert');
      if (messages.length === 1) {
        box.textContent = messages[0];
      } else {
        box.appendChild(document.createTextNode('Please fix the following:'));
        var ul = document.createElement('ul');
        messages.forEach(function (m) {
          var li = document.createElement('li');
          li.textContent = m;
          ul.appendChild(li);
        });
        box.appendChild(ul);
      }
      box.hidden = false;
    },

    /** Show / Hide buttons inside password boxes. */
    initPasswordToggles: function () {
      document.querySelectorAll('.pw-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var input = document.getElementById(btn.getAttribute('data-target'));
          var show = input.type === 'password';
          input.type = show ? 'text' : 'password';
          btn.textContent = show ? 'Hide' : 'Show';
        });
      });
    },

    /** Site header with links that depend on whether someone is logged in. */
    renderHeader: function (me, active) {
      var host = document.getElementById('site-header');
      if (!host) return;
      var links =
        '<a href="index.html"' + (active === 'home' ? ' class="active"' : '') + '>Home</a>' +
        '<a href="index.html#about">About us</a>' +
        '<a href="index.html#contact">Contact us</a>';
      if (me && me.logged_in) {
        var label = me.user.role === 'admin' ? 'Dashboard' : 'My profile';
        links += '<a href="' + me.home + '"' + (active === 'account' ? ' class="active"' : '') + '>' + label + '</a>' +
                 '<button class="btn btn-outline" type="button" id="logout-btn">Log out</button>';
      } else {
        links += '<a class="btn btn-outline" href="login.html">Log in</a>' +
                 '<a class="btn btn-primary" href="signup.html">Sign up</a>';
      }
      host.className = 'site-header';
      host.innerHTML =
        '<div class="wrap">' +
        '<a class="brand" href="index.html"><span class="brand-mark">WX</span>' +
        '<span class="brand-text"><strong>Wayamba Exchange</strong><span>Wayamba University of Sri Lanka</span></span></a>' +
        '<nav class="nav" aria-label="Main">' + links + '</nav></div>';

      var out = document.getElementById('logout-btn');
      if (out) {
        out.addEventListener('click', function () {
          WX.post('logout.php').then(function () { location.href = 'index.html'; });
        });
      }
    },

    renderFooter: function () {
      var host = document.getElementById('site-footer');
      if (!host) return;
      host.className = 'site-footer';
      host.innerHTML =
        '<div class="wrap"><span>Wayamba Exchange · A student platform for Wayamba University of Sri Lanka</span>' +
        '<span><a href="index.html">Home</a> &nbsp; <a href="index.html#about">About us</a> &nbsp; ' +
        '<a href="index.html#contact">Contact us</a></span></div>';
    }
  };

  window.WX = WX;
})();
