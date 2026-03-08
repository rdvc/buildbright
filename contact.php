<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Point to PHPMailer-master since that is what is in your htdocs
require __DIR__ . '/PHPMailer-master/src/Exception.php';
require __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-master/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.mail.yahoo.com'; // Rocketmail uses Yahoo SMTP
        $mail->SMTPAuth   = true;
        $mail->Username   = 'ryan_castaneda@rocketmail.com'; 
        $mail->Password   = 'fqfzubjpynddakvh'; // Generate an "App Password" in Yahoo settings
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('ryan_castaneda@rocketmail.com', 'Build Bright Website');
        $mail->addAddress('ryan_castaneda@rocketmail.com'); 

        // Content
        $mail->isHTML(true);
        $mail->Subject = "New Build Bright Inquiry: " . $_POST['interest'];
        $mail->Body    = "<h3>New Inquiry Received</h3>
                          <p><strong>Name:</strong> {$_POST['name']}</p>
                          <p><strong>Email:</strong> {$_POST['email']}</p>
                          <p><strong>Interest:</strong> {$_POST['interest']}</p>
                          <p><strong>Message:</strong><br>{$_POST['message']}</p>";

        $mail->send();
        echo "<script>alert('Thank you! Your inquiry has been sent.'); window.location.href='index.html';</script>";
    } catch (Exception $e) {
        echo "<script>alert('Message could not be sent. Mailer Error: {$mail->ErrorInfo}'); window.history.back();</script>";
    }
}
?>