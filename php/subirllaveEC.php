<?php
header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['llavepublicaEC'])) {

    


    //Guardamos los valores que se recibieron en el POST
    $archivo = $_FILES['llavepublicaEC'];

    $llavepublicaEC=file_get_contents($archivo['tmp_name']);
    $mimellavepublicaEC=  $archivo['type'];   
    
    $username=$_POST['username'];
    
            
    // Include da la información para configuración y la conexión a la base de datos
    include_once("./datahost.php");


    //DESPUES DE HACER UN ECHO     JSON ENCODE, YA NO DEBERÍA HABER MÁS CÓDIGO


    
        
    
    
    
        
        try {           
            //Probando nueva forma de hacer conexión usando dsn
            $conexion = new PDO($dsn, $usuarioMYSQL, $contraMYSQL);
        
        
            $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        
            // Insertar la imagen en la base de datos
            //INSERT INTO `peticion` (`titulopeticion`, `username`, `imgejemplo`, `nameimgejemplo`, `mimeimgejemplo`, `estatus`) VALUES (?, ?, ?, ?, ?, ?)         
            //$consulta = $conexion->prepare('INSERT INTO imagenes (nombre, tipo_mime, datos) VALUES (?, ?, ?)');        
        
            /**/
            // ("UPDATE peticion SET estatus=1, imgresultado=:imgresultado, nameimgresultado=:nameimgresultado, mimeimgresultado=:mimeimgresultado   WHERE idpeticion=:idpeticion");
            $consulta = $conexion->prepare("UPDATE usuario SET llavepublicaEC=:llavepublicaEC, mimellavepublicaEC=:mimellavepublicaEC WHERE username=:username");        
            
            //Nota bien importante, para evitar errores raros en PHP, siempre en bindparam, hacer bind con variables, no con constantes como cadenas "0" o cosas así
            
            
            $consulta->bindParam(':llavepublicaEC',$llavepublicaEC, PDO::PARAM_LOB);        

            $consulta->bindParam(':mimellavepublicaEC',$mimellavepublicaEC);                    
            $consulta->bindParam(':username',$username);        
             
            
            //$consulta = $conexion->prepare("UPDATE usuario SET llavepublicaEC=NULL, mimellavepublicaEC=NULL,llavepublicaecdsa=NULL,mimellavepublicaecdsa=NULL");        
            
                        
            $consulta->execute();      

            $response = ['message' => 'Llave pública subida correctamente'];                
            echo json_encode($response);    
        } catch (PDOException $e) {
            echo json_encode(['message' => 'Error en la conexión a la base de datos: ' . $e->getMessage()]);
        } finally {
            $conexion = null;
        }    
        /*    */        
     
} else {
    echo json_encode(['message' => 'No se recibió ningun archivo']);
}

?>
