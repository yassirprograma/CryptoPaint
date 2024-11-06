

function correoValido(correo){
                			
	// regular expression.
	let correoValido = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
	
	if( correoValido.test(correo) ){		
		return true;
	}else{		
		return false;
	}
} 

function usernameValido(username){
                			
	// regular expression.
	let usernamevalido =  /^[0-9a-zA-Z]+$/;
	
	if( usernamevalido.test(username) ){		
		return true;
	}else{		
		return false;
	}
} 


function nombreValido(nombre){
                			
	// regular expression.
	let nombrevalido =  /^[a-zA-Z]+$/;
	
	if( nombrevalido.test(nombre) ){	
            
		return true;
	}else{		
		return false;
	}
} 








//Evento para checar la repetición de la contraseña y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('repeatpassword').addEventListener('input', function(event) {
      let valor = event.target.value;
      console.log("llenando");

      const password = document.getElementById('password'); 

      const verificacion=document.getElementById('repeatpassword');

      if(password.value!=verificacion.value || password.value.length<8){
            verificacion.style.backgroundColor="#ff96ce";
      }else{
            verificacion.style.backgroundColor="#ffffff";
      }
      
});


//Evento para checar la entrada de la contraseña y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('password').addEventListener('input', function(event) {
      let valor = event.target.value;
      console.log("llenando");

      const password = document.getElementById('password'); 

      const verificacion=document.getElementById('repeatpassword');

      if(password.value.length<8){            
            password.style.backgroundColor="#ff96ce";                
      }else{
            password.style.backgroundColor="#ffffff";
      }

      if(password.value!=verificacion.value || password.value.length<8){            
            verificacion.style.backgroundColor="#ff96ce";            
      }else{            
            verificacion.style.backgroundColor="#ffffff";
      }
   
});

//Evento para verificar la entrada de correo y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('correo').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputCorreo=document.getElementById('correo');

      if(!correoValido(inputCorreo.value)){
            inputCorreo.style.backgroundColor="#ff96ce";
      }else{      
            inputCorreo.style.backgroundColor="#ffffff";
      }
});

//Evento para verificar la entrada de correo y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('nombre').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputNombre=document.getElementById('nombre');

      if(!nombreValido(inputNombre.value)){            
            inputNombre.style.backgroundColor="#ff96ce";
      }else{      
            inputNombre.style.backgroundColor="#ffffff";
      }
});

document.getElementById('apellido').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputApellido=document.getElementById('apellido');

      if(!nombreValido(inputApellido.value)){
            inputApellido.style.backgroundColor="#ff96ce";
      }else{      
            inputApellido.style.backgroundColor="#ffffff";
      }
});


//Evento para verificar la entrada de nombre de usuario y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('username').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputUsername=document.getElementById('username');

      if(!usernameValido(inputUsername.value)  || inputUsername.value.length<4){
            inputUsername.style.backgroundColor="#ff96ce";
      }else{
            inputUsername.style.backgroundColor="#ffffff";
      }

});

// Validación del formulario de inicio de sesión , al dar click en aceptar
document.getElementById('form').addEventListener('submit',  async function(event) {
      event.preventDefault();
          
      // Obtener los valores de usuario y contraseña
      const nombre = document.getElementById('nombre').value;
      const apellido = document.getElementById('apellido').value;
      const username = document.getElementById('username').value;      
      const correo = document.getElementById('correo').value;
      const password = document.getElementById('password').value;
      const passwordrpt = document.getElementById('repeatpassword').value                  

      // Validar los campos si es necesario
      let camposValidos=1; //Bandera para ver si todos los campos fueron válidos, si no se cumple alguno, entonces se apaga
      
      
      

      if(username!="" && correo!="" && password!="" && passwordrpt!="" && nombre!="" && apellido!=""){
            
      }else {            
            alert("ERROR DE REGISTRO: Por favor, asegúrese de correctamente llenar todos los campos");            
            camposValidos=0; //Si algo no está bien, bajamos la bandera de camposValidos
      }
      

      if(usernameValido(username) && username.length>=4){
            console.log("Username válido");
      }else{
            console.log("Nombre de usuario inválido");
            alert("ERROR DE REGISTRO: El nombre de usuario ingresado no tiene el formato correcto, ingrese uno válido"); 
            camposValidos=0; //Si algo no está bien, bajamos la bandera de camposValidos
      }

      if(correoValido(correo)){
            console.log("Email válido");
            
      }else {
            
            console.log("Email inválido");
            alert("ERROR DE REGISTRO: El correo ingresado no tiene el formato correcto,, ingrese uno válido");
            camposValidos=0; //Si algo no está bien, bajamos la bandera de camposValidos
      }

      if(password==passwordrpt && password.length>=8){            
            console.log("Las contraseñas coinciden y tienen el tamaño adecuado");
      }else{
            
            console.log("Procure llenar los campos de contraseña correctamente");
            alert("ERROR DE REGISTRO: Procure llenar los campos de contraseña correctamente");                                                

            camposValidos=0; //Si algo no está bien, bajamos la bandera de camposValidos
      }

      
      


      //Si los campos se llenaron bien, entonces nos conectamos al servidor

      if(camposValidos){
            //Aquí debe ir la función que se encargue de aplicar la función hash                        
            let password_cipher = CryptoJS.SHA256(password);

            /* Enviar la solicitud de registro al servidor, pero el servidor debe verificar que no haya
            duplicados de usuario o correo en la base de datos  antes de insertar       
      */
            
            const formData = new FormData();  //encapsular los datos
            formData.append('nombre', nombre.toUpperCase());
            formData.append('apellido', apellido.toUpperCase());
            formData.append('username', username);
            formData.append('correo', correo);
            formData.append('password', password_cipher);  //Se manda, pero cifrada         
            formData.append('admin', 0);  //Se manda, pero cifrada                     

            
      
            fetch('../php/registro.php', { //se genera una petición que se enviará al archivo registro.php
                  method: 'POST',
                  body: formData
            })
                  .then(response => response.json()) //Las peticiones POST generan una respuesta por parte del server, entonces
                  .then(data => {

                  // Manejar la respuesta del servidor
                  console.log(data);        
                  let resultado=data['success'];

                  if(resultado==1){ //Si el valor success es 1, entonces el registro fue exitoso
                        alert(data['mensaje']); //Se imprime el mensaje del servidor

                        
                        generar_descargar_subirllaveEC(username) //Del archivo llavesEC

                        //location.href ='../index.html'; //Redirigimos a la página de chismesito


                  }else{
                        //Si el valor success es diferente de , entonces el registro no fue exitoso
                        alert(data['mensaje']); //Se imprime el mensaje del servidor
                  }
                  
            })
            .catch(error => { //Si no llegó nada, es porque el servidor se cayó o no se pudo conectar a la base de datos
                  alert("Error interno del servidor");
                  console.error('Error:', error);
            });            
      }


});
    

    