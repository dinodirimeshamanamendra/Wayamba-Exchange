// Log in page: checks the form, then sends it to api/login.php
(function () {
  'use strict';
  var form = document.getElementById('login-form');
  var alertBox = document.getElementById('form-alert');
  var button = document.getElementById('submit-btn');
  function $(id) { return document.getElementById(id); }

  WX.initPasswordToggles();

  // Already logged in? Go to the right page. Also gets the CSRF token.
  WX.me().then(function (me) {
    if (me.logged_in) location.replace(me.home);
  }).catch(function () {
    WX.showAlert(alertBox, 'error', ['Cannot reach the server. Check that Apache and MySQL are running.']);
  });

  // Message shown after a successful sign up
  if (new URLSearchParams(location.search).has('registered')) {
    WX.showAlert(alertBox, 'ok', ['Your account has been created. You can log in now.']);
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = true;
    if (!WX.STUDENT_ID.test($('student_id').value.trim())) {
      WX.setError($('student_id'), 'Enter a valid Student ID (4 to 20 letters, numbers, / or -).'); ok = false;
    } else { WX.setError($('student_id'), ''); }
    if (!$('password').value) {
      WX.setError($('password'), 'Enter your password.'); ok = false;
    } else { WX.setError($('password'), ''); }
    if (!ok) return;

    alertBox.hidden = true;
    button.disabled = true;
    button.textContent = 'Logging in...';
    WX.post('login.php', {
      student_id: $('student_id').value.trim(),
      password: $('password').value,
      remember: $('remember').checked
    }).then(function (res) {
      if (res.ok) {
        location.href = res.redirect;
      } else {
        WX.showAlert(alertBox, 'error', res.errors || ['Something went wrong. Please try again.']);
        button.disabled = false;
        button.textContent = 'Log in';
        // After a wrong attempt the server may have changed the token, so refresh it
        WX.me();
      }
    });
  });
})();
