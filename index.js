const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
//LECTURA XML
const fs = require('fs');
const xml2js = require('xml2js');
const multer = require('multer');
// const upload = multer();//un archivo

// Configuración de multer para manejar múltiples archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const port = 5000; // Define el puerto que se utiliza

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db_name = path.join(__dirname, '/web/db', 'base.db');
const db = new sqlite3.Database(db_name, (err) => {
    if (err) {
        return console.error(err.message);
    } else {
        console.log('CONEXIÓN EXITOSA A LA BD');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/consulta', (req, res) => {
    db.all('SELECT * FROM Usuarios', [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log('Resultados de la consulta SELECT: ', rows);

        res.send(`<h1>Resultados de la consulta SELECT:</h1> 
        <pre>${JSON.stringify(rows, null, 4)}</pre>`);
    });
});

app.get('/consultaCliente', (req, res) => {
    db.all('SELECT * FROM Cliente', [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log('Resultados de la consulta SELECT: ', rows);

        res.send(`<h1>Resultados de la consulta SELECT para Clientes:</h1> 
    <pre>${JSON.stringify(rows, null, 4)}</pre>`);
    });
});

app.post('/login', (req, res) => {
    const { usuario, pass } = req.body;
    const login = 'SELECT usuario FROM Usuarios WHERE usuario = ? AND pass = ?';
    db.get(login, [usuario, pass], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (!row) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        console.log('Inicio de sesión exitoso');
        res.redirect('/overview.html');
    });
});

app.post('/upload', upload.single('xml'), (req, res) => {
    const xml = req.file.buffer.toString();
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xml, (err, result) => {
        if (err) {
            console.error('Error al analizar el XML:', err);
            return res.status(500).json({ message: 'Error al analizar el XML' });
        } else {
            const comprobante = result['cfdi:Comprobante'];
            console.log('Datos extraídos del archivo XML:');
            console.log('Folio:', comprobante.$.Folio);
            console.log('Fecha:', comprobante.$.Fecha);
            console.log('Subtotal:', comprobante.$.SubTotal);
            console.log('Total:', comprobante.$.Total);
            console.log('Tipo de Comprobante:', comprobante.$.TipoDeComprobante);

            const emisor = comprobante['cfdi:Emisor'];
            console.log('Emisor RFC:', emisor.$.Rfc);
            console.log('Emisor Nombre:', emisor.$.Nombre);

            const receptor = comprobante['cfdi:Receptor'];
            console.log('Receptor RFC:', receptor.$.Rfc);
            console.log('Receptor Nombre:', receptor.$.Nombre);

            const conceptos = comprobante['cfdi:Conceptos']['cfdi:Concepto'];

            console.log('Conceptos:');
            if (Array.isArray(conceptos)) {
                conceptos.forEach((concepto, index) => {
                    console.log(`Concepto ${index + 1}:`);
                    console.log('  Cantidad:', concepto.$.Cantidad);
                    console.log('  Unidad:', concepto.$.Unidad);
                    console.log('  No. Identificación:', concepto.$.NoIdentificacion);
                    console.log('  Descripción:', concepto.$.Descripcion);
                    console.log('  Valor Unitario:', concepto.$.ValorUnitario);
                    console.log('  Importe:', concepto.$.Importe);

                    // Impuestos
                    if (concepto['cfdi:Impuestos'] && concepto['cfdi:Impuestos']['cfdi:Traslados']) {
                        const traslados = concepto['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado'];
                        console.log('  Impuestos Trasladados:');
                        traslados.forEach((traslado, tIndex) => {
                            console.log(`    Traslado ${tIndex + 1}:`);
                            console.log('      Impuesto:', traslado.$.Impuesto);
                            console.log('      Tasa o Cuota:', traslado.$.TasaOCuota);
                            console.log('      Importe:', traslado.$.Importe);
                        });
                    }
                });
            } else {
                // Si no es un array, procesar un solo concepto
                console.log(`Concepto único:`);
                console.log('  Cantidad:', conceptos.$.Cantidad);
                console.log('  Unidad:', conceptos.$.Unidad);
                console.log('  No. Identificación:', conceptos.$.NoIdentificacion);
                console.log('  Descripción:', conceptos.$.Descripcion);
                console.log('  Valor Unitario:', conceptos.$.ValorUnitario);
                console.log('  Importe:', conceptos.$.Importe);
                // Puedes agregar el código para impuestos aquí si es necesario
            }

            // Impuestos Globales
            // Impuestos Globales
            const impuestos = comprobante['cfdi:Impuestos'];
            if (impuestos && impuestos['cfdi:Traslados']) {
                const trasladosGlobales = impuestos['cfdi:Traslados']['cfdi:Traslado'];

                console.log('Impuestos Globales Trasladados:');
                if (Array.isArray(trasladosGlobales)) {
                    trasladosGlobales.forEach((trasladoGlobal, tgIndex) => {
                        console.log(`  Traslado Global ${tgIndex + 1}:`);
                        console.log('    Impuesto:', trasladoGlobal.$.Impuesto);
                        console.log('    Tasa o Cuota:', trasladoGlobal.$.TasaOCuota);
                        console.log('    Importe:', trasladoGlobal.$.Importe);
                    });
                } else {
                    // Si no es un array, procesar un solo traslado global
                    console.log(`  Traslado Global único:`);
                    console.log('    Impuesto:', trasladosGlobales.$.Impuesto);
                    console.log('    Tasa o Cuota:', trasladosGlobales.$.TasaOCuota);
                    console.log('    Importe:', trasladosGlobales.$.Importe);
                }
            }

            // Timbre Fiscal Digital
            const timbreFiscalDigital = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'];
            console.log('Timbre Fiscal Digital:');
            console.log('  UUID:', timbreFiscalDigital.$.UUID);
            console.log('  Fecha de Timbrado:', timbreFiscalDigital.$.FechaTimbrado);
            console.log('  Sello SAT:', timbreFiscalDigital.$.SelloSAT);
            console.log('----------------------------------------------------------------------------');
            res.status(200).send('Los datos se han procesado con éxito. Revise la terminal del servidor para ver los resultados.');
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

const sql_create = "CREATE TABLE IF NOT EXISTS Cliente(nombre VARCHAR(50) NOT NULL,rfc  VARCHAR(13) NOT NULL PRIMARY KEY)"
db.run(sql_create, err => {
    if (err) {
        return console.error(err.message);
    } else {
        console.log("TABLA CREADA EXITOSAMENTE");
    }
})

app.post('/insertarCliente', upload.array('xml'), (req, res) => {
    const files = req.files;

    // Iterar sobre cada archivo
    files.forEach((file, index) => {
        const xml = file.buffer.toString();
        const parser = new xml2js.Parser({ explicitArray: false });

        parser.parseString(xml, (err, result) => {
            if (err) {
                console.error(`Error al analizar el XML del archivo ${index + 1}:`, err);
                return res.status(500).json({ message: `Error al analizar el XML del archivo ${index + 1}` });
            } else {
                const receptor = result['cfdi:Comprobante']['cfdi:Receptor'];
                const receptorRFC = receptor.$.Rfc;
                const receptorNombre = receptor.$.Nombre;

                console.log(`DATOS DEL CLIENTE (${index + 1}):`);
                console.log('Receptor RFC:', receptorRFC);
                console.log('Receptor Nombre:', receptorNombre);
                console.log('-------------------------------------------');

                // Insertar en la base de datos
                db.run('INSERT INTO Cliente (nombre, rfc) VALUES (?, ?)', [receptorNombre, receptorRFC], function (err) {
                    if (err) {
                        console.error(`Error al insertar en la base de datos (${index + 1}):`, err);
                    } else {
                        console.log(`Se ha insertado un nuevo Cliente en la Base de datos (${index + 1})`);
                    }
                });
            }
        });
    });

    res.status(200).json({ message: 'Archivos procesados exitosamente' });
});




// db.get('SELECT * FROM Usuarios WHERE usuario = ?', [usuario], (err, row) => {
//     if (err) {
//         return console.error(err.message);
//     }

//     if (!row) {
//         res.send('Usuario no encontrado');
//     } else {
//         if (row.pass === pass) {
//             res.send('Inicio de sesión exitoso');
//         } else {
//             res.send('Contraseña incorrecta');
//         }
//     }
// });



// const sql_create="CREATE TABLE IF NOT EXISTS Usuarios(usuario VARCHAR(15) NOT NULL PRIMARY KEY, pass VARCHAR(8) NOT NULL)"
// db.run(sql_create, err =>{
//     if(err){
//         return console.error(err.message);
//     }else{
//         console.log("TABLA USUARIOS CREADA EXITOSAMENTE");
//     }
// })

// let usuario = 'Andrea';
// let pass = '456';

// db.run('INSERT INTO Usuarios (usuario, pass) VALUES (?, ?)', [usuario, pass], function(err) {
//     if (err) {
//         return console.log(err.message);
//     }
//     console.log(`Se ha insertado un nuevo usuario`);
// });