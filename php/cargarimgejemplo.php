<?php


//Funciones para evitar inyecciones en el formulario Fuente:  Libro de Robin Nixon en la página 279
function sanitizaString($cadena){ //para evitar inyecciones a través del formulario            
    $cadena=stripcslashes($cadena);                        
    $cadena=strip_tags($cadena);
    $cadena=htmlentities($cadena);
    return $cadena;
}

//Prepared statements and parameterized queries are the recommended methods for securing database queries in modern PHP

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $idpeticion=$_POST['idpeticion'];


    // Include da la información para configuración y la conexión a la base de datos
    include_once("./datahost.php");




    //DESPUES DE HACER UN ECHO     JSON ENCODE, YA NO DEBERÍA HABER MÁS CÓDIGO
                                
        
        try {           
           //Probando nueva forma de hacer conexión usando dsn
           $conexion = new PDO($dsn, $usuarioMYSQL, $contraMYSQL);
        
        
           $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
       

           
           //SELECT idpeticion,titulopeticion,username,fechasolicitud,estatus FROM `peticion` WHERE username='tommy'
           
                   
           //$consulta = $conexion->prepare("SELECT idpeticion,titulopeticion,imgejemplo,nameimgejemplo,mimeimgejemplo,imgresultado,nameimgresultado,mimeimgresultado FROM `peticion` WHERE idpeticion=:idpeticion");        
           $consulta = $conexion->prepare("SELECT imgejemplo,mimeimgejemplo FROM `peticion` WHERE idpeticion=:idpeticion");        
           
           /**/
           //Nota bien importante, para evitar errores raros en PHP, siempre en bindparam, hacer bind con variables, no con constantes como cadenas "0" o cosas así
           
           $consulta->bindParam(':idpeticion',$idpeticion);
                                                                                                                                  
           $consulta->execute();      
           
           $fila = $consulta->fetch(PDO::FETCH_ASSOC);
                                  
           header('Content-Type: ' . $fila['mimeimgejemplo']);
           
           echo ($fila['imgejemplo']);    

        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error en la conexión a la base de datos: ' . $e->getMessage()]);
            
        } finally {
            $conexion = null;
        }    
        
     
} else {
    echo json_encode(['error' => 'Error en la transmisión']);
}




?>