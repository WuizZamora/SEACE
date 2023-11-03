const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
//LECTURA XML
const fs = require('fs');
const xml2js = require('xml2js');
const multer  = require('multer');
const upload = multer();

const port = 5000; // Definir el puerto que quieres utilizar

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
            console.log('Serie:', comprobante.$.serie);
            console.log('Folio:', comprobante.$.folio);
            console.log('Fecha:', comprobante.$.fecha);
            console.log('Subtotal:', comprobante.$.subTotal);
            console.log('Descuento:', comprobante.$.descuento);
            console.log('Total:', comprobante.$.total);
            console.log('Tipo de Comprobante:', comprobante.$.tipoDeComprobante);

            const emisor = comprobante['cfdi:Emisor'];
            console.log('Emisor RFC:', emisor.$.rfc);
            console.log('Emisor Nombre:', emisor.$.nombre);

            const receptor = comprobante['cfdi:Receptor'];
            console.log('Receptor RFC:', receptor.$.rfc);
            console.log('Receptor Nombre:', receptor.$.nombre);

            const conceptos = comprobante['cfdi:Conceptos']['cfdi:Concepto'];
            console.log('Conceptos:');
            conceptos.forEach((concepto, index) => {
            console.log(`Concepto ${index + 1}:`);
            console.log('  Cantidad:', concepto.$.cantidad);
            console.log('  Unidad:', concepto.$.unidad);
            console.log('  No. Identificación:', concepto.$.noIdentificacion);
            console.log('  Descripción:', concepto.$.descripcion);
            console.log('  Valor Unitario:', concepto.$.valorUnitario);
            console.log('  Importe:', concepto.$.importe);
            });

            const impuestosLocales = comprobante['cfdi:Complemento']['implocal:ImpuestosLocales'];
            console.log('Impuestos Locales:');
            console.log('  Total de Retenciones:', impuestosLocales.$.TotaldeRetenciones);
            console.log('  Total de Traslados:', impuestosLocales.$.TotaldeTraslados);
            res.status(200).send('Los datos se han procesado con éxito. Revise la terminal del servidor para ver los resultados.');
        }
    });
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
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