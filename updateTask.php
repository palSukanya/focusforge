<?php
include "db.php";

$id = $_POST['id']; 
$title = trim($_POST['title'] ?? '');
$desc = trim($_POST['desc'] ?? '');
$deadline = $_POST['deadline'] ?? null;
$priority = $_POST['priority'] ?? 'Medium';
$tags = trim($_POST['tags'] ?? '');

if(strlen($title) < 3){
    echo json_encode(["status"=>"error","message"=>"Invalid title"]);
    exit;
}       
$stmt = $conn->prepare("UPDATE tasks SET title=?, description=?, deadline=?, priority=?, tags=? WHERE id=?");
$stmt->bind_param("sssssi", $title, $desc, $deadline, $priority, $tags, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "updated"]);
}

?>