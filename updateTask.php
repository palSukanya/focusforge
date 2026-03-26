<?php
include "db.php";

$id = $_POST['id'];
$title = $_POST['title'];
$desc = $_POST['desc'];
$deadline = $_POST['deadline'];   
$priority = $_POST['priority'];   
$tags = $_POST['tags'];          
$stmt = $conn->prepare("UPDATE tasks SET title=?, description=?, deadline=?, priority=?, tags=? WHERE id=?");
$stmt->bind_param("sssssi", $title, $desc, $deadline, $priority, $tags, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "updated"]);
}

?>