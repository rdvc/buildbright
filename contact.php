<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Pointing to your specific folder structure in C:\xampp\htdocs\buildbright\
require __DIR__ . '/PHPMailer-master/src/Exception.php';
require __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-master/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.mail.yahoo.com'; 
        $mail->SMTPAuth   = true;
        $mail->Username   = 'ryan_castaneda@rocketmail.com'; 
        $mail->Password   = 'fqfzubjpynddakvh'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('ryan_castaneda@rocketmail.com', 'Build Bright Website');
        $mail->addAddress('ryan_castaneda@rocketmail.com'); 

        // Content
        $mail->isHTML(true);
        $mail->Subject = "New Build Bright Inquiry: " . $_POST['interest'];
        
        // Build readable email body
        $name = htmlspecialchars($_POST['name']);
        $email = htmlspecialchars($_POST['email']);
        $interest = htmlspecialchars($_POST['interest']);
        $message = nl2br(htmlspecialchars($_POST['message']));

        $mail->Body = "
            <h3>New Inquiry from Build Bright Website</h3>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>System Interest:</strong> {$interest}</p>
            <p><strong>Message:</strong><br>{$message}</p>
        ";

        $mail->send();
        
        // Redirect back to index with a success parameter to trigger the modal
        header("Location: index.html?status=success#contact");
        exit();

    } catch (Exception $e) {
        // If it fails, we show the error via standard alert so you can debug
        echo "<script>alert('Message could not be sent. Mailer Error: {$mail->ErrorInfo}'); window.history.back();</script>";
    }
} else {
    header("Location: index.html");
    exit();
}
?>