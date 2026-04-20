<?php
include "db.php";

$id = $_POST['id'];
$progress = $_POST['progress'];

$stmt = $conn->prepare("UPDATE tasks SET progress=? WHERE id=?");
$stmt->bind_param("ii", $progress, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "updated"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>