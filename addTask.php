<?php
include "db.php";

$title = trim($_POST['title'] ?? '');
$desc = trim($_POST['desc'] ?? '');
$deadline = $_POST['deadline'] ?? null;
$priority = $_POST['priority'] ?? 'Medium';
$tags = trim($_POST['tags'] ?? '');

if(strlen($title) < 3){
    echo json_encode(["status"=>"error","message"=>"Invalid title"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO tasks (title, description, deadline, priority, tags) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $title, $desc, $deadline, $priority, $tags);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}

?>