<?php
// Shared helpers for every API file: sessions, JSON replies and CSRF protection.
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/** Send a JSON reply and stop. */
function json_out(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Read the JSON body sent by the browser. */
function read_json(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/** Every POST request must be a real POST carrying the CSRF token. */
function require_post(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(['ok' => false, 'errors' => ['Method not allowed.']], 405);
    }
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        json_out(['ok' => false, 'errors' => ['Your session expired. Please reload the page and try again.']], 403);
    }
}

function current_user(): ?array
{
    return $_SESSION['user'] ?? null;
}

function home_for_role(string $role): string
{
    return $role === 'admin' ? 'admin.html' : 'profile.html';
}
