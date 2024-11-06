<?php
header('Content-Type: application/json');

//Funciones para evitar inyecciones en el formulario Fuente:  Libro de Robin Nixon en la página 279
function sanitizaString($cadena){ //para evitar inyecciones a través del formulario            
    $cadena=stripcslashes($cadena);                        
    $cadena=strip_tags($cadena);
    $cadena=htmlentities($cadena);
    return $cadena;
}

//Prepared statements and parameterized queries are the recommended methods for securing database queries in modern PHP

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
     
    
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
            
        
            $consulta = $conexion->prepare("INSERT INTO peticion (, , , , ,, ) VALUES (?, ?, ?, ?, ?, ?,?)");        
            
            //Nota bien importante, para evitar errores raros en PHP, siempre en bindparam, hacer bind con variables, no con constantes como cadenas "0" o cosas así
            
            $consulta->bindParam(1,$titulopeticion);
                                                    
            $consulta->bindParam(2,$imgejemplo, PDO::PARAM_LOB);  //Cuando son archivos LOB
                                
                                    
            $consulta->execute();      

            $response = ['message' => ''];       
                        
            echo json_encode($response);    

        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error en la conexión a la base de datos: ' . $e->getMessage()]);
            
        } finally {
            $conexion = null;
        }    
        
     
} else {
    echo json_encode(['error' => 'Error en la transmisión']);
}




?>