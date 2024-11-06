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

function agregaUsuario($conexion, $nombre,$apellido,$username, $correo,  $password){ //Función para insertar un usuario
            
      //Se prepara la inserción
      $stmt = $conexion->prepare("INSERT INTO usuario (nombre,apellido,username, correo, password, admin) VALUES ('$nombre','$apellido','$username', '$correo', '$password',0)");
      
      mysqli_stmt_execute($stmt);      //Se ejecuta la inserción
      
      
}

function correoYUsuarioDisponibles($conexion, $correo, $username){ /*para verificar que el usuario que queremos insertar no */

      $queryuser="SELECT * FROM usuario WHERE username='$username'";
      $resultadouser=$conexion->query($queryuser) or die("Error con la base de datos");
    
      $querycorreo="SELECT * FROM usuario WHERE correo='$correo'";
      $resultadocorreo=$conexion->query($querycorreo) or die("Error con la base de datos");
      
   
      if($resultadocorreo && $resultadouser){
            if($resultadouser->num_rows==0 && $resultadocorreo->num_rows==0){  //si no encontró ese correo y no encontró  ese usuario, quiere decir que ambos están disponibles                  
                  return 1;
            }else {
                  if($resultadouser->num_rows==1 && $resultadocorreo->num_rows==1){  
                        $resultadocorreo->close();
                        $resultadouser->close(); //siempre hay que cerrar una consulta                                                   
                        return -2; //ambos ya se han usado
                  }else {
                        if($resultadocorreo->num_rows==1){
                              $resultadocorreo->close();
                              $resultadouser->close(); //siempre hay que cerrar una consulta     
                              return -1; //el correo ya se ha usado
                        }   

                        if($resultadouser->num_rows==1){
                              $resultadocorreo->close();
                              $resultadouser->close(); //siempre hay que cerrar una consulta     
                              return 0; //el username ya se ha usado
                        }

                  }
                  
            }
          
      }      

}




// Obtener los valores de usuario y contraseña enviados desde el javascript del formulario
$nombre = $_POST['nombre'];
$apellido = $_POST['apellido'];
$username = $_POST['username'];
$password = $_POST['password'];
$correo = $_POST['correo'];




//Conexión a MYSQL
// Include da la información para configuración y la conexión a la base de datos
include_once("./datahost.php");



$conexion = conectaABase($servidorMYSQL, $usuarioMYSQL, $contraMYSQL, $baseMYSQL); 

//Sanitizamos, para evitar inyecciones de SQL
$username=sanitizaMYSQL($conexion, $username);
$correo=sanitizaMYSQL($conexion,$correo);
$password=sanitizaMYSQL($conexion,$password);




if($conexion){ //Si la conexión sucedió, entonces todo ok

      /*Si los datos son válidos (correo y usuario no usados anteriormente), entonces lo inserta y regresa un response exitoso al fetch de javascript,
      de lo contrario, deberá notificar un responde que indique que el usuario o correo ya están en uso
      */

      $disponibilidad=correoYUsuarioDisponibles($conexion,$correo,$username);//Validamos disponibilidad

      if($disponibilidad==1){
            //Si hay disponibilidad, se registra al usuario y se manda un response exitoso

            agregaUsuario($conexion,$nombre,$apellido,$username, $correo, $password);            

            $response = ['success' => 1, 'mensaje' => 'Registro exitoso'];
            header('Content-Type: application/json');
            echo json_encode($response);

      }else{      
            //En caso de no haber disponiblidad, devolvemos un response indicando el status            
            if($disponibilidad==-0){
                  $response = ['success' => 0, 'mensaje' => 'El nombre de usuario no se encuentra disponible, elija uno diferente'];
                  header('Content-Type: application/json');
                  echo json_encode($response);
            }      
            if($disponibilidad==-1){
                  $response = ['success' => -1, 'mensaje' => 'El correo electrónico no se encuentra disponible, elija uno diferente'];
                  header('Content-Type: application/json');
                  echo json_encode($response);
            }      
            if($disponibilidad==-2){
                  $response = ['success' => -2, 'mensaje' => 'El nombre de usuario y el correo no están disponibles, elija unos diferentes'];
                  header('Content-Type: application/json');
                  echo json_encode($response);
            }      

      }


      mysqli_close($conexion);

} 
//Si no hubo conexión a la base de datos, no se manda response


?>
