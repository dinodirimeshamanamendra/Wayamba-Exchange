<?php
// GET: the faculty list for the sign up form (one list, kept in config.php).
require_once __DIR__ . '/helpers.php';
json_out(['faculties' => $FACULTIES]);
