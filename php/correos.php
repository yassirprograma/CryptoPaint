<?php

require './PHPMailer-master/Exception.php';
require './PHPMailer-master/PHPMailer.php';
require './PHPMailer-master/SMTP.php';


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

//Aqui pones los valores del formulario para recuperar contraseñas
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtén los valores del formulario
    $nombre = $_POST['nombre'];
    $email = $_POST['email'];



$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->SMTPDebug = 0;                      
    $mail->isSMTP();                                            
    $mail->Host       = 'smtp.gmail.com';                    
    $mail->SMTPAuth   = true;                                  
    $mail->Username   = 'emanuelrosiles@gmail.com'; //Cambialo a tu correo
    $mail->Password   = 'tyaykmhljqyfhdqu';  //Esta la estableces en tu gmail > seguridad > autenticacion en 2 pasos > contraseñas de aplicaciones
    $mail->SMTPSecure = 'ssl';            
    $mail->Port       = 465;                      

    //Recipients
    $mail->setFrom('emanuelrosiles@gmail.com', 'Sistema');
    $mail->addAddress($email, $nombre);  
    
    //Attachments
    //$mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
    //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

    //Content
    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = 'Recuperacion de contraseña';
    $mail->Body    = 'Código: <b>######</b>';
    
    $mail->send();
    echo 'Se ha enviado un código a su dirección de correo';
} catch (Exception $e) {
    echo "Error al enviar correo: {$mail->ErrorInfo}";
    }

}

?>