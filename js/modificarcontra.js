
function usernameValido(username){
                			
	// regular expression.
	let usernamevalido =  /^[0-9a-zA-Z]+$/;
	
	if( usernamevalido.test(username) ){		
		return true;
	}else{		
		return false;
	}
} 



//Evento para checar le entrada del código, y verificar que coincida con el tamaño
document.getElementById('codigo').addEventListener('input', function(event) {
      let valor = event.target.value;
      let inputCodigo=document.getElementById('codigo');

      if(inputCodigo.value.length!=8){ //Si el tamaño del código ingresado difiere de 8, entonces se poner rojo
            inputCodigo.style.backgroundColor="#ff96ce";
      }else{     
            inputCodigo.style.backgroundColor="#ffffff";
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


document.getElementById('form').addEventListener('submit', function(event) {
      event.preventDefault();

      const codigo = document.getElementById('codigo').value;
      const username = document.getElementById('username').value;
      const passwordnueva = document.getElementById('password').value;
      const repeatpasswordnueva = document.getElementById('repeatpassword').value;


      let camposValidos=1;
      

      if(codigo.length!=8){
            alert("La longitud del código no es correcta");                                                
            camposValidos=0; //Si el código no es de 8 caracteres, no se aceptará
      }
      

      if(usernameValido(username) && username.length>=4){
      
      }else{
            alert("ERROR: El nombre de usuario ingresado no tiene el formato correcto, ingrese uno válido"); 
            camposValidos=0;
      }

      if(passwordnueva==repeatpasswordnueva && passwordnueva.length>=8){            
            
      }else{
            
            console.log("Procure llenar los campos de contraseña correctamente");
            alert("ERROR DE REGISTRO: Procure llenar los campos de contraseña correctamente");                                                

            camposValidos=0; //Si algo no está bien, bajamos la bandera de camposValidos
      }


      if(camposValidos){
            
            //Aquí debe ir la función que se encargue de aplicar la función hash                        
            let passwordnueva_cipher = CryptoJS.SHA256(passwordnueva);


            const formData = new FormData();  //encapsular los datos
            formData.append('codigo', codigo);
            formData.append('passwordnueva', passwordnueva_cipher); //Se manda, pero ya cifrada
            formData.append('username', username);
            
//            console.log(passwordnueva+passwordnueva_cipher);
      
            fetch('../php/modificarcontra.php', { //se genera una petición que se enviará al archivo registro.php
                  method: 'POST',
                  body: formData
            })
                  .then(response => response.json()) //Las peticiones POST generan una respuesta por parte del server, entonces
                  .then(data => {
      
                  resultado=data['resultado'];
                  mensaje=data['mensaje'];

                  if(resultado==1){                        
                        alert(mensaje);

                        
                        generar_descargar_subirllaveEC(username) //Del archivo llavesEC
                        alert("Por favor guarde su nuevo par de llaves y elimine los anteriores");


                        location.href="../index.html";
                  }else {
                        alert(mensaje);
                  }

                  // Manejar la respuesta del servidor
                  console.log(data);              
            })
            .catch(error => { //Si no llegó nada, es porque el servidor se cayó o no se pudo conectar a la base de datos
                  alert("Error interno del servidor");
                  console.error('Error:', error);
            });            
      }


});