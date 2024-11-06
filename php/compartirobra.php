<?php
header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['imagen'])) {
    //Guardamos los valores que se recibieron en el POST
    $imagen = $_FILES['imagen'];

    $imgresultado=file_get_contents($imagen['tmp_name']);
    $mimeimgresultado=  $imagen['type'];   
    $nameimgresultado=$imagen['name'];
    $idpeticion=$_POST['idpeticion'];
    $username=$_POST['username'];
    $password=$_POST['password'];
    
    //Tambén se sube la firma    
    $firma = $_FILES['firma'];
    $firmaimgresultado=file_get_contents($firma['tmp_name']);
    $mimefirmaimgresultado=  $firma['type'];   


    
    // Include da la información para configuración y la conexión a la base de datos
    include_once("./datahost.php");

    //DESPUES DE HACER UN ECHO     JSON ENCODE, YA NO DEBERÍA HABER MÁS CÓDIGO
                                        
        try {           
            //Probando nueva forma de hacer conexión usando dsn
            $conexion = new PDO($dsn, $usuarioMYSQL, $contraMYSQL);
        
        
            $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            

            //$consulta = $conexion->prepare("INSERT INTO peticion (titulopeticion, username, imgejemplo, nameimgejemplo, mimeimgejemplo,fechasolicitud, estatus) VALUES (?, ?, ?, ?, ?, ?,?)");        
            $consulta = $conexion->prepare("UPDATE peticion SET estatus=1, imgresultado=:imgresultado, nameimgresultado=:nameimgresultado, mimeimgresultado=:mimeimgresultado, firmaimgresultado=:firmaimgresultado, mimefirmaimgresultado=:mimefirmaimgresultado   WHERE idpeticion=:idpeticion");        
                        
            //Nota bien importante, para evitar errores raros en PHP, siempre en bindparam, hacer bind con variables, no con constantes como cadenas "0" o cosas así
            
            $consulta->bindParam(':idpeticion',$idpeticion);                                
                    
            $consulta->bindParam(':imgresultado',$imgresultado, PDO::PARAM_LOB);        
            $consulta->bindParam(':nameimgresultado',$nameimgresultado);         
            $consulta->bindParam(':mimeimgresultado',$mimeimgresultado);    
            $consulta->bindParam(':firmaimgresultado',$firmaimgresultado);    
            $consulta->bindParam(':mimefirmaimgresultado',$mimefirmaimgresultado);    
                                
            
                        
            $consulta->execute();      

            $response = ['message' => 'La obra se compartió satisfactoriamente'];                
            echo json_encode($response);    
             /**/
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error en la conexión a la base de datos: ' . $e->getMessage()]);
        } finally {
            $conexion = null;
        }    
        
     
} else {
    echo json_encode(['error' => 'No se recibió ninguna imagen']);
}

?>

