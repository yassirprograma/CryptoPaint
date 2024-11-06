
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

// Evento para checar la entrada del correo y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('correo').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputCorreo=document.getElementById('correo');

      if(!correoValido(inputCorreo.value)){
            inputCorreo.style.backgroundColor="#ff96ce";
      }else{      
            inputCorreo.style.backgroundColor="#ffffff";
      }
});

// Evento para checar la entrada del nombre de usuario y marcar de color rojo cuando se está ingresando algo inválido
document.getElementById('username').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputUsername=document.getElementById('username');

      if(!usernameValido(inputUsername.value)  || inputUsername.value.length<4){
            inputUsername.style.backgroundColor="#ff96ce";
      }else{
            inputUsername.style.backgroundColor="#ffffff";
      }

});

//Evento para cuando se da clic en aceptar el formulario
document.getElementById('restablecerform').addEventListener('submit', function(event) {
      event.preventDefault();

      // Obtener los valores de usuario y correo
      const username = document.getElementById('username').value;
      const correo = document.getElementById('correo').value;


      let camposValidos=1; //Bandera para ver si todos los campos fueron válidos, si no se cumple alguno, entonces se apaga
      
      //Checar si el username y el correo tienen el formato adecuado
      if(usernameValido(username) && username.length>=4){
            
      }else{
            alert("ERROR: El nombre de usuario ingresado no tiene el formato correcto, ingrese uno válido"); 
            camposValidos=0;
      }

      if(correoValido(correo) && correo!=""){

      }else{
            alert("ERROR: El nombre de usuario ingresado no tiene el formato correcto, ingrese uno válido"); 
            camposValidos=0;
      }


      if(camposValidos){
            //Luego mandamos el formulario al servidor
            const formData = new FormData();  //encapsular los datos
            formData.append('username', username);
            formData.append('correo', correo);
            

            fetch('../php/codigorestablecer.php', { //se genera una petición que se enviará al php
                  method: 'POST',
                  body: formData
            })
                  .then(response => response.json()) //Las peticiones POST generan una respuesta por parte del server, entonces
                  .then(data => {

                  let resultado=data['resultado'];
                  let mensaje=data['mensaje'];
                  alert(mensaje);
                  if(resultado==1){

                        
                        

                        //Si la response es positiva, entonces, se redirige al formulario donde se modificará la contra
                        location.href ='../pages/modificarcontra.html'; //Redirigimos a la página de chismesito

                  }else{
                        alert(mensaje);
                  }                  

                  // Manejar la respuesta del servidor
                  console.log(data);              
            })
            .catch(error => { //Si no llegó nada, es porque el servidor se cayó o no se pudo conectar a la base de datos
                  alert("Error interno del servidor");
                  console.error('Error:', error);
            });            

      }else{
            //Si no, no hacemos nada     
      }

      
});