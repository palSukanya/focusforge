<?php
include "db.php";

$title = $_POST['title'];
$desc = $_POST['desc'];
$deadline = $_POST['deadline'];
$priority = $_POST['priority'];
$tags = $_POST['tags'];

$stmt = $conn->prepare("INSERT INTO tasks (title, description, deadline, priority, tags) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $title, $desc, $deadline, $priority, $tags);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}

?>