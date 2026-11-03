<?php
// Creates an administrator account. Run once from the command line:
//   php create_admin.php ADMIN001 "Admin Name" "StrongPassword123"
// Delete this file after use if the project is ever put on a real server.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Run this file from the command line only.');
}
if ($argc < 4) {
    exit("Usage: php create_admin.php <StudentOrStaffID> \"<Full name>\" \"<Password>\"\n");
}

require_once __DIR__ . '/api/db.php';

[$script, $id, $name, $password] = $argv;
if (strlen($password) < 8) {
    exit("Password must be at least 8 characters.\n");
}

$stmt = db()->prepare(
    "INSERT INTO users (student_id, full_name, faculty, contact, password_hash, role)
     VALUES (?, ?, 'Administration', '0000000000', ?, 'admin')"
);
$stmt->execute([strtoupper($id), $name, password_hash($password, PASSWORD_DEFAULT)]);
echo "Admin account created: " . strtoupper($id) . "\n";
