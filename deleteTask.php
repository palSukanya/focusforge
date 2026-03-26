<?php
include "db.php";

$id = $_POST['id'];

$stmt = $conn->prepare("DELETE FROM tasks WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo json_encode(["status" => "deleted"]);
?>