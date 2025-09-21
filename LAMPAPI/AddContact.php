<?php
    require_once __DIR__ . '/config.php';
    
    $inData = getRequestInfo();

    // VALIDATION: Check for required fields
    if (empty($inData["firstName"]) || empty($inData["lastName"]) || empty($inData["userId"])) {
        returnWithError("First name, last name, and userId are required.");
        exit; // Stop the script
    }
    
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $phone = $inData["phone"] ?? ""; // Use a default empty string if not provided
    $email = $inData["email"] ?? ""; // Use a default empty string if not provided
    $userId = $inData["userId"];

    if ($conn->connect_error)
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        $stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserID) VALUES(?,?,?,?,?)");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            returnWithSuccess("Contact added successfully.");
        } else {
            returnWithError("Failed to add contact.");
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }
    
    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }

    // New function for consistency
    function returnWithSuccess( $msg )
    {
        $retValue = '{"success":"' . $msg . '", "error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
