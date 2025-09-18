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