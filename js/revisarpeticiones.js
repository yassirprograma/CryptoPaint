async function cargarImagenes() {

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


    // URL de tu archivo PHP que devuelve las imágenes
    if(inputllave_privada_emisor.files.length >0){
        /// Generación de secreto compartido 
        const file_llave_publica_destino=await descarga_llave_publica(usuarioDestino); //La del admin                        
        const file_llave_privada_emisor=inputllave_privada_emisor.files[0];        
        const filesharedsecret=await performKeyExchange(file_llave_privada_emisor,file_llave_publica_destino);


        const formData=new FormData();
        formData.append('idpeticion',idpeticion);

        
        let archivoverificarfirma;
        let archivoimgpeticion_descifrado;

        // Realizar una solicitud Fetch a servidor.php
        await fetch('../php/cargarimgejemplo.php', { //fetch para recuperar la imagen de ejemplo
            method: 'POST',
            body: formData

        }).then(response =>response.blob()) // Convertir la respuesta a JSON
        .then(async blob => {

            console.log(blob);

            if(blob['size']>0){
                let archivoImagen = new File([blob],  `temp`, { type: blob.type });                
                archivoverificarfirma=archivoImagen;
                let imagendescifrada=await decryptImageWithAES(filesharedsecret, archivoImagen);                                                                
                console.log(imagendescifrada);
                archivoimgpeticion_descifrado=imagendescifrada;


                let imageUrl = URL.createObjectURL(imagendescifrada); //despues de esta función se debe aplicar la función de descifrado
                
                // Crear un elemento de imagen y establecer la fuente
                let imagen = document.createElement('img');            
                imagen.src = imageUrl;

                // Agregar la imagen al contenedor en el HTML
                document.getElementById('imgejemplo').appendChild(imagen);
            }


        }).catch(error => {
            console.error('Error al cargar las imágenes:', error);
        });



        
        

        await fetch('../php/cargarimgresultado.php', { //fetch para recuperar la imagen resultado
            method: 'POST',
            body: formData

        }).then(response =>response.blob()) // Convertir la respuesta a JSON
        .then(async blob => {
            
            console.log(blob);
            
            if(blob['size']>0){
                let archivoImagen = new File([blob],  `temp`, { type: blob.type });                                
                let imagendescifrada=await decryptImageWithAES(filesharedsecret, archivoImagen);                                                                
                console.log(imagendescifrada);

                let imageUrl = URL.createObjectURL(imagendescifrada); //despues de esta función se debe aplicar la función de descifrado

                // Crear un elemento de imagen y establecer la fuente
                var imagen = document.createElement('img');
                imagen.src = imageUrl;

                // Agregar la imagen al contenedor en el HTML
                document.getElementById('imgresultado').appendChild(imagen);

            }        

        })
        .catch(error => {
            console.error('Error al cargar las imágenes:', error);
        });


        // Realizar una solicitud Fetch al servidor para pedir la firma de la imagen resultado       
        await fetch('../php/cargarfirmaejemplo.php', { //fetch para recuperar la imagen de ejemplo
            method: 'POST',
            body: formData

            }).then(response =>response.blob()) // Convertir la respuesta a JSON
            .then(async blob => {
                
                console.log(blob);
                
                
                if(blob['size']>0 && archivoimgpeticion_descifrado.size>0){                    
                    let  archivofirma = new File([blob],  `temp`, { type: 'application/x-pem-file' });                                                    
                    console.log(archivofirma);
                    downloadFile(archivofirma,"firma_peticion_"+titulopeticion+".pem","Firma de la imagen de ejemplo");   
                    downloadFile(archivoverificarfirma,"archivo_firmado_peticion_"+titulopeticion,"Imagen de ejemplo cifrada");
                    downloadFile(file_llave_publica_destino,"llavepublica_firma_peticion_"+titulopeticion+".pem","Llave pública ");                
                    downloadFile(archivoimgpeticion_descifrado,"Img_ejemplo_peticion_"+titulopeticion,"Imagen de ejemplo descifrada");                

                }

        })
        .catch(error => {
            console.error('Error al cargar las imágenes:', error);
        });

    }



    

    
    

  }

  



function construyeFilaTablaHTML(fila){  //Pinta una fila en la tabla, dependiendo si es obra antigua o pendiente
    let state=fila['estatus'];    
    let id=fila['idpeticion'];
    let title=fila['titulopeticion'];
    let usr=fila['username'];
    let date=fila['fechasolicitud'];    

    
    let nuevafilahtml = document.createElement('tr');
    nuevafilahtml.innerHTML = '<td class="border border-black" >'+id+'</td>'+'<td class="border border-black">'+title+'</td>'+'<td class="border border-black">'+usr+'</td>'+'<td class="border border-black">'+date+'</td>'+'<td class="border border-black">'+state+'</td>';

    let contenedor;
    if(state=="0"){        
        contenedor = document.getElementById('tablapeticionespendientes');      
    }else{
        contenedor = document.getElementById('tablapeticionesantiguas');      
    }
        
    contenedor.appendChild(nuevafilahtml);

}

function construyeOpcionesSelect(fila){ //Para las opciones del select
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

///Luego luego entrando a la página deberá mostrar las dos listas y cargar 
const username=sessionStorage.getItem('username');//ni se ocupa en este caso



const formData=new FormData();

formData.append('username',username); //ni se ocupa en este caso



fetch('../php/revisarpeticiones.php', {
    method: 'POST',
    body: formData
}).then(response => response.json())
      .then(json => {
      
      
      // Manejar la respuesta del servidor                                                  
      json.forEach(fila => {        //Para cada fila obtenida de la consulta
        // Hacer algo con cada elemento del array
        console.log(fila);

        construyeFilaTablaHTML(fila);
        
        construyeOpcionesSelect(fila);
        
        
      });

      
      })
.catch(error => {
      console.error('Error:', error);
});