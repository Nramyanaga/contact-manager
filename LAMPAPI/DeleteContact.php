<?php
    require_once __DIR__ . '/config.php';
    
    $inData = getRequestInfo();
    
    // VALIDATION: Check for required fields
    if (empty($inData["id"]) || empty($inData["userId"])) {
        returnWithError("Contact ID and User ID are required.");
        exit; // Stop the script
    }

    $id = $inData["id"];
    $userId = $inData["userId"];

    if ($conn->connect_error)
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        $stmt = $conn->prepare("DELETE from Contacts WHERE ID=? AND UserID=?");
        $stmt->bind_param("ii", $id, $userId);
        $stmt->execute();
        
        // Check if a row was actually deleted
        if ($stmt->affected_rows > 0)
        {
            returnWithSuccess("Contact deleted successfully.");
        }
        else
        {
            returnWithError("Contact not found or you do not have permission to delete it.");
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
