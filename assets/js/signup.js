// Sign up page: fills the faculty list, checks the form, then sends it to api/register.php
(function () {
  'use strict';
  var form = document.getElementById('signup-form');
  var alertBox = document.getElementById('form-alert');
  var button = document.getElementById('submit-btn');
  function $(id) { return document.getElementById(id); }

  WX.initPasswordToggles();

  // Already logged in? Go to the right page. Also gets the CSRF token.
  WX.me().then(function (me) {
    if (me.logged_in) location.replace(me.home);
  }).catch(function () {});

  // Faculty list comes from the server (api/config.php)
  WX.get('faculties.php').then(function (d) {
    // The HTML contains the same values so the form remains usable if this request is cached or unavailable.
    if ($('faculty').options.length > 1) return;
    if (!d || !Array.isArray(d.faculties)) {
      throw new Error('Invalid faculty response.');
    }
    d.faculties.forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      $('faculty').appendChild(opt);
    });
  }).catch(function (error) {
    if ($('faculty').options.length <= 1) {
      var message = error && error.message === 'Invalid faculty response.'
        ? 'The server returned an invalid faculty list. Please check the PHP API.'
        : 'Cannot reach the server. Open this page through http://localhost/wayamba-exchange/signup.html.';
      WX.showAlert(alertBox, 'error', [message]);
    }
  });

  /** Quick checks in the browser. The server checks everything again. */
  function validate() {
    var ok = true;

    function rule(id, passes, message) {
      var input = $(id);
      if (passes) { WX.setError(input, ''); } else { WX.setError(input, message); ok = false; }
    }

    rule('full_name', $('full_name').value.trim().length >= 3, 'Enter your full name.');
    rule('student_id', WX.STUDENT_ID.test($('student_id').value.trim()),
      'Enter a valid Student ID (4 to 20 letters, numbers, / or -).');
    rule('faculty', $('faculty').value !== '', 'Select your faculty.');
    rule('contact', WX.PHONE.test($('contact').value.replace(/[\s-]/g, '')),
      'Enter a 10 digit number, for example 0712345678.');
    rule('password', $('password').value.length >= 8, 'Use at least 8 characters.');
    rule('password_confirm',
      $('password_confirm').value !== '' && $('password_confirm').value === $('password').value,
      'Passwords do not match.');

    var agreeField = $('agree-field');
    agreeField.innerHTML = '';
    if (!$('agree').checked) {
      WX.setError($('agree'), '');
      var p = document.createElement('span');
      p.className = 'error-text';
      p.setAttribute('role', 'alert');
      p.textContent = 'Please tick the agreement box.';
      agreeField.appendChild(p);
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    alertBox.hidden = true;
    if (!validate()) return;

    button.disabled = true;
    button.textContent = 'Creating account...';
    WX.post('register.php', {
      full_name: $('full_name').value.trim(),
      student_id: $('student_id').value.trim(),
      faculty: $('faculty').value,
      contact: $('contact').value,
      password: $('password').value,
      password_confirm: $('password_confirm').value,
      agree: $('agree').checked
    }).then(function (res) {
      if (res.ok) {
        location.href = 'login.html?registered=1';
      } else {
        WX.showAlert(alertBox, 'error', res.errors || ['Something went wrong. Please try again.']);
        button.disabled = false;
        button.textContent = 'Create account';
      }
    });
  });
})();
