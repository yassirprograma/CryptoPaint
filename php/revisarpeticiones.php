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


    $username=$_POST['username'];    //No se ocupa

    //DESPUES DE HACER UN ECHO     JSON ENCODE, YA NO DEBERÍA HABER MÁS CÓDIGO     
    /*
    $response = ['message' => 'webos desde el server '.$username];       
                        
    echo json_encode($response);    
     */
                
        try {           
            //Probando nueva forma de hacer conexión usando dsn
            $conexion = new PDO($dsn, $usuarioMYSQL, $contraMYSQL);
        
        
            $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        

            
            //SELECT idpeticion,titulopeticion,username,fechasolicitud,estatus FROM `peticion` WHERE username='tommy'
            
                    
            $consulta = $conexion->prepare("SELECT idpeticion,titulopeticion,username,fechasolicitud,estatus FROM `peticion`");        
            


            /**/
            //Nota bien importante, para evitar errores raros en PHP, siempre en bindparam, hacer bind con variables, no con constantes como cadenas "0" o cosas así
            
            
                                                                
                                                                    
            $consulta->execute();      

            $filasobtenidas = $consulta->fetchALL(PDO::FETCH_ASSOC);

            
                        
            echo json_encode($filasobtenidas);    
             
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error en la conexión a la base de datos: ' . $e->getMessage()]);
            
        } finally {
            $conexion = null;
        }    
     
     
} else {
    echo json_encode(['error' => 'Error en la transmisión']);
}




?>