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

function borraCodigoUsado($conexion, $username, $codigo){ 
      $eliminacion = $conexion->prepare("DELETE FROM restablecerpassword WHERE username='$username' and  codigo='$codigo' ");      
      mysqli_stmt_execute($eliminacion);
}

function actualizaPassword($conexion, $username, $passwordnueva){
      $actualizacion = $conexion->prepare("UPDATE usuario set password='$passwordnueva' where username='$username'");      
      mysqli_stmt_execute($actualizacion);      //Se ejecuta la inserción
}


$codigo = $_POST['codigo'];
$username=$_POST['username'];
$passwordnueva = $_POST['passwordnueva'];


// Include da la información para configuración y la conexión a la base de datos
include_once("./datahost.php");

//Conexión a MYSQL
$conexion = conectaABase($servidorMYSQL, $usuarioMYSQL, $contraMYSQL, $baseMYSQL); 

//Sanitizamos, para evitar inyecciones de SQL 
$codigo=sanitizaMYSQL($conexion, $codigo);
$username=sanitizaMYSQL($conexion, $username);
$passwordnueva=sanitizaMYSQL($conexion, $passwordnueva);



if($conexion){


      //Debemos verificar que el código le pertenezca al usuario  

      //Obtenemos los intentos del usuario de restablecer contraseña
      $query="SELECT username, codigo FROM restablecerpassword WHERE username='$username'"; //cadena de nuestra consulta      
      $result=$conexion->query($query); //hacemos la consulta y la asignamos a $result                  

      if(!$result->num_rows){  //Si la consulta es vacía, quiere decir, que el usuario no ha generado un código de restablecimiento

            $response = ['resultado' => 0, 'mensaje' => 'El usuario no tiene código de recuperación disponible'];
            header('Content-Type: application/json');
            echo json_encode($response);

            $result->close(); //cerramos la consulta

      }elseif($result->num_rows){ 
            
            $fila=$result->fetch_array(MYSQLI_NUM); 

            //Valores devueltos por la consulta
            $usernameBD=$fila[0];
            $codigoBD=$fila[1]; //guardamos la que viene de la base de datos
            
            if($codigoBD==$codigo){ //Si el código ingresado empata con el de la BD, entonces se hace el cambio de contraseña
                  actualizaPassword($conexion, $username, $passwordnueva);

                  borraCodigoUsado($conexion, $username, $codigo); //Después de usar un código, lo borramos

                  $response = ['resultado' => 1, 'mensaje' => 'La contraseña se ha actualizado satisfactoriamente'];
                  header('Content-Type: application/json');
                  echo json_encode($response);
            }else{ 
                  // Si no empatan, se devuleve un response negativo

                  $response = ['resultado' => 0, 'mensaje' => 'Su código es incorrecto o ha caducado'];
                  header('Content-Type: application/json');
                  echo json_encode($response);
            }
            


            $result->close(); //cerramos la consulta
      }
      
      mysqli_close($conexion);

}


//Si no, mandamos un response negativo

//Si le corresponde, entonces actualizamos la contraseña

//Si no, mandamos un response negativo





?>