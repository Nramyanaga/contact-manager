<?php
$DB_HOST = "127.0.0.1";   // use IP to avoid socket issues
$DB_USER = "root";        // XAMPP default
$DB_PASS = "";            // XAMPP default is empty
$DB_NAME = "cop4331_dev"; // your local DB name
$DB_PORT = 3306;

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode(["error" => "DB connect failed: ".$conn->connect_error]));
}
header("Content-Type: application/json");
