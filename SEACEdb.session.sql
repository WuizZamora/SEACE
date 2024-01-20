-- CREATE TABLE Usuario(
--     rfcEmisor VARCHAR(13) NOT NULL PRIMARY KEY,
--     usuario VARCHAR(20) NOT NULL,
--     pass VARCHAR(20) NOT NULL
-- );

-- INSERT INTO Usuario VALUES ('ZAPL0108266K0', 'Wuiz', '123');

-- CREATE TABLE Cliente(
--     rfcReceptor VARCHAR(13) NOT NULL PRIMARY KEY,
--     nombre VARCHAR(100) NOT NULL,
--     regimen VARCHAR(255) NOT NULL
-- );

-- CREATE TABLE Facturas (
--     ID INTEGER PRIMARY KEY,
--     Folio VARCHAR(100),
--     Fecha DATETIME,
--     Subtotal DECIMAL(10, 2),
--     Total DECIMAL(10, 2),
--     TipoComprobante CHAR(1),
--     rfcEmisor VARCHAR(13),
--     rfcReceptor VARCHAR(13),
--     UUID VARCHAR(50),
--     FOREIGN KEY (rfcEmisor) REFERENCES Usuario(rfcEmisor),
--     FOREIGN KEY (rfcReceptor) REFERENCES Clientes(rfcReceptor)
-- );

-- Tabla de Conceptos
-- CREATE TABLE Conceptos (
--     ConceptoID INT PRIMARY KEY,
--     FacturaID INT,
--     Cantidad INT,
--     Unidad VARCHAR(10),
--     Identificacion VARCHAR(10),
--     Descripcion VARCHAR(255),
--     ValorUnitario DECIMAL(10, 2),
--     Importe DECIMAL(10, 2),
--     FOREIGN KEY (FacturaID) REFERENCES Facturas(ID)
-- );

-- Tabla de Impuestos Globales Trasladados
-- CREATE TABLE ImpuestosGlobales (
--     FacturaID INT PRIMARY KEY,
--     Impuesto VARCHAR(3),
--     TasaCuota DECIMAL(10, 6),
--     Importe DECIMAL(10, 2),
--     FOREIGN KEY (FacturaID) REFERENCES Facturas(ID)
-- );

-- -- Tabla de Timbre Fiscal Digital
-- CREATE TABLE TimbreFiscal (
--     FacturaID INT PRIMARY KEY,
--     UUID VARCHAR(50),
--     FechaTimbrado DATETIME,
--     FOREIGN KEY (FacturaID) REFERENCES Facturas(ID)
-- );

-- DELETE FROM Facturas;
-- DELETE FROM TimbreFiscal;
-- DELETE FROM Conceptos;
-- DELETE FROM ImpuestosGlobales;

-- DROP TABLE Conceptos;

-- DROP TABLE Facturas


CREATE TABLE Cuenta(
fechasOperacion DATE,
referenciaAmpliada VARCHAR (255),
cargo DECIMAL (10,2),
abono DECIMAL (10,2),
saldo DECIMAL (10,2)
);