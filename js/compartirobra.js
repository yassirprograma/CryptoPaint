function validUser(username, password){ //Manejo de promesas

    return new Promise((resolve, reject) => {
        let camposValidos=1; //Variable para validar, si se vuelve 0, significa que un campo no está bien
    
        if(username=="" || password==""){            
            camposValidos=0; //Si algún campo está vacío, entonces se invalida
        }
        
        
        
        if(camposValidos){
            
            //Aquí debe ir la función que se encargue de aplicar la función hash                        
            let password_cipher = CryptoJS.SHA256(password);
            
            // Enviar la solicitud al servidor
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password_cipher); //Se manda, pero ya cifrada
            
            
            
            fetch('../php/login.php', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
                    .then(json => {
                    // Manejar la respuesta del servidor                                                                                                                             
                        let resultado=json['success'];
                        let admin=json['admin'];
                        if(resultado==1 && admin=='1'){         
                                alert('Administrador');                                                                                          
                                resolve(1);                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                        }else{                        
                            alert('Credenciales inválidas');  
                            resolve(0);
                                                        
                        }                 
                    })
            .catch(error => {
                    
                    console.error('Error:', error);                
                    resolve(0);
            });
        }else{
            alert("Asegúrese de ingresar correctamente sus datos de usuario");
            resolve(0);
        }


      });
 

}



async function compartirObra() { //Asíncrona pues ocupa que se ejecute otra función asíncrona a parte de lo que hace

      let usernamestorage=sessionStorage.getItem('username');
      let inputImagen = document.getElementById('imagenInput');
      let valuePeticion=String(document.getElementById('selectPeticion').value); //Aquí podner  getElementById del inputtext del titulo de la petición
      let username=document.getElementById('username').value; //Se carga el usuario desde sessionstorage
      let password=document.getElementById('password').value; //Aquí podner  getElementById del inputtext de la confirmación contraseña 
      let inputllave_privada_emisor=document.getElementById('privatekey');


            
      const arrayConPuntoComa = valuePeticion.split(';');
      let usuarioDestino=String(arrayConPuntoComa[0]);
      let idPeticionSeleccionada=parseInt(arrayConPuntoComa[1]);
      

      if( usernamestorage==username ){
        const usuariovalido= await validUser(username,password);
        if(usuariovalido==1  ){
        
            if(idPeticionSeleccionada!="none")  {
                // Verificar si se seleccionó una imagen
                if (inputImagen.files.length > 0 && inputllave_privada_emisor.files.length>0) {
                    

                     /// Generación de secreto compartido y cifrado de la imagen
                        let file_llave_publica_destino=await descarga_llave_publica(usuarioDestino); 


                        let file_llave_privada_emisor=inputllave_privada_emisor.files[0];
                        
                        let filesharedsecret=await performKeyExchange(file_llave_privada_emisor,file_llave_publica_destino);
                        
                        //Se cifra la imagen antes de mandarse
                        let imagen = inputImagen.files[0]; 
                        let imagencifrada=await encryptImageWithAES(filesharedsecret, imagen);                                                
                        console.log(imagencifrada);
                        
                        let signaturefile=await signFile(imagencifrada,file_llave_privada_emisor);


                    

                    const formData = new FormData();
                    
                    formData.append('idpeticion',idPeticionSeleccionada);
                    formData.append('username',username);
                    formData.append('password',password);
                    formData.append('imagen', imagencifrada);  //se manda la imagen pero cifrada      
                    formData.append('firma',signaturefile);
                                    
    
                    fetch('../php/compartirobra.php', {
                        method: 'POST',
                        body: formData 
    
                    }).then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        window.location.href ='../pages/revisarpeticiones.html'; 
    
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                } else {
                    alert('No se seleccionó ninguna imagen.');
                }
            }else{
                alert('No se seleccionó ninguna obra o no se seleccionó una llave privada');
            }
                
        }
         
      }else{
        alert("Asegúrese de ingresar correctamente sus datos de usuario");
      }
      
    
      
}



function construyeOpcionesSelect(fila){ //Para las opciones del select
    id=String(fila['idpeticion']);
    title=String(fila['titulopeticion']);    
    usr=String(fila['username']);    


    let nuevaoptionhtml = document.createElement('option');
    
    nuevaoptionhtml.innerHTML = usr+" | "+id+" | "+title+" | "; //En el select se muestra id+titulo
    nuevaoptionhtml.value=usr+';'+id; //Pero el valor del select referirá al id que sí es único

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

        
        construyeOpcionesSelect(fila);
        
        
      });

      
      })
.catch(error => {
      console.error('Error:', error);
});