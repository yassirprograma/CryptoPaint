<?php

//Funciones para evitar inyecciones en el formulario Fuente:  Libro de Robin Nixon en la página 279
function sanitizaString($cadena){ //para evitar inyecciones a través del formulario            
      $cadena=stripcslashes($cadena);                        
      $cadena=strip_tags($cadena);
      $cadena=htmlentities($cadena);
      return $cadena;
}

function sanitizaMYSQL($conection, $var){ //sanitiza una cadena para prevenir que genere inyecciones SQL o inyecciones HTML, pero se debe tener instanciado un objeto conexión
      $var=$conection->real_escape_string($var);
      $var=sanitizaString($var);
      return $var;
}

function conectaABase($servidor, $usuario, $contra, $base){  //para cualquier base
      // La siguiente función es la que que la página de php recomienda usar para php5, php7 y php8 : 
      $conexion = mysqli_connect($servidor, $usuario, $contra, $base) or die ("ERROR DE CONEXIÓN CON LA BASE DE DATOS"); 

      if($conexion){
      // echo "<h2>Conexión a base de datos realizada correctamente </h2>";
      }
      return $conexion;
}

function generaCodigo($tamCode){ //Función para generar códigos alafanuméricos aleatoriamente
                  
      $conjuntoChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; //Conjunto de caracteres que generarán el código

      $tamConjuntoChars = strlen($conjuntoChars); 

      $codigo = ''; //Inicializamos el código
  

      for($i = 0; $i < $tamCode; $i++) { //Tomamos caracter por caracter aleatoriamente del conjunto
          $randomChar = $conjuntoChars[mt_rand(0, $tamConjuntoChars - 1)];
          $codigo .= $randomChar; //Vamos concatenando cada caracter generado
      }
  
      return $codigo;  

}

function borraCodigosViejos($conexion, $username){
      $eliminacion = $conexion->prepare("DELETE FROM restablecerpassword WHERE username='$username'");      
      mysqli_stmt_execute($eliminacion);
}

function registraCodigo($conexion, $username, $correo,  $codigo ){
      //Antes de generar uno nuevo, borramos todos los códigos anteriores que este usuario haya generado, 
      //Así evitaremos que se queden varios códigos sin usar
      borraCodigosViejos($conexion, $username);

      //Se prepara la inserción
      //El vencimiento es un booleano que indica si ya se usó el código      
      $insercion = $conexion->prepare("INSERT INTO restablecerpassword (username, correo, codigo, vencimiento) VALUES ('$username', '$correo', '$codigo', 1)");      
      mysqli_stmt_execute($insercion);      //Se ejecuta la inserción
}
function hola(){
      $response = ['resultado' => 1, 'mensaje' => 'Hola'];
                  header('Content-Type: application/json');
                  echo json_encode($response);
}

function enviaCodigo($correo,$username, $codigo, $mail){

                        
      try {
            //Server settings
            $mail->SMTPDebug = 0;                      
            $mail->isSMTP();                                            
            $mail->Host       = 'smtp.gmail.com';                    
            $mail->SMTPAuth   = true;                                  
            $mail->Username   = 'dj.jicara@gmail.com'; //Cambialo a tu correo
            $mail->Password   = 'jpzhjicmdhpiyagr';  //Esta la estableces en tu gmail > seguridad > autenticacion en 2 pasos > contraseñas de aplicaciones
            //otra pitekdjohiauezci
            $mail->SMTPSecure = 'ssl';            
            $mail->Port       = 465;                      

            

            //Recipients
            $mail->setFrom('dj.jicara@gmail.com', 'Cuentas: Introduction to Cryptography');
            $mail->addAddress($correo, $username);  
            
            //Attachments
            //$mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
            //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

            //Content
            $mail->isHTML(true);                                  //Set email format to HTML
            $mail->Subject = 'Recuperacion de contraseña';
            $mail->Body    = '<h2>Su código de recuperación es:</h2> <h1>'.$codigo.'</h1>'.'<br>'.'<h3>Este es su código actual, por motivos de seguridad los códigos generados antes de este, han caducado </h3>';
            
            $mail->send();
            

    } catch (Exception $e) {
            $response = ['resultado' => 0, 'mensaje' => 'Error al enviar el correo'];
            header('Content-Type: application/json');
            echo json_encode($response);
    }
   
    $response = ['resultado' => 1, 'mensaje' => 'El código ha sido enviado exitosamente a su correo'];
    header('Content-Type: application/json');
    echo json_encode($response);
}



//////////////Codigo principal:


require './PHPMailer-master/Exception.php';
require './PHPMailer-master/PHPMailer.php';
require './PHPMailer-master/SMTP.php';


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

$mail = new PHPMailer(true); //Objeto para mandar correos



$username = $_POST['username'];
$correo = $_POST['correo'];

// Include da la información para configuración y la conexión a la base de datos
include_once("./datahost.php");


$conexion = conectaABase($servidorMYSQL, $usuarioMYSQL, $contraMYSQL, $baseMYSQL); 

//Sanitizamos, para evitar inyecciones de SQL 
$username=sanitizaMYSQL($conexion, $username);
$correo=sanitizaMYSQL($conexion,$correo);


if($conexion){

      //Primero debemos corroborar que el correo pertenezca al usuario
      $query="SELECT username, correo FROM usuario WHERE username='$username'"; //cadena de nuestra consulta      
      $result=$conexion->query($query); //hacemos la consulta y la asignamos a $result                  

      if(!$result->num_rows){  //Si no se obtuvo nada al buscar el usuario, quiere decir que no existe

            $response = ['resultado' => 0, 'mensaje' => 'El usuario ingresado no existe'];
            header('Content-Type: application/json');
            echo json_encode($response);                  

            $result->close(); //cerramos la consulta

      }elseif($result->num_rows){ //Pero si el usuario sí existe, debemos corroborar que el correo le pertenezca
            

            $fila=$result->fetch_array(MYSQLI_NUM); 

            //Valores devueltos por la consulta
            $usernameBD=$fila[0];
            $correoBD=$fila[1]; //guardamos la que viene de la base de datos
            

            if($correo==$correoBD){//Si el correo ingresado, coincide con el de la base de datos, entonces sí se le puede generar un código

                  /*Si el correo pertenece al usuario, entonces generarmos un código y lo mandamos al correo
                  e insertamos el código en la tabla "restablecerpassword"
                  */
                  $codigo=generaCodigo(8); //Generamos un código de 8 caracteres alfanuméricos

                  //Luego damos de alta el código en la base de datos
                  registraCodigo($conexion, $username, $correo, $codigo);
                  //$response = ['resultado' => 1, 'mensaje' => 'El código ha sido enviado exitosamente a su correo'];
                  //header('Content-Type: application/json');
                  //echo json_encode($response);

                  //Enviamos el código al correo electrónico
                  enviaCodigo($correo, $username, $codigo, $mail);
                  //hola();
                  
                  //Devolvemos un responde positivo
                  

            }else{
                  //Si el correo NO pertenece al usuario, entonces devolvemos un response negativo
                  $response = ['resultado' => 0, 'mensaje' => 'El correo ingresado no pertenece al usuario'];
                  header('Content-Type: application/json');
                  echo json_encode($response);
            }

            $result->close(); //cerramos la consulta
      }
      
      mysqli_close($conexion);

}






?>