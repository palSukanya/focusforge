<?php
$conn = new mysqli("localhost", "root", "", "focusforge");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>