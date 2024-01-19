-- -- CREATE TABLE IF NOT EXISTS ClienteCSF (nombre VARCHAR(50) NOT NULL,rfc  VARCHAR(13) NOT NULL PRIMARY KEY, regimen VARCHAR(50) NOT NULL)

-- -- SELECT * FROM ClienteCSF

-- -- DROP TABLE ClienteCSF

-- -- Tabla de Facturas
-- CREATE TABLE Facturas (
--     ID INT PRIMARY KEY AUTO_INCREMENT,
--     Folio VARCHAR(10),
--     Fecha DATETIME,
--     Subtotal DECIMAL(10, 2),
--     Total DECIMAL(10, 2),
--     TipoComprobante CHAR(1),
--     EmisorRFC VARCHAR(13),
--     ReceptorRFC VARCHAR(13),
--     UUID VARCHAR(36), -- Considerando el UUID como VARCHAR por su longitud
--     FOREIGN KEY (EmisorRFC) REFERENCES Clientes(RFC),
--     -- FOREIGN KEY (ReceptorRFC) REFERENCES Clientes(RFC)
-- );

-- -- Tabla de Conceptos
-- CREATE TABLE Conceptos (
--     FacturaID INT,
--     Cantidad INT,
--     Unidad VARCHAR(10),
--     Identificacion VARCHAR(10),
--     Descripcion VARCHAR(255),
--     ValorUnitario DECIMAL(10, 2),
--     Importe DECIMAL(10, 2),
--     PRIMARY KEY (FacturaID),
--     FOREIGN KEY (FacturaID) REFERENCES Facturas(ID)
-- );

-- -- Tabla de Impuestos Globales Trasladados
-- CREATE TABLE ImpuestosGlobales (
--     FacturaID INT,
--     Impuesto VARCHAR(3),
--     TasaCuota DECIMAL(10, 6),
--     Importe DECIMAL(10, 2),
--     PRIMARY KEY (FacturaID),
--     FOREIGN KEY (FacturaID) REFERENCES Facturas(ID)
-- );

-- -- Tabla de Timbre Fiscal Digital
-- CREATE TABLE TimbreFiscal (
--     FacturaID INT,
--     UUID VARCHAR(36),
--     FechaTimbrado DATETIME,
--     SelloSAT VARCHAR(500), -- Se ajusta el tamaño a 500 para el sello SAT
--     PRIMARY KEY (FacturaID),
--     FOREIGN KEY (FacturaID) REFERENCES Facturas(ID)
-- );

-- DROP TABLE Cliente
DELETE FROM Cliente
-- CREATE TABLE IF NOT EXISTS Cliente (nombre VARCHAR(50) NOT NULL,rfc  VARCHAR(13) NOT NULL PRIMARY KEY)