


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
                        if(resultado==1){         
                                alert('Usuario válido');                                                                                          
                                resolve(1);                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                        }else{                        
                            alert(json['mensaje']);  
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





async function subirImagen() { //Asíncrona pues ocupa que se ejecute otra función asíncrona a parte de lo que hace
    
      

      let usernamestorage=sessionStorage.getItem('username');
      let inputImagen = document.getElementById('imagenInput');
      let titulopeticion=document.getElementById('tituloObra').value; //Aquí podner  getElementById del inputtext del titulo de la petición
      let username=document.getElementById('username').value; //Se carga el usuario desde sessionstorage
      let password=document.getElementById('password').value; //Aquí podner  getElementById del inputtext de la confirmación contraseña 
      let inputllave_privada_emisor=document.getElementById('privatekey');


      let fechaActual = new Date();

      // Obtener los componentes de la fecha
      let dia = fechaActual.getDate();
      let mes = fechaActual.getMonth() + 1; // Los meses son indexados desde 0
      let anio = fechaActual.getFullYear();
      
      
                  

      if(usernamestorage==username){
        const usuariovalido= await validUser(username,password); //validacion de usuario

        if(usuariovalido==1  ){
                                
            if((titulopeticion.length>=4 && titulopeticion.length<=25))  {
                
                // Verificar si se seleccionó una imagen y una llave
                if (inputImagen.files.length > 0 && inputllave_privada_emisor.files.length>0) {

                    
                    /// Generación de secreto compartido y cifrado de la imagen
                        let file_llave_publica_destino=await descarga_llave_publica("yassirprograma"); //La del admin                        

                        let file_llave_privada_emisor=inputllave_privada_emisor.files[0];
                        
                        let filesharedsecret=await performKeyExchange(file_llave_privada_emisor,file_llave_publica_destino);
                        
                        //Se cifra la imagen antes de mandarse
                        let imagen = inputImagen.files[0]; 
                        let imagencifrada=await encryptImageWithAES(filesharedsecret, imagen);                                                
                        console.log(imagencifrada);

                        //downloadFile(imagencifrada,"imagencifrada",'Descargar imagen cifrada');

                        let signaturefile=await signFile(imagencifrada,file_llave_privada_emisor);

                    


                    const formData = new FormData();
                    
                    formData.append('titulopeticion',titulopeticion);
                    formData.append('username',username);
                    formData.append('password',password);
                    formData.append('imagen', imagencifrada);    //se manda la imagen pero cifrada      
                    formData.append('firma',signaturefile);
                                    
    
                    fetch('../php/solicitarobra.php', {
                        method: 'POST',
                        body: formData 
    
                    }).then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        //window.location.href ='../pages/peticionescliente.html'; 
    
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                } else {
                    alert('No se seleccionó ninguna imagen o no se seleccionó una llave privada');
                }
            }else{
                alert('Por favor ingrese un titulo de al menos 4 caracteres y máximo 25, para su obra');
            }
                
        }
         
      }else{
        alert("Asegúrese de ingresar correctamente sus datos de usuario");
      }
      
    
      
}


  
