<?php
include "db.php";

$id = $_POST['id'];

$stmt = $conn->prepare("UPDATE tasks SET completed=1, progress=100, completed_at=NOW() WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo json_encode(["status" => "done"]);

?>