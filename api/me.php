<?php
// GET: tells the browser who is logged in, and gives it the CSRF token for POST requests.
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

$reply = ['logged_in' => false, 'csrf' => csrf_token(), 'user' => null];

$session = current_user();
if ($session) {
    $stmt = db()->prepare(
        'SELECT student_id, full_name, faculty, contact, role, status, created_at FROM users WHERE id = ?'
    );
    $stmt->execute([$session['id']]);
    $row = $stmt->fetch();

    if ($row && $row['status'] === 'active') {
        $reply['logged_in'] = true;
        $reply['user'] = $row;
        $reply['home'] = home_for_role($row['role']);
    } else {                       // account removed or suspended: log out
        $_SESSION = [];
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        $reply['csrf'] = $_SESSION['csrf'];
    }
}
json_out($reply);
