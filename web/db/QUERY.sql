-- DROP TABLE ClienteCSF
-- CREATE TABLE IF NOT EXISTS ClienteCSF(
--     nombre VARCHAR(50) NOT NULL,
--     rfc VARCHAR(13) NOT NULL PRIMARY KEY,
--     regimen VARCHAR(150) NOT NULL
-- )

-- DELETE FROM Cliente

-- DROP TABLE Usuarios

-- CREATE table if not EXISTS Usuario (
--     usuario varchar (20) NOT NULL,
--     pass varchar(20) NOT NULL,
--     rfc  varchar(13) not null PRIMARY KEY
-- )

-- INSERT into Usuario values ('Wuiz','123','ZAPL0108266K0')

-- CREATE TABLE Facturas (
--     ID INTEGER PRIMARY KEY,
--     Folio VARCHAR(10),
--     Fecha DATE,
--     Subtotal DECIMAL(10, 2),
--     Total DECIMAL(10, 2),
--     TipoComprobante CHAR(1),
--     EmisorRFC VARCHAR(13),
--     ReceptorRFC VARCHAR(13),
--     UUID VARCHAR(36), -- Considerando el UUID como VARCHAR por su longitud
--     FOREIGN KEY (EmisorRFC) REFERENCES Cliente(RFC)
--     -- Se comenta la línea de la clave foránea que genera conflicto
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

DELETE FROM Cliente