/* IMPORTACIÓN DE BIBLIOTECAS */
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');
const xml2js = require('xml2js');
const multer = require('multer');
const pdf = require('pdf-parse');
// const upload = multer();//un archivo
// Configuración de multer para manejar múltiples archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { v4: uuidv4 } = require('uuid'); //IDENTIFICADOR UNICO 
const XLSX = require('xlsx'); //excel
const port = 3000; // Define el puerto que se utiliza

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

/* CONEXIÓN A LA BASE DE DATOS */
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

/* CONSULTA BASE DE DATOS */
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

/** LOGIN  */
app.post('/login', (req, res) => {
  const { usuario, pass } = req.body;
  const login = 'SELECT usuario FROM Usuario WHERE usuario = ? AND pass = ?';
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

/* LECTURA XML */
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

            // Verificar si traslados es un array
            if (Array.isArray(traslados)) {
              traslados.forEach((traslado, tIndex) => {
                console.log(`    Traslado ${tIndex + 1}:`);
                console.log('      Impuesto:', traslado.$.Impuesto);
                console.log('      Tasa o Cuota:', traslado.$.TasaOCuota);
                console.log('      Importe:', traslado.$.Importe);
              });
            } else {
              // Si no es un array, procesar el elemento único
              console.log(`    Traslado único:`);
              console.log('      Impuesto:', traslados.$.Impuesto);
              console.log('      Tasa o Cuota:', traslados.$.TasaOCuota);
              console.log('      Importe:', traslados.$.Importe);
            }
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
      }
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


/* INSERTAR CLIENTE DESDE XML */
app.post('/extraerCliente', upload.array('xml'), (req, res) => {
  const files = req.files;
  const resultados = [];
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

        resultados.push({ receptorRFC, receptorNombre });

        // res.json({receptorRFC, receptorNombre});

        if (index === files.length - 1) {
          // Enviar resultados al frontend cuando se hayan procesado todos los archivos
          res.json(resultados);
        }

      }
    });
  });

  // res.status(200).json({ message: 'Archivos procesados exitosamente' });
});

app.post('/insertarCliente', (req, res) => {
  console.log(req.body); // Agrega esta línea para verificar el contenido de req.body
  const data = Array.isArray(req.body) ? req.body : [req.body];

  // Iterar sobre los datos y realizar la inserción en la base de datos
  data.forEach((cliente, index) => {
    const { receptorNombre, receptorRFC } = cliente;

    // Insertar en la base de datos
    db.run('INSERT INTO Cliente (nombre, rfc) VALUES (?, ?)', [receptorNombre, receptorRFC], function (err) {
      if (err) {
        console.error(`Error al insertar en la base de datos (${index + 1}):`, err);
      } else {
        console.log(`Se ha insertado un nuevo Cliente en la Base de datos (${index + 1})`);
      }
    });
  });

  res.send('Éxito en la inserción en la base de datos');
});

/* INSERTAR CLIENTE DESDE PDF */
const extraerInformacion = (texto) => {
  const regexRFC = /RFC:\s*([A-Z0-9]+)/;
  const regexDenominacion = /(.+)\nNombre, denominación o razón\s*social/m;
  const regexRegimenGeneral = /R[ée]gimen\s+General\s+de\s+Ley\s+Personas\s+Morales/ig;
  const regexRegimenPF = /R[ée]gimen\s+de\s+las\s+Personas\s+F[íi]sicas\s+con\s+Actividades\s+Empresariales\s+y\s+Profesionales/ig;
  const regexRegimenDividendos = /R[ée]gimen\s+de\s+Ingresos\s+por\s+Dividendos\s+\(socios\s+y\s+accionistas\)/ig;
  const regexRegimenSinObligaciones = /Sin\s+obligaciones\s+fiscales/ig;
  const regexRegimenArrendamiento = /R[ée]gimen\s+de\s+Arrendamiento/ig;
  // Buscar RFC
  const rfcMatch = texto.match(regexRFC);
  const RFC = rfcMatch ? rfcMatch[1] : null;
  // Buscar Denominación/Razón Social
  let Denominacion_RazonSocial = null;
  const denominacionMatch = texto.match(regexDenominacion);
  if (denominacionMatch && denominacionMatch.length > 1) {
    Denominacion_RazonSocial = denominacionMatch[1].trim(); // Eliminar espacios en blanco al inicio y final, si los hay
  }
  // Buscar los valores de Regimen
  const RegimenMatches = [];
  let match;
  while ((match = regexRegimenGeneral.exec(texto)) !== null) {
    RegimenMatches.push(match[0].trim());
  }
  while ((match = regexRegimenPF.exec(texto)) !== null) {
    RegimenMatches.push(match[0].trim());
  }
  while ((match = regexRegimenDividendos.exec(texto)) !== null) {
    RegimenMatches.push(match[0].trim());
  }
  while ((match = regexRegimenSinObligaciones.exec(texto)) !== null) {
    RegimenMatches.push(match[0].trim());
  }
  while ((match = regexRegimenArrendamiento.exec(texto)) !== null) {
    RegimenMatches.push(match[0].trim());
  }
  // Eliminar duplicados si se encuentra un tipo de régimen dos veces
  const Regimen = [...new Set(RegimenMatches)];
  // Si no se encontró ningún tipo de régimen, asignar un mensaje indicando que no se encontró
  if (Regimen.length === 0) {
    Regimen.push('No encontrado');
  }
  return { RFC, Denominacion_RazonSocial, Regimen };
};
// Función para leer el archivo PDF y extraer texto
const extractTextFromPDF = async (dataBuffer) => {
  try {
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Error al leer el archivo PDF: ${error.message}`);
  }
};
const extractTextAndProcess = async (req, path) => {
  try {
    const textoPDF = await extractTextFromPDF(req.file.buffer);
    if (textoPDF.trim().length === 0) {
      throw new Error('El texto extraído del PDF está vacío');
    }
    const { RFC, Denominacion_RazonSocial, Regimen } = extraerInformacion(textoPDF);
    if (!RFC || !Denominacion_RazonSocial || !Regimen) {
      throw new Error('No se pudo extraer información completa del PDF');
    }
    console.log(`RFC: ${RFC}`);
    console.log(`Denominación/Razón Social: ${Denominacion_RazonSocial || 'No encontrado'}`);
    console.log(`Regimen: ${Regimen || 'No encontrado'}`);

    const RegimenString = Regimen.join(', '); // Unir los elementos del array en una cadena
    db.run('INSERT INTO ClienteCSF (nombre, rfc, regimen) VALUES (?, ?, ?)', [Denominacion_RazonSocial, RFC, RegimenString], function (err) {
      if (err) {
        console.error('Error al insertar en la base de datos:', err);
      } else {
        console.log('Cliente insertado en la base de datos');
      }
    });
  } catch (error) {
    console.error('Error al procesar el archivo PDF:', error);
  }
};

app.post('/insertarClientePDF', upload.array('pdf', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No se han subido archivos' });
  }
  const files = req.files; // Array de archivos subidos
  // Iterar sobre cada archivo para procesarlo
  Promise.all(
    files.map(async (file) => {
      const pdfPath = file.path; // Ruta temporal del archivo subido

      try {
        const textoPDF = await extractTextFromPDF(file.buffer);

        if (textoPDF.trim().length === 0) {
          throw new Error('El texto extraído del PDF está vacío');
        }

        const { RFC, Denominacion_RazonSocial, Regimen } = extraerInformacion(textoPDF);

        if (!RFC || !Denominacion_RazonSocial || !Regimen) {
          throw new Error('No se pudo extraer información completa del PDF');
        }
        console.log(`RFC: ${RFC}`);
        console.log(`Denominación/Razón Social: ${Denominacion_RazonSocial || 'No encontrado'}`);
        console.log(`Regimen: ${Regimen || 'No encontrado'}`);
        const RegimenString = Regimen.join(', '); // Unir los elementos del array en una cadena
        // Insertar en la base de datos
        db.run('INSERT INTO ClienteCSF (nombre, rfc, regimen) VALUES (?, ?, ?)', [Denominacion_RazonSocial, RFC, RegimenString], function (err) {
          if (err) {
            console.error('Error al insertar en la base de datos:', err);
          } else {
            console.log('Cliente insertado en la base de datos');
          }
        });
      } catch (error) {
        console.error('Error al procesar el archivo PDF:', error);
      }
    })
  )
    .then(() => {
      res.status(200).json({ message: 'Clientes insertados correctamente desde los archivos PDF' });
    })
    .catch((error) => {
      console.error('Error al extraer información de los PDF:', error);
      res.status(500).json({ message: 'Error al extraer información de los PDF' });
    });
});

app.post('/insertarFactura', upload.single('xml'), (req, res) => {
  const xmlData = req.file.buffer.toString(); // Accede al archivo cargado desde req.file.buffer

  const parser = new xml2js.Parser({ explicitArray: false });

  parser.parseString(xmlData, (err, result) => {
    if (err) {
      console.error('Error al analizar el XML:', err);
      return res.status(500).json({ message: 'Error al analizar el XML' });
    }

    const comprobante = result['cfdi:Comprobante'];
    const emisorRFC = comprobante['cfdi:Emisor'].$.Rfc;
    const receptorRFC = comprobante['cfdi:Receptor'].$.Rfc;
    const folio = comprobante.$.Folio;
    const fecha = comprobante.$.Fecha;
    const subtotal = comprobante.$.SubTotal;
    const total = comprobante.$.Total;
    const tipoComprobante = comprobante.$.TipoDeComprobante;
    const tf_factura = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'];
    const uuid = tf_factura.$.UUID;

    // Insertar datos de Facturas en la tabla Facturas
    db.run('INSERT INTO Facturas (Folio, Fecha, Subtotal, Total, TipoComprobante, rfcEmisor, rfcReceptor, UUID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [folio, fecha, subtotal, total, tipoComprobante, emisorRFC, receptorRFC, uuid],
      function (err) {
        if (err) {
          console.error('Error al insertar datos de la Factura:', err);
          return res.status(500).json({ message: 'Error al insertar datos de la Factura' });
        }

        const facturaID = this.lastID; // Obtener el ID de la factura recién insertada
        console.log('Datos de la Factura insertados correctamente. ID:', facturaID);

        // Insertar datos de Conceptos en la tabla Conceptos
        let conceptos = comprobante['cfdi:Conceptos']['cfdi:Concepto'];
        if (!Array.isArray(conceptos)) {
          // Si solo hay un concepto, lo convertimos en una lista
          conceptos = [conceptos];
        }

        conceptos.forEach((concepto) => {
          // Utilizar un nuevo UUID para cada concepto
          const conceptoID = uuidv4();
          const cantidad = concepto.$.Cantidad;
          const unidad = concepto.$.Unidad;
          const noIdentificacion = concepto.$.NoIdentificacion;
          const descripcion = concepto.$.Descripcion;
          const valorUnitario = concepto.$.ValorUnitario;
          const importeConcepto = concepto.$.Importe;

          db.run('INSERT INTO Conceptos (ConceptoID, FacturaID, Cantidad, Unidad, Identificacion, Descripcion, ValorUnitario, Importe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [conceptoID, facturaID, cantidad, unidad, noIdentificacion, descripcion, valorUnitario, importeConcepto],
            function (err) {
              if (err) {
                if (err.errno === 19 && err.code === 'SQLITE_CONSTRAINT') {
                  // Puedes manejar el caso de violación de restricción aquí si lo deseas
                  console.error('Error al insertar datos del Concepto: Ya existe un registro con el mismo FacturaID');
                } else {
                  console.error('Error al insertar datos del Concepto:', err);
                }
              } else {
                console.log('Datos del Concepto insertados correctamente.');
              }
            });
        });

        // Insertar datos del Timbre Fiscal Digital en la tabla TimbreFiscal
        const timbreFiscalDigital = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'];
        const uuidTimbreFiscal = timbreFiscalDigital.$.UUID;
        const fechaTimbrado = timbreFiscalDigital.$.FechaTimbrado;

        db.run('INSERT INTO TimbreFiscal (FacturaID, UUID, FechaTimbrado) VALUES (?, ?, ?)',
          [facturaID, uuidTimbreFiscal, fechaTimbrado],
          function (err) {
            if (err) {
              console.error('Error al insertar datos del Timbre Fiscal Digital:', err);
            } else {
              console.log('Datos del Timbre Fiscal Digital insertados correctamente.');
            }
          });

        // Insertar datos de Impuestos Globales en la tabla ImpuestosGlobales
        let impuestosGlobales = comprobante['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado'];
        if (!Array.isArray(impuestosGlobales)) {
          // Si solo hay un impuesto global trasladado, lo convertimos en una lista
          impuestosGlobales = [impuestosGlobales];
        }

        impuestosGlobales.forEach((impuestoGlobal) => {
          const impuesto = impuestoGlobal.$.Impuesto;
          const tasaCuota = impuestoGlobal.$.TasaOCuota;
          const importe = impuestoGlobal.$.Importe;

          db.run('INSERT INTO ImpuestosGlobales (FacturaID, Impuesto, TasaCuota, Importe) VALUES (?, ?, ?, ?)',
            [facturaID, impuesto, tasaCuota, importe],
            function (err) {
              if (err) {
                console.error('Error al insertar datos de Impuestos Globales:', err);
              } else {
                console.log('Datos de Impuestos Globales insertados correctamente.');
              }
            });
        });

        return res.status(200).json({ message: 'Factura procesada exitosamente' });
      });
  });
});

const procesarArchivoExcel = (excelData) => {
  // Tu lógica de procesamiento
  const fechasOperacion = excelData.map((entry) => entry['Fecha Operación']);
  const referenciaAmpliada = excelData.map((entry) => entry['Referencia Ampliada']);
  const cargo = excelData.map((entry) => entry['Cargo']);
  const abono = excelData.map((entry) => entry['Abono']);
  const saldo = excelData.map((entry) => entry['Saldo']);

  // Imprimir la información de las columnas después de procesar
  console.log(fechasOperacion);
  console.log(referenciaAmpliada);
  console.log(cargo);
  console.log(abono);
  console.log(saldo);

  // Aquí podrías realizar otras operaciones o insertar en la base de datos si es necesario
};

app.post('/extraerCuenta', upload.single('excel'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido un archivo Excel' });
  }

  try {
    const sheetName = XLSX.read(req.file.buffer, { type: 'buffer' }).SheetNames[0];
    const sheet = XLSX.read(req.file.buffer, { type: 'buffer' }).Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    range.s.r = 1; // Inicio en la segunda fila
    const excelData = XLSX.utils.sheet_to_json(sheet, { range });

    // Insertar datos en la tabla Cuenta
    excelData.forEach((entry) => {
      const fechasOperacion = entry['Fecha Operación'];
      const referenciaAmpliada = entry['Referencia Ampliada'];
      const cargo = entry['Cargo'];
      const abono = entry['Abono'];
      const saldo = entry['Saldo'];

      db.run('INSERT INTO Cuenta (fechasOperacion, referenciaAmpliada, cargo, abono, saldo) VALUES (?, ?, ?, ?, ?)',
        [fechasOperacion, referenciaAmpliada, cargo, abono, saldo],
        function (err) {
          if (err) {
            console.error('Error al insertar datos en la tabla Cuenta:', err);
          } else {
            console.log('Datos insertados en la tabla Cuenta correctamente.');
          }
        });
    });

    res.status(200).json({ message: 'Datos de la cuenta procesados exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar los datos de la cuenta' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// const sql_create = "CREATE TABLE IF NOT EXISTS Cliente(nombre VARCHAR(50) NOT NULL,rfc  VARCHAR(13) NOT NULL PRIMARY KEY)"           
// db.run(sql_create, err => {               
//   if (err) {
//     return console.error(err.message);
//   } else {
//     console.log("TABLA CREADA EXITOSAMENTE");
//   }            
// })