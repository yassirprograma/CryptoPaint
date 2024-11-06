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




// Obtener los valores de usuario y contraseña enviados desde el formulario
$username = $_POST['username'];
$password = $_POST['password'];


// Include da la información para configuración y la conexión a la base de datos
include_once("./datahost.php");

//Conexión a MYSQL
$conexion = conectaABase($servidorMYSQL, $usuarioMYSQL, $contraMYSQL, $baseMYSQL); 


//Sanitizamos, para evitar inyecciones de SQL 
$username=sanitizaMYSQL($conexion, $username);
$password=sanitizaMYSQL($conexion,$password);


if($conexion){

      $query="SELECT idusuario, nombre, apellido, username,correo, password, admin  FROM usuario WHERE username='$username'"; //cadena de nuestra consulta
      $result=$conexion->query($query); //hacemos la consulta y la asignamos a $result                  
      
      //Response: success, mensaje,idusuario, username, password, admin      

      if(!$result->num_rows){ //si el resultado es vacío, quiere decir que el usuario no existe                       
            $response = ['success' => 0, 'mensaje' => 'Usuario o contraseña incorrectos', 'idusuario'=>'','username'=>'','password'=>'','admin'=>''];
            header('Content-Type: application/json');
            echo json_encode($response);                  

            $result->close(); //cerramos la consulta
      }elseif($result->num_rows){ //pero si obtuvo algo, entonces procedemos a verificar la contraseña
            
            $fila=$result->fetch_array(MYSQLI_NUM); //la posición 0 tiene el username y la 1 la contraseña
            
            //Valores devueltos por la consulta
            $idusuarioBD=$fila[0];
            $nombre=$fila[1];
            $apellido=$fila[2];
            $usernameBD=$fila[3];
            $correo=$fila[4];
            $passwordBD=$fila[5]; //guardamos la que viene de la base de datos
            $admin=$fila[6];                        


            if($password==$passwordBD){ //VERIFICAMOS SI LA CONTRASEÑA INGRESADA Y LA DE LA BD COINCIDEN                                    
                  //La repuesta al archivo Javascript que generó la petición a este archivo
                  $response = ['success' => 1, 'mensaje' => 'Inicio de sesión exitoso', 'idusuario'=>$idusuarioBD,'username'=>$usernameBD,'password'=>$passwordBD,'admin'=>$admin];
                  header('Content-Type: application/json');
                  echo json_encode($response);                  

            }else{ //Si la contraseña no es correcta                  

                  //La repuesta al archivo Javascript que generó la petición a este archivo
                  $response = ['success' => 0, 'mensaje' => 'Usuario o contraseña incorrectos','idusuario'=>'','username'=>'','password'=>'','admin'=>''];
                  header('Content-Type: application/json');
                  echo json_encode($response);                  
            }

            $result->close(); //cerramos la consulta
      }
      
      mysqli_close($conexion);
}

?>
