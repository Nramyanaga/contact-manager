<?php
    require_once __DIR__ . '/config.php';

    $inData = getRequestInfo();

    $searchResults = [];
    $searchCount = 0;

    $userId = $inData["userId"];
    $search = "%" . $inData["search"] . "%";

    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }
    else
    {
        $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE UserID=? AND (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?)");
        $stmt->bind_param("issss", $userId, $search, $search, $search, $search);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc())
        {
            $searchResults[] = array(
                "ID" => $row["ID"],
                "FirstName" => $row["FirstName"],
                "LastName" => $row["LastName"],
                "Phone" => $row["Phone"],
                "Email" => $row["Email"]
            );
            $searchCount++;
        }

        if ($searchCount == 0)
        {
            returnWithError("No Records Found");
        }
        else
        {
            returnWithInfo($searchResults);
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = '{"results":[],"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($searchResults)
    {
        $retValue = '{"results":' . json_encode($searchResults) . ',"error":""}';
        sendResultInfoAsJson($retValue);
    }
?>
