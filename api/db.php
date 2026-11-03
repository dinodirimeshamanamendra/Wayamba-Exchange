<?php
require_once __DIR__ . '/config.php';

/**
 * Returns one shared PDO connection (MySQL).
 * WX_DSN is only used for automated testing; leave it unset normally.
 */
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $testDsn = getenv('WX_DSN');
    if ($testDsn) {
        $pdo = new PDO($testDsn);
    } else {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
    }
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
}
