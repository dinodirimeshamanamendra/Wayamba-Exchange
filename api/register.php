<?php
// POST: create a new student account.
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_post();

$in = read_json();
$name      = trim((string) ($in['full_name'] ?? ''));
$studentId = strtoupper(trim((string) ($in['student_id'] ?? '')));
$faculty   = (string) ($in['faculty'] ?? '');
$contact   = preg_replace('/[\s-]/', '', (string) ($in['contact'] ?? ''));
$password  = (string) ($in['password'] ?? '');
$confirm   = (string) ($in['password_confirm'] ?? '');

$errors = [];
if (mb_strlen($name) < 3 || mb_strlen($name) > 100) {
    $errors[] = 'Enter your full name (3 to 100 characters).';
}
if (!preg_match('/^[A-Z0-9\/\-]{4,20}$/', $studentId)) {
    $errors[] = 'Enter a valid Student ID (4 to 20 letters, numbers, / or -).';
}
if (!in_array($faculty, $FACULTIES, true)) {
    $errors[] = 'Select your faculty.';
}
if (!preg_match('/^0\d{9}$/', $contact)) {
    $errors[] = 'Enter a 10 digit contact number, for example 0712345678.';
}
if (strlen($password) < 8) {
    $errors[] = 'Your password must have at least 8 characters.';
}
if ($password !== $confirm) {
    $errors[] = 'The two passwords do not match.';
}
if (empty($in['agree'])) {
    $errors[] = 'Please tick the agreement box.';
}
if ($errors) {
    json_out(['ok' => false, 'errors' => $errors], 422);
}

try {
    $check = db()->prepare('SELECT 1 FROM users WHERE student_id = ?');
    $check->execute([$studentId]);
    if ($check->fetchColumn()) {
        json_out(['ok' => false, 'errors' => ['This Student ID is already registered. Try logging in.']], 409);
    }
    $insert = db()->prepare(
        "INSERT INTO users (student_id, full_name, faculty, contact, password_hash, role)
         VALUES (?, ?, ?, ?, ?, 'student')"
    );
    $insert->execute([$studentId, $name, $faculty, $contact, password_hash($password, PASSWORD_DEFAULT)]);
} catch (PDOException $ex) {
    // 23000 = the same Student ID was registered at the same moment
    $msg = $ex->getCode() === '23000'
        ? 'This Student ID is already registered. Try logging in.'
        : 'Something went wrong while saving your account. Please try again.';
    json_out(['ok' => false, 'errors' => [$msg]], 500);
}

json_out(['ok' => true]);
