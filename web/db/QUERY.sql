-- CREATE TABLE Usuario(
--     rfcEmisor VARCHAR(13) NOT NULL,
--     usuario VARCHAR(20) NOT NULL,
--     pass VARCHAR(20) NOT NULL
-- );

-- INSERT INTO Usuario VALUES ('ZAPL0108266K0', 'Wuiz', '123')

-- CREATE TABLE Cliente(
--     rfcReceptor VARCHAR(13) NOT NULL PRIMARY KEY,
--     nombre VARCHAR(100) NOT NULL,
--     regimen VARCHAR(255) NOT NULL
-- );

DROP TABLE Usuario

-- CREATE TABLE Facturas (
--     ID INT PRIMARY KEY AUTOINCREMENT,
--     Folio VARCHAR(10),
--     Fecha DATE,
--     Subtotal DECIMAL(10, 2),
--     Total DECIMAL(10, 2),
--     TipoComprobante CHAR(1),
--     rfcEmisor VARCHAR(13),
--     rfcReceptor VARCHAR(13),
--     UUID VARCHAR(50), -- Considerando el UUID como VARCHAR por su longitud
--     FOREIGN KEY (rfcEmisor) REFERENCES Usuario(rfcEmisor)
--     FOREIGN KEY (rfcReceptor) REFERENCES Clientes(rfcReceptot)
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

-- DELETE FROM Usuario