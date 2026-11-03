<?php
// POST: log a student or administrator in.
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_post();

const MAX_FAILS = 5;       // wrong attempts allowed
const LOCK_SECONDS = 120;  // wait time after too many wrong attempts

$in        = read_json();
$studentId = strtoupper(trim((string) ($in['student_id'] ?? '')));
$password  = (string) ($in['password'] ?? '');

if (($_SESSION['lock_until'] ?? 0) > time()) {
    $wait = $_SESSION['lock_until'] - time();
    json_out(['ok' => false, 'errors' => ["Too many wrong attempts. Please wait $wait seconds and try again."]], 429);
}
if ($studentId === '' || $password === '') {
    json_out(['ok' => false, 'errors' => ['Enter your Student ID and password.']], 422);
}

$stmt = db()->prepare('SELECT * FROM users WHERE student_id = ?');
$stmt->execute([$studentId]);
$row = $stmt->fetch();

// Always run password_verify so the response time does not reveal if the ID exists.
$hash  = $row['password_hash'] ?? '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
$valid = password_verify($password, $hash) && $row;

if (!$valid) {
    $_SESSION['fails'] = ($_SESSION['fails'] ?? 0) + 1;
    if ($_SESSION['fails'] >= MAX_FAILS) {
        $_SESSION['lock_until'] = time() + LOCK_SECONDS;
        $_SESSION['fails'] = 0;
    }
    json_out(['ok' => false, 'errors' => ['Incorrect Student ID or password.']], 401);
}
if ($row['status'] !== 'active') {
    json_out(['ok' => false, 'errors' => ['This account is suspended. Please contact the administrators.']], 403);
}

session_regenerate_id(true);
unset($_SESSION['fails'], $_SESSION['lock_until']);
$_SESSION['user'] = ['id' => (int) $row['id'], 'role' => $row['role']];
$_SESSION['csrf'] = bin2hex(random_bytes(32));

db()->prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
    ->execute([date('Y-m-d H:i:s'), $row['id']]);

if (!empty($in['remember'])) {   // keep the login for 30 days
    setcookie(session_name(), session_id(), [
        'expires' => time() + 60 * 60 * 24 * 30,
        'path' => '/', 'httponly' => true, 'samesite' => 'Lax',
    ]);
}

json_out(['ok' => true, 'redirect' => home_for_role($row['role'])]);
