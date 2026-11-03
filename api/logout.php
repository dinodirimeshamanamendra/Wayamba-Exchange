<?php
// POST: log out.
require_once __DIR__ . '/helpers.php';
require_post();

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    setcookie(session_name(), '', time() - 3600, '/');
}
session_destroy();
json_out(['ok' => true]);
