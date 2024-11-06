async function cargarImagenes() {

    //Primero limpiamos los div de las imagenes
       //Primero limpiamos los div de las imagenes
       var miDiv1 = document.getElementById('imgejemplo');    
       while (miDiv1.firstChild) {
           miDiv1.removeChild(miDiv1.firstChild);
       }
       
       var miDiv2 = document.getElementById('imgresultado');    
       while (miDiv2.firstChild) {
           miDiv2.removeChild(miDiv2.firstChild);
       }
   

    let valuePeticion=String(document.getElementById('selectPeticion').value);
    let inputllave_privada_emisor=document.getElementById('privatekey');
    
    const arrayConPuntoComa = valuePeticion.split(';');
    let usuarioDestino=String(arrayConPuntoComa[0]);
    let idpeticion=parseInt(arrayConPuntoComa[1]);
    let titulopeticion=String(arrayConPuntoComa[2]);


    if(inputllave_privada_emisor.files.length >0){

        
        /// Generación de secreto compartido 
        const file_llave_publica_destino=await descarga_llave_publica("yassirprograma"); //La del admin                        
        const file_llave_privada_emisor=inputllave_privada_emisor.files[0];        
        const filesharedsecret=await performKeyExchange(file_llave_privada_emisor,file_llave_publica_destino);
        
        

        const formData=new FormData();
        formData.append('idpeticion',idpeticion);

        
        
        // Realizar una solicitud Fetch a servidor.php
        await fetch('../php/cargarimgejemplo.php', { //fetch para recuperar la imagen de ejemplo
            method: 'POST',
            body: formData

        }).then(response =>response.blob()) // Convertir la respuesta a JSON
        .then(async blob => {
            
            console.log(blob);
            //const archivoresultado = new File([blob],  `temp`, { type: blob.type });        
            
            if(blob['size']>0){                
                //Se descifra la imagen después de recibirse                                
                let  archivoImagencifrada = new File([blob],  `temp`, { type: blob.type });                
                let imagendescifrada=await decryptImageWithAES(filesharedsecret, archivoImagencifrada);                                                                
                console.log(imagendescifrada);


                let imageUrl = URL.createObjectURL(imagendescifrada); //despues de esta función se debe aplicar la función de descifrado
                // Crear un elemento de imagen y establecer la fuente
                let imagen = document.createElement('img');

                imagen.src = imageUrl;
                
                // Agregar la imagen al contenedor en el HTML
                document.getElementById('imgejemplo').appendChild(imagen);
            }

        })
        .catch(error => {
            console.error('Error al cargar las imágenes:', error);
        });
            


        let archivoverificarfirma;
        let archivoimgresultado_descifrado;
        
        // Realizar una solicitud Fetch a servidor.php
       // Realizar una solicitud Fetch a servidor.php
       await fetch('../php/cargarimgresultado.php', { //fetch para recuperar la imagen de ejemplo
            method: 'POST',
            body: formData

        }).then(response =>response.blob()) // Convertir la respuesta a JSON
        .then(async blob => {
            
            console.log(blob);
            //const archivoresultado = new File([blob],  `temp`, { type: blob.type });        
            
            if(blob['size']>0){
                //Se descifra la imagen después de recibirse                                
                let  archivoImagencifrada = new File([blob],  `temp`, { type: blob.type });                
                archivoverificarfirma=archivoImagencifrada;
                let imagendescifrada=await decryptImageWithAES(filesharedsecret, archivoImagencifrada);                                                                
                console.log(imagendescifrada);
                archivoimgresultado_descifrado=imagendescifrada;

                
                
                let imageUrl = URL.createObjectURL(imagendescifrada); //despues de esta función se debe aplicar la función de descifrado
                // Crear un elemento de imagen y establecer la fuente
                let imagen = document.createElement('img');

                imagen.src = imageUrl;
                
                // Agregar la imagen al contenedor en el HTML
                document.getElementById('imgresultado').appendChild(imagen);                
            }

        })
        .catch(error => {
            console.error('Error al cargar las imágenes:', error);
        });




       // Realizar una solicitud Fetch al servidor para pedir la firma de la imagen resultado       
       await fetch('../php/cargarfirmaresultado.php', { //fetch para recuperar la imagen de ejemplo
        method: 'POST',
        body: formData

        }).then(response =>response.blob()) // Convertir la respuesta a JSON
        .then(async blob => {
            
            console.log(blob);
            //const archivoresultado = new File([blob],  `temp`, { type: blob.type });        
            
            if(blob['size']>0 && archivoimgresultado_descifrado.size>0){                    
                let  archivofirma = new File([blob],  `temp`, { type: 'application/x-pem-file' });                                                    
                console.log(archivofirma);
                downloadFile(archivofirma,"firma_Img_resultado_"+titulopeticion+".pem","Firma de la imagen resultado");   
                downloadFile(archivoverificarfirma,"archivo_firmado_Img_resultado_"+titulopeticion,"Imagen resultado cifrada");
                downloadFile(file_llave_publica_destino,"llavepublica_firma_Img_resultado_"+titulopeticion+".pem","Llave pública ");                
                downloadFile(archivoimgresultado_descifrado,"Img_resultado_"+titulopeticion,"Imagen resultado descifrada");                

            }

        })
        .catch(error => {
            console.error('Error al cargar las imágenes:', error);
        });


    }else{
        alert("Asegúrese de seleccionar su llave privada");
    }


  }



///Luego luego entrando a la página deberá mostrar las dos listas y cargar 
//Pero a parte debe haber una función para cuando se presione la revelación de la obra

function construyeFilaTablaHTML(fila){  //Pinta una fila en la tabla, dependiendo si es obra antigua o pendiente
    let state=fila['estatus'];    
    let id=fila['idpeticion'];
    let title=fila['titulopeticion'];
    let usr=fila['username'];
    let date=fila['fechasolicitud'];    

    let contenedor;
    if(state=="0"){        
        state="No disponible"; //Para que sea entendible por el usuario
        contenedor = document.getElementById('tablapeticionespendientes');      
    }else{
        state="Disponible"; //Para que sea entendible por el usuario
        contenedor = document.getElementById('tablapeticionesantiguas');      
    }


    let nuevafilahtml = document.createElement('tr');
    nuevafilahtml.innerHTML = '<td class="border border-black">'+id+'</td>'+'<td class="border border-black">'+title+'</td>'+'<td class="border border-black">'+usr+'</td>'+'<td class="border border-black">'+date+'</td>'+'<td class="border border-black">'+state+'</td>';

            
    contenedor.appendChild(nuevafilahtml);

}

function construyeOpcionesSelect(fila){
    let id=String(fila['idpeticion']);
    let title=String(fila['titulopeticion']);    
    let usr=fila['username'];

    let nuevaoptionhtml = document.createElement('option');
    
    nuevaoptionhtml.innerHTML =id+ " | "+title+" | "+usr; //En el select se muestra id+titulo
    nuevaoptionhtml.value=usr+';'+id+";"+title; //Pero el valor del select referirá al id que sí es único
    
    select = document.getElementById('selectPeticion');
    select.appendChild(nuevaoptionhtml);



}



/////MAIN
const username=sessionStorage.getItem('username');

const formData=new FormData();

formData.append('username',username);



fetch('../php/peticionescliente.php', {
    method: 'POST',
    body: formData
}).then(response => response.json())
      .then(json => {

      // Manejar la respuesta del servidor                              
                    
      json.forEach(fila => {
        // Hacer algo con cada elemento del array
        console.log(fila);
        construyeFilaTablaHTML(fila);
        

        construyeOpcionesSelect(fila); //El select podrá revelar cual sea, si aun no está disponible la obra, entonces no la muestra, pero la imagen ejemplo, siempre
        
        
      });



      
      })
.catch(error => {
      console.error('Error:', error);
});