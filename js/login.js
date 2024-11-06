
function usernameValido(username){
                			
	// regular expression.
	let usernamevalido =  /^[0-9a-zA-Z]+$/;
	
	if( usernamevalido.test(username) ){		
		return true;
	}else{		
		return false;
	}
} 

sessionStorage.clear(); //Borrar toda info antes que nada


//Evento para checar la entrada del username  y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('username').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputUsername=document.getElementById('username');

      if(!usernameValido(inputUsername.value)  || inputUsername.value.length<4){
            inputUsername.style.backgroundColor="#ff96ce";
      }else{
            inputUsername.style.backgroundColor="#ffffff";
      }

});

//Evento para checar la entrada de la contraseña y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('password').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputPassword=document.getElementById('password');

      if( inputPassword.value.length<8){
            inputPassword.style.backgroundColor="#ff96ce";
      }else{
            inputPassword.style.backgroundColor="#ffffff";
      }

});


// Validación del formulario de inicio de sesión al dar clic en aceptar
document.getElementById('loginForm').addEventListener('submit', function(event) {
      event.preventDefault();
    
      
      // Obtener los valores de usuario y contraseña
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
    
      // Validar los campos si es necesario
      //Validación de username, y validación de que los campos no estén vacíos      
            

      let camposValidos=1; //Variable para validar, si se vuelve 0, significa que un campo no está bien

      if(username=="" || password==""){            
            camposValidos=0; //Si algún campo está vacío, entonces se invalida
      }

      if(!usernameValido(username)){
            alert("ERROR: El nombre de usuario ingresado no tiene el formato correcto, ingrese uno válido"); 
            camposValidos=0; //si el username no es válido, entonces, se invalida
      }



      
      if(camposValidos){
            //Aquí debe ir la función que se encargue de aplicar la función hash                        
            let password_cipher = CryptoJS.SHA256(password);
            
            
            // Enviar la solicitud al servidor
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password_cipher); //Se manda, pero ya cifrada
            


            fetch('./php/login.php', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
                  .then(json => {
                  // Manejar la respuesta del servidor                  
                        
                        let resultado=json['success'];
                        if(resultado==1){
                              let inputPassword=document.getElementById('password');
                              let inputUsername=document.getElementById('username');
                              inputPassword.style.backgroundColor="#77fa6e";
                              inputUsername.style.backgroundColor="#77fa6e";        

                              
                              //alert(json['mensaje']);                                                                                          
                              
                                                                                                                        
                              sessionStorage.setItem('idusuario',json['idusuario'])  //Se guardan los datos en session storage                                                                                                                                 
                              sessionStorage.setItem('username',json['username'])  //Se guardan los datos en session storage                                                                                                                                 
                              sessionStorage.setItem('password',json['password'])  //Se guardan los datos en session storage
                              sessionStorage.setItem('admin',json['admin'])  //Se guardan los datos en session storage
                                                            

                              if(json['admin']==0){                                    
                                    window.location.href ='./pages/panelusuario.html';
                              }else{
                                    window.location.href ='./pages/panelartista.html'; 
                              }                                                  
                              
                             /*
                              sessionStorage.setItem("user",datos)  //Se guardan los datos en session storage                                                                                                                                 

                              sesion=sessionStorage.getItem("user") //Se obtienen los valores desde el almacenamiento de sesion
                              
                              //Luego, si el tipo de usuario no es admin, se manda al panel de usuario
                              tipousuario=sesion[2]                               
                              alert(tipousuario)
                                        
                               */ 
                              
                        }else{
                              alert(json['mensaje']);
                        }                 

                  })
            .catch(error => {
                  console.error('Error:', error);
            });
      }else{
            alert("Asegúrese de llenar correctamente el formulario");
      }

    });
    

    