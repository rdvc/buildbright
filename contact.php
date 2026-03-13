<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Pointing to your specific folder structure
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
        $mail->addReplyTo($_POST['email'], $_POST['name']);

        // Content
        $mail->isHTML(true);
        $mail->Subject = "New Build Bright Inquiry: " . $_POST['interest'];
        
        // Sanitize and Build readable email body
        $name = htmlspecialchars($_POST['name']);
        $email = htmlspecialchars($_POST['email']);
        $phone = htmlspecialchars($_POST['phone']);
        $company = htmlspecialchars($_POST['company_name']);
        $address = htmlspecialchars($_POST['company_address']);
        $interest = htmlspecialchars($_POST['interest']);
        $message = nl2br(htmlspecialchars($_POST['message']));

        $mail->Body = "
            <div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
                <h2 style='color: #00ccff;'>New Inquiry from Build Bright Website</h2>
                <hr>
                <p><strong>--- CLIENT DETAILS ---</strong></p>
                <p><strong>Name:</strong> {$name}</p>
                <p><strong>Email:</strong> {$email}</p>
                <p><strong>Contact Number:</strong> {$phone}</p>
                
                <p><strong>--- COMPANY INFO ---</strong></p>
                <p><strong>Company Name:</strong> " . ($company ?: 'Not Provided') . "</p>
                <p><strong>Company Address:</strong> " . ($address ?: 'Not Provided') . "</p>
                
                <p><strong>--- PROJECT DETAILS ---</strong></p>
                <p><strong>System Interest:</strong> {$interest}</p>
                <p style='background: #f4f4f4; padding: 15px; border-left: 5px solid #00ccff;'>
                    <strong>Message:</strong><br>{$message}
                </p>
                <hr>
                <p style='font-size: 12px; color: #777;'>Sent via Build Bright Software Solution Automated Mailer</p>
            </div>
        ";

        $mail->send();
        
        // Redirect back to the page the user came from with success parameter
        $referer = $_SERVER['HTTP_REFERER'];
        // Remove existing query strings to avoid duplicates
        $redirect_url = strtok($referer, '?'); 
        header("Location: " . $redirect_url . "?status=success#contact");
        exit();

    } catch (Exception $e) {
        echo "<script>alert('Message could not be sent. Mailer Error: {$mail->ErrorInfo}'); window.history.back();</script>";
    }
} else {
    header("Location: index.html");
    exit();
}
?>