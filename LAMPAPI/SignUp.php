<?php
// File: SignUp.php
// Purpose: Create a new user (FirstName, LastName, Login, Password) and return standard JSON.
// Notes:
//  - Uses MD5 hashing to match your current Users.Password scheme.
//  - Returns the same 4 fields as Login.php: id, firstName, lastName, error.

require_once __DIR__ . '/config.php';

$inData = getRequestInfo();

// Basic input extraction & trimming
$firstName = isset($inData["firstName"]) ? trim($inData["firstName"]) : "";
$lastName  = isset($inData["lastName"])  ? trim($inData["lastName"])  : "";
$login     = isset($inData["login"])     ? trim($inData["login"])     : "";
$password  = isset($inData["password"])  ? (string)$inData["password"] : "";

// Quick validations
if ($firstName === "" || $lastName === "" || $login === "" || $password === "")
{
    returnWithError("All fields (firstName, lastName, login, password) are required.");
    exit;
}

if ($conn->connect_error)
{
    returnWithError($conn->connect_error);
    exit;
}

try
{
    // OPTIONAL pre-check to give a clean message before insert
    $check = $conn->prepare("SELECT 1 FROM Users WHERE Login = ?");
    $check->bind_param("s", $login);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0)
    {
        $check->close();
        returnWithError("Login already exists.");
        $conn->close();
        exit;
    }
    $check->close();

    // Hash the password with MD5 to match existing schema (Users.Password stores MD5 hex)
    // WARNING: MD5 is not secure for real apps; consider password_hash() + a wider column later.
    $passwordHash = md5($password);

    // Insert new user
    $stmt = $conn->prepare(
        "INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param("ssss", $firstName, $lastName, $login, $passwordHash);
    $stmt->execute();

    // Get the new user ID
    $newId = $stmt->insert_id;

    $stmt->close();
    $conn->close();

    // Standard success payload (same shape as Login.php)
    returnWithInfo($firstName, $lastName, (int)$newId);
}
catch (mysqli_sql_exception $ex)
{
    // Handle unique constraint race or other DB issues
    if (isset($ex->errno) && (int)$ex->errno === 1062)
    {
        returnWithError("Login already exists.");
    }
    else
    {
        returnWithError("Database error: " . $ex->getMessage());
    }
}

/* ---------- helpers (match your Login.php pattern) ---------- */

function returnWithError($err)
{
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . escapeJson($err) . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($firstName, $lastName, $id)
{
    // Minimal escaping for JSON string fields
    $retValue = '{"id":' . (int)$id .
                ',"firstName":"' . escapeJson($firstName) .
                '","lastName":"' . escapeJson($lastName) .
                '","error":""}';
    sendResultInfoAsJson($retValue);
}

function escapeJson($s)
{
    // Basic escape for quotes/backslashes/newlines
    return str_replace(
        ['\\',   '"',    "\n",  "\r",  "\t"],
        ['\\\\', '\"',   '\n',  '\r',  '\t'],
        $s
    );
}

function getRequestInfo(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function sendResultInfoAsJson(string $json)
{
    header('Content-Type: application/json; charset=UTF-8');
    echo $json;
}
