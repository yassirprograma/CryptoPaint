<?php
header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['imagen'])) {
    //Guardamos los valores que se recibieron en el POST
    $imagen = $_FILES['imagen'];

    $imgejemplo=file_get_contents($imagen['tmp_name']);
    $mimeimgejemplo=  $imagen['type'];   
    $nameimgejemplo=$imagen['name'];
    
    $titulopeticion=$_POST['titulopeticion'];
    $username=$_POST['username'];
    $password=$_POST['password'];
    $estatus=0;
    $fecha=date("Y-m-d H:i:s");


    //Tambén se sube la firma    
    $firma = $_FILES['firma'];
    $firmaimgejemplo=file_get_contents($firma['tmp_name']);
    $mimefirmaimgejemplo=  $firma['type'];   




            
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
        
        
            $consulta = $conexion->prepare("INSERT INTO peticion (titulopeticion, username, imgejemplo, nameimgejemplo, mimeimgejemplo,fechasolicitud, estatus,firmaimgejemplo,mimefirmaimgejemplo) VALUES (?, ?, ?, ?, ?, ?,?,?,?)");        
            
            //Nota bien importante, para evitar errores raros en PHP, siempre en bindparam, hacer bind con variables, no con constantes como cadenas "0" o cosas así
            
            $consulta->bindParam(1,$titulopeticion);
                    
            $consulta->bindParam(2,$username);        
                    
            $consulta->bindParam(3,$imgejemplo, PDO::PARAM_LOB);        
                    
            $consulta->bindParam(4,$nameimgejemplo);
                    
            $consulta->bindParam(5,$mimeimgejemplo );

            $consulta->bindParam(6,$fecha);
            $consulta->bindParam(7,$estatus);
            $consulta->bindParam(8,$firmaimgejemplo);
            $consulta->bindParam(9,$mimefirmaimgejemplo);
                        
            $consulta->execute();      

            $response = ['message' => 'Imagen subida y almacenada correctamente'];                
            echo json_encode($response);    
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error en la conexión a la base de datos: ' . $e->getMessage()]);
        } finally {
            $conexion = null;
        }    
        
     
} else {
    echo json_encode(['error' => 'No se recibió ninguna imagen']);
}

?>
