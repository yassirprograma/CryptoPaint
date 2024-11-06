 // Función para dar formato PEM
 function formatPEM(type, keyData) {
     const header = `-----BEGIN ${type}-----`;
     const footer = `-----END ${type}-----`;
     const formattedKey = `${header}\n${keyData}\n${footer}`;
     return formattedKey;
 }

 // Función para crear y simular clic en un enlace de descarga
 function downloadKey(data, filename, label) {
     const downloadLink = document.createElement('a');
     downloadLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);
     downloadLink.download = filename;
     downloadLink.innerHTML = label;

     // Agregar el enlace al cuerpo del documento
     document.body.appendChild(downloadLink);

     // Simular clic en el enlace
     downloadLink.click();

     // Eliminar el enlace después de la descarga
     document.body.removeChild(downloadLink);
 }

function subirllavepublicaEC(usuario, publicKeyPem){

    // Crea un Blob con la cadena PEM y un tipo MIME adecuado
    const blob = new Blob([publicKeyPem], { type: 'application/x-pem-file' });
    // Convierte el Blob en un archivo
    const filepublickey = new File([blob], 'public_keyEC_'+String(usuario)+'.pem', { type: 'application/x-pem-file' });
    

    formData=new FormData();
    formData.append('username',usuario);
    formData.append('llavepublicaEC', filepublickey);              


    fetch('../php/subirllaveEC.php', {
        method: 'POST',
        body: formData 

    }).then(response => response.json())
    .then(data => {
        alert(data['message']);        

    })
    .catch(error => {
        console.error('Error:', error);
    });
}




 function generar_descargar_subirllaveEC(usuario){//Generar, descargar las llaves y subir la pública al servidor                       

    
    ///----Generación de llaves--------------------------------------------------------------------------------------//
    // Algoritmo de curva elíptica (EC)
   const curveName = 'secp256k1';
   // Crear instancia de la curva elíptica
   const ec = new elliptic.ec(curveName);

   // Generar un par de claves EC
   const keyPair = ec.genKeyPair();
   
   // Obtener la clave privada en formato PEM
   const privateKeyPem = formatPEM('PRIVATE KEY', keyPair.getPrivate('hex'));

   // Obtener la clave pública en formato PEM
   const publicKeyPem = formatPEM('PUBLIC KEY', keyPair.getPublic('hex'));
   ///-----------------------------------------------------------------------------------------------------------------//
   
   
   


   ///----Descarga de llaves--------------------------------------------------------------------------------------//    
   alert("Por favor guarde sus llaves en un lugar seguro y procure no perderlas XD");
   downloadKey(privateKeyPem, 'private_keyEC_'+String(usuario)+'.pem', 'Descargar clave privada');
   downloadKey(publicKeyPem, 'public_keyEC_'+String(usuario)+'.pem', 'Descargar clave pública');
   
   
   var miDiv = document.getElementById('form');
    while (miDiv.firstChild) {
       miDiv.removeChild(miDiv.firstChild);
    }

    // Botón para descargar claves
    const downloadButton = document.createElement('button');
    downloadButton.innerHTML = 'Descargar Claves nuevamente';
    downloadButton.onclick = function() {
        downloadKey(privateKeyPem, 'private_keyEC_'+String(usuario)+'.pem', 'Descargar clave privada');
        downloadKey(publicKeyPem, 'public_keyEC_'+String(usuario)+'.pem', 'Descargar clave pública');
    };

    document.getElementById('form').appendChild(downloadButton);
    downloadButton.setAttribute("class","animate-bounce w-full my-5 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-800")

    ///-----------------------------------------------------------------------------------------------------------------//

    
    ///-------------Subir la llave EC----------------------------------------------------------------------------------------------------//
    

    subirllavepublicaEC(usuario,publicKeyPem);

    


    ///-----------------------------------------------------------------------------------------------------------------//

}

