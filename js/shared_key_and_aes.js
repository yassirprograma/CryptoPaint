//___________________________________________________________AES______________________________________

async function encryptImageWithAES(filesharedsecret, imageFile) {    
    let encryptedImage=await processImageWithAES(true,filesharedsecret, imageFile);
    return encryptedImage;
}

async function decryptImageWithAES(filesharedsecret,imageFile) {
    let decryptedImage=await processImageWithAES(false,filesharedsecret, imageFile);
    return decryptedImage;
}

async function processImageWithAES(isEncrypt,filesharedsecret,imageFile) {

    const ecParamsFile = filesharedsecret; //El secretoCompartido
    //const downloadLink = document.getElementById('downloadLink'); //El botón de descargar, buscar dowloadLink


    if (!ecParamsFile || !imageFile) {
        alert('Seleccione un archivo de parámetros EC y una imagen.');
        return;
    }

    try {
        // Leer el contenido del archivo de parámetros EC PEM
        const ecParamsPEM = await readFileAsString(ecParamsFile);

        // Obtener el contenido entre las líneas BEGIN y END
        const match = /-----BEGIN EC PARAMETERS-----([\s\S]+?)-----END EC PARAMETERS-----/.exec(ecParamsPEM);

        if (!match) {
            throw new Error('Formato de archivo de parámetros de clave incorrecto.');
        }

        // Eliminar espacios, retornos de carro y saltos de línea
        const ecParamsString = match[1].replace(/\s/g, '');

        console.log('Parámetros EC (Bytes):', hexToBytes(ecParamsString));

        // Convertir la cadena de parámetros EC PEM a bytes
        const ecParamsBytes = hexToBytes(ecParamsString);

        console.log('Clave (Bytes):', ecParamsBytes);

        // Generar una clave a partir de la clave
        const key = await window.crypto.subtle.importKey('raw', ecParamsBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

        console.log('Clave Importada:', key);

        // Leer la imagen como un array de bytes
        const imageArrayBuffer = await readFileAsArrayBuffer(imageFile);

        console.log('Imagen (Bytes):', new Uint8Array(imageArrayBuffer));

        let resultArrayBuffer;

        if (isEncrypt) {
            // Generar un IV (Vector de Inicialización) aleatorio
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            console.log('IV (Bytes):', iv);

            // Configurar los parámetros para la operación de cifrado
            const additionalData = new Uint8Array(0); // Datos adicionales para autenticación
            resultArrayBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData }, key, imageArrayBuffer);

            // Concatenar el IV a los datos cifrados
            resultArrayBuffer = new Uint8Array([...iv, ...new Uint8Array(resultArrayBuffer)]);
        } else {
            // En el caso del descifrado, extraemos el IV de los primeros 12 bytes
            const iv = new Uint8Array(imageArrayBuffer.slice(0, 12));
            const encryptedData = imageArrayBuffer.slice(12);

            console.log('IV (Bytes):', iv);

            // Configurar los parámetros para la operación de descifrado
            const additionalData = new Uint8Array(0); // Datos adicionales para autenticación
            //resultArrayBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);

            resultArrayBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData }, key, encryptedData);
            
        }

        // Crear un Blob a partir de los datos cifrados o descifrados con el tipo de la imagen original
        const resultBlob =new Blob([new Uint8Array(resultArrayBuffer)], { type: imageFile.type });
        
        /*
        // Crear un enlace de descarga
        const objectURL = URL.createObjectURL(resultBlob);
        const operationName = isEncrypt ? 'encrypted' : 'decrypted';
        downloadLink.href = objectURL;
        downloadLink.download = `${operationName}_image_${imageFile.name}`;
        downloadLink.style.display = 'block';
        */ 

        const operationName = isEncrypt ? 'encrypted' : 'decrypted';
        /*
        const a = document.createElement('a');
        const urlBlob = URL.createObjectURL(resultBlob);
        

        a.href = urlBlob;

        // Puedes establecer el nombre del archivo y el formato MIME aquí
        a.download = `${operationName}_image_${imageFile.name}`;
        

        // Agregar el enlace al cuerpo del documento y simular un clic
        document.body.appendChild(a);
        a.click();

        // Eliminar el enlace y liberar recursos
        document.body.removeChild(a);
        URL.revokeObjectURL(urlBlob);
         */
        
        console.log(`Operación ${isEncrypt ? 'cifrado' : 'descifrado'} completada con éxito.`);
        alert(`Operación ${isEncrypt ? 'cifrado' : 'descifrado'} completada con éxito.`);

        const archivoresultado = new File([resultBlob],  `${operationName}_image_${imageFile.name}`, { type: resultBlob.type });

        return archivoresultado;

    } catch (error) {
        console.error('Error en la operación de', isEncrypt ? 'cifrado' : 'descifrado', ':', error);
        alert(`Error al ${isEncrypt ? 'cifrar' : 'descifrar'} la imagen. `);
        return null;
    }
}

async function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function readFileAsString(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function hexToBytes(hex) {
    return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}







//___________________________________________________________shared keys:______________________________________


function descarga_llave_publica(username){ //Descarga la llave pública de algún usuario
    return new Promise((resolve, reject) => {
        
        let formData=new FormData();
        formData.append('username', username);

        
        fetch('../php/descarga_llave_publica.php', { //fetch para recuperar la imagen de ejemplo
                method: 'POST',
                body: formData
        
            }).then(response =>response.blob()) // Convertir la respuesta a JSON
              .then(blob => {
        
                //console.log(blob);
        
                if(blob['size']>0){

                    // Crear un objeto File a partir del Blob
                    const archivo = new File([blob], 'llave_publica_'+String(username)+'.pem', { type: 'application/x-pem-file' }); 

                    // Crear un elemento de imagen y establecer la fuente                    
                    resolve(archivo);    
                }
        
        
            }).catch(error => {
                     console.error('Error al cargar las imágenes:', error);
                     reject(error);  
            });
        
            
    });
}


function performKeyExchange(privateKeyFile,publicKeyFile) {

    return new Promise((resolve, reject) => {
        if (!privateKeyFile || !publicKeyFile) {
            alert('Please select both private and public key files.');
            return;
          }
      
          const reader = new FileReader();
      
          reader.onload = () => {
            const privateKeyPem = reader.result;
            
            const publicKeyReader = new FileReader();
            publicKeyReader.onload = () => {
              const publicKeyPem = publicKeyReader.result;
      
              try {
                const ec = new elliptic.ec('secp256k1');
                
                // Parse PEM keys and extract hex values
                const parsePEMKey = (pem) => {
                  const lines = pem.split('\n');
                  return lines.slice(1, lines.length - 1).join('');
                };
      
                const alicePrivateKeyHex = parsePEMKey(privateKeyPem.trim());
                const alicePublicKeyHex = parsePEMKey(publicKeyPem.trim());
      
                const alicePrivateKey = ec.keyFromPrivate(alicePrivateKeyHex, 'hex');
                const alicePublicKey = ec.keyFromPublic(alicePublicKeyHex, 'hex');
                
                // Compute shared secrets
                const aliceSharedSecret = alicePrivateKey.derive(alicePublicKey.getPublic());
                
                // Display shared secrets in the interface
                const sharedSecretText = aliceSharedSecret.toString('hex');
                
                
                // Enable download button
                
                
                archivosharedSecret=getSharedSecretFile(sharedSecretText);
                resolve(archivosharedSecret);    

              } catch (error) {
                console.error('Error during key exchange:', error.message);
                alert('Error during key exchange. See the console for details.');
                reject(error); 
              }
            };
      
            publicKeyReader.readAsText(publicKeyFile);
          };
      
          reader.readAsText(privateKeyFile);
          
    });

    
  }

  function getSharedSecretFile(sharedSecretText) {
    // Add custom headers for PEM format
    const pemHeader = '-----BEGIN EC PARAMETERS-----\n';
    const pemFooter = '\n-----END EC PARAMETERS-----';

    // Combine headers, shared secret, and footers
    const pemFormattedSecret = pemHeader + sharedSecretText + pemFooter;

    
    
    // Create Blob and initiate download
    const blob = new Blob([pemFormattedSecret], { type: 'application/x-pem-file' });

    const archivosecretoCompartido = new File([blob], 'shared_secret.pem', { type: blob.type});
    /*
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'shared_secret.pem';
    link.click();
    */
    return archivosecretoCompartido;
    
  }













  

//___________________________________________________________ECDSA_________________________________________________

async function genera_sube_firma(fileprivatekey,filetosign, idpeticion){

    //Generar la firma
    let archivofirma=signFile(filetosign,fileprivatekey);
    console.log(archivofirma);

    //Subir la firma al servidor a partir del id de la petición    

}




// Función para dar formato PEM a una firma
function formatPEMSignature(signature) {
    return `-----BEGIN ECDSA SIGNATURE-----\n${signature}\n-----END ECDSA SIGNATURE-----`;
}

// Función para dar formato PEM
function formatPEM(type, keyData) {
    const header = `-----BEGIN ${type}-----`;
    const footer = `-----END ${type}-----`;
    const formattedKey = `${header}\n${keyData}\n${footer}`;
    return formattedKey;
}

// Función para descargar un archivo
function downloadFile(data, filename, label) {
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(data);
    downloadLink.download = filename;
    downloadLink.innerHTML = label;

    // Agregar el enlace al cuerpo del documento
    document.body.appendChild(downloadLink);

    // Simular clic en el enlace
    downloadLink.click();

    // Eliminar el enlace después de la descarga
    document.body.removeChild(downloadLink);
}


function signFile(file, privateKeyPemFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const fileContent = e.target.result; // Cargar el contenido del archivo

            // Firma del contenido del archivo con la clave privada
            signMessage(fileContent, privateKeyPemFile)
                .then(signature => {
                    // Crear un Blob con la firma
                    const signatureBlob = new Blob([formatPEMSignature(signature)], { type: 'application/x-pem-file' });

                    // Crear un File con la firma
                    const signatureFile = new File([signatureBlob], `signature.pem`, { type: signatureBlob.type });

                    // Descargar la firma en formato PEM
                    //downloadFile(signatureBlob, `signature.pem`, 'Descargar firma');

                    resolve(signatureFile);
                })
                .catch(error => {
                    reject(new Error(`Error al firmar el archivo: ${error.message}`));
                });
        };

        reader.onerror = function (e) {
            reject(new Error('Error al leer el archivo.'));
        };

        reader.readAsText(file);
    });
}






function signMessage(message, privateKeyPemFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const privateKeyPem = e.target.result; // Contenido del archivo

            // Algoritmo de curva elíptica (ECDSA)
            const curveName = 'secp256k1';
            // Crear instancia de la curva elíptica
            const ec = new elliptic.ec(curveName);

            const privateKeyHex = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
            const key = ec.keyFromPrivate(privateKeyHex, 'hex');
            const signature = key.sign(message);
            resolve(signature.toDER('hex'));
        };

        reader.onerror = function (e) {
            reject(new Error('Error al leer el archivo de clave privada.'));
        };

        reader.readAsText(privateKeyPemFile);
    });
}


function verifySignature(signaturePemFile, publicKeyPemFile, file) {
    return new Promise((resolve, reject) => {
        const readerSignature = new FileReader();
        const readerPublicKey = new FileReader();

        readerSignature.onload = function (eSignature) {
            const signaturePem = eSignature.target.result; // Contenido del archivo de firma

            readerPublicKey.onload = function (ePublicKey) {
                const publicKeyPem = ePublicKey.target.result; // Contenido del archivo de clave pública

                try {
                    // Algoritmo de curva elíptica (ECDSA)
                    const curveName = 'secp256k1';
                    // Crear instancia de la curva elíptica
                    const ec = new elliptic.ec(curveName);

                    // Limpiar las cadenas de la firma y la clave pública
                    const cleanSignatureHex = signaturePem.replace(/-----BEGIN ECDSA SIGNATURE-----|-----END ECDSA SIGNATURE-----|\s/g, '');
                    const cleanPublicKeyHex = publicKeyPem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '');

                    // Verificar la firma con la clave pública
                    const key = ec.keyFromPublic(cleanPublicKeyHex, 'hex');
                    const isSignatureValid = key.verify(file, cleanSignatureHex);

                    resolve(isSignatureValid);
                } catch (error) {
                    reject(new Error('Error al verificar la firma: ' + error.message));
                }
            };

            readerPublicKey.onerror = function (e) {
                reject(new Error('Error al leer el archivo de clave pública.'));
            };

            readerPublicKey.readAsText(publicKeyPemFile);
        };

        readerSignature.onerror = function (e) {
            reject(new Error('Error al leer el archivo de firma.'));
        };

        readerSignature.readAsText(signaturePemFile);
    });
}




