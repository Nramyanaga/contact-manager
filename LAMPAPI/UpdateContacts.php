<?php
// UpdateContact.php
// Updates an existing contact's info (partial updates supported)

require_once __DIR__ . "/config.php"; // provides $conn and helper fns

header("Content-Type: application/json; charset=UTF-8");

try {
    $inData = getRequestInfo(); // expects JSON

    // --- Required identifiers ---
    $contactId = isset($inData["id"]) ? intval($inData["id"]) :
                 (isset($inData["contactId"]) ? intval($inData["contactId"]) : 0);
    $userId    = isset($inData["userId"]) ? intval($inData["userId"]) : 0;

    if ($contactId <= 0 || $userId <= 0) {
        returnWithError("Missing or invalid 'id' (contactId) or 'userId'.");
        exit;
    }

    // --- Allowed updatable columns (add/remove to match your DB schema) ---
    // Left side = JSON key, right side = DB column name
    $allowed = [
        "firstName" => "FirstName",
        "lastName"  => "LastName",
        "phone"     => "Phone",
        "email"     => "Email"
    ];

    $setClauses = [];
    $params     = [];
    $types      = "";

    foreach ($allowed as $jsonKey => $col) {
        if (array_key_exists($jsonKey, $inData) && $inData[$jsonKey] !== null) {
            $setClauses[] = "$col = ?";
            // infer type (i = int, s = string)
            if ($jsonKey === "favorite") {
                $types   .= "i";
                $params[] = intval($inData[$jsonKey]);
            } else {
                $types   .= "s";
                $params[] = trim($inData[$jsonKey]);
            }
        }
    }

    if (empty($setClauses)) {
        returnWithError("No updatable fields provided.");
        exit;
    }

    // --- Build the UPDATE statement dynamically ---
    $sql = "UPDATE Contacts SET " . implode(", ", $setClauses) . " WHERE ID = ? AND UserID = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        returnWithError("Prepare failed: " . $conn->error);
        exit;
    }

    // Bind dynamic fields + identifiers
    $types .= "ii";
    $params[] = $contactId;
    $params[] = $userId;

    // bind_param with dynamic args
    $bindOk = $stmt->bind_param($types, ...$params);
    if (!$bindOk) {
        returnWithError("Binding params failed.");
        exit;
    }

    if (!$stmt->execute()) {
        returnWithError("Database error: " . $stmt->error);
        exit;
    }

    if ($stmt->affected_rows === 0) {
        // Could be: no ownership match OR same data (no changes)
        // We’ll check existence to disambiguate
        $stmt->close();

        $chk = $conn->prepare("SELECT ID FROM Contacts WHERE ID = ? AND UserID = ?");
        $chk->bind_param("ii", $contactId, $userId);
        $chk->execute();
        $chk->store_result();

        if ($chk->num_rows === 0) {
            $chk->close();
            returnWithError("Contact not found or not owned by this user.");
            exit;
        }
        $chk->close();
        // Exists but no actual changes; continue to fetch and return current record.
    } else {
        $stmt->close();
    }

    // --- Return the updated record (or current state if no actual change) ---
    $get = $conn->prepare(
        "SELECT ID AS id, UserID AS userId, FirstName AS firstName, LastName AS lastName,
                Phone AS phone, Email AS email
         FROM Contacts
         WHERE ID = ? AND UserID = ?"
    );
    $get->bind_param("ii", $contactId, $userId);
    $get->execute();
    $result = $get->get_result();

    if ($row = $result->fetch_assoc()) {
        sendResultInfoAsJson($row);
    } else {
        returnWithError("Updated but unable to fetch resulting record.");
    }

    $get->close();
    $conn->close();

} catch (Throwable $e) {
    returnWithError("Server error: " . $e->getMessage());
    exit;
}

function getRequestInfo(): array
{
    // Raw body
    $raw = file_get_contents('php://input');

    // Try to decode JSON
    if (!empty($raw)) {
        $data = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
            return array_map(
                fn($v) => is_string($v) ? trim($v) : $v,
                $data
            );
        }
    }

    // Fallback to form-encoded POST
    if (!empty($_POST)) {
        return array_map(
            fn($v) => is_string($v) ? trim($v) : $v,
            $_POST
        );
    }

    return [];
}

/**
 * Sends the given PHP array/object as JSON with the provided HTTP status code.
 */
function sendResultInfoAsJson($obj, int $statusCode = 200): void
{
    header('Content-Type: application/json; charset=UTF-8');
    // If you need CORS during development, uncomment below:
    // header('Access-Control-Allow-Origin: *');

    http_response_code($statusCode);

    // Ensure arrays/objects are encoded properly
    echo json_encode(
        $obj,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

/**
 * Convenience helper for sending a JSON error payload.
 */
function returnWithError(string $err, int $statusCode = 400): void
{
    // Standardize error envelope
    $payload = [
        'ok'    => false,
        'error' => $err,
    ];
    sendResultInfoAsJson($payload, $statusCode);
}
<?php
    require_once __DIR__ . '/config.php';

    try
    {
        // 1) Read JSON body
        $inData = getRequestInfo();

        // 2) Pull & sanitize inputs
        $contactId = isset($inData['id'])      ? intval($inData['id'])      : 0; // contact PK
        $userId    = isset($inData['userId'])  ? intval($inData['userId'])  : 0; // owner
        $firstName = isset($inData['firstName']) ? trim($inData['firstName']) : '';
        $lastName  = isset($inData['lastName'])  ? trim($inData['lastName'])  : '';
        $phone     = isset($inData['phone'])     ? trim($inData['phone'])     : '';
        $email     = isset($inData['email'])     ? trim($inData['email'])     : '';

        // 3) Validate required fields
        if ($contactId <= 0)                    returnWithError("Missing or invalid contact id.");
        if ($userId <= 0)                       returnWithError("Missing or invalid userId.");
        if ($firstName === '' || $lastName === '')
        {
            returnWithError("First and last name are required.");
        }
        if ($email === '')                      returnWithError("Email is required.");
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) returnWithError("Email format is invalid.");

        // 4) DB connection
        if ($conn->connect_error)               returnWithError("Database connection failed: " . $conn->connect_error);

        // 5) Update using ownership guard (ID + UserID)
        // Only the owner (userId) can update their contact.
        $stmt = $conn->prepare(
            "UPDATE Contacts
            SET FirstName = ?, LastName = ?, Phone = ?, Email = ?
            WHERE ID = ? AND UserID = ?"
        );
        
        if (!$stmt)                             returnWithError("Prepare failed: " . $conn->error);

        $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);

        if (!$stmt->execute())                  returnWithError("Database error: " . $stmt->error);

        // 6) Check if a row was actually updated (bad id or not user's contact)
        if ($stmt->affected_rows === 0)
        {
            // Distinguish between "exists but identical data" and "not found/not owned"
            // Try a quick existence check:
            $check = $conn->prepare("SELECT ID FROM Contacts WHERE ID = ? AND UserID = ?");
            if ($check)
            {
                $check->bind_param("ii", $contactId, $userId);
                $check->execute();
                $check->store_result();

                if ($check->num_rows === 0)
                {
                    $check->close();
                    $stmt->close();
                    $conn->close();
                    returnWithError("No matching contact found for this user.");
                }
                $check->close();
            }

            // Same data as before—treat as success but indicate no changes.
            $stmt->close();
            $conn->close();
            sendResultInfoAsJson([
                "error"      => "",
                "id"         => $contactId,
                "firstName"  => $firstName,
                "lastName"   => $lastName,
                "phone"      => $phone,
                "email"      => $email,
                "userId"     => $userId,
                "message"    => "No changes detected (data identical)."
            ]);
            exit;
        }

        $stmt->close();
        $conn->close();

        // 7) Success response
        sendResultInfoAsJson([
            "error"      => "",
            "id"         => $contactId,
            "firstName"  => $firstName,
            "lastName"   => $lastName,
            "phone"      => $phone,
            "email"      => $email,
            "userId"     => $userId,
            "message"    => "Contact updated successfully"
        ]);
    }

    

    catch (Throwable $ex)
    {
        returnWithError("Unhandled error: " . $ex->getMessage());
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $arr )
    {
        header('Content-type: application/json');
        echo json_encode($arr);
    }

    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
?>