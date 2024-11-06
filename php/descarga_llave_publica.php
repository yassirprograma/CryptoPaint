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
    
    $username=$_POST['username'];


    // Include da la información para configuración y la conexión a la base de datos
    include_once("./datahost.php");




    //DESPUES DE HACER UN ECHO     JSON ENCODE, YA NO DEBERÍA HABER MÁS CÓDIGO
                                
        
        try {           
           //Probando nueva forma de hacer conexión usando dsn
           $conexion = new PDO($dsn, $usuarioMYSQL, $contraMYSQL);
        
        
           $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
       

           
           
           
                   
           
           $consulta = $conexion->prepare("SELECT llavepublicaEC,mimellavepublicaEC FROM `usuario` WHERE username=:username");        
           
           /**/
           //Nota bien importante, para evitar errores raros en PHP, siempre en bindparam, hacer bind con variables, no con constantes como cadenas "0" o cosas así
           
           $consulta->bindParam(':username',$username);
                                                                                                                                  
           $consulta->execute();      
           
           $fila = $consulta->fetch(PDO::FETCH_ASSOC);
                                  
           header('Content-Type: ' . $fila['mimellavepublicaEC']);
           
           echo ($fila['llavepublicaEC']);    

        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error en la conexión a la base de datos: ' . $e->getMessage()]);
            
        } finally {
            $conexion = null;
        }    
        
     
} else {
    echo json_encode(['error' => 'Error en la transmisión']);
}



?>