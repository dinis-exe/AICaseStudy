-- Create Hospitals table
CREATE TABLE IF NOT EXISTS Hospitals (
    hospital_id INTEGER PRIMARY KEY,
    hospital_name TEXT NOT NULL,
    location TEXT NOT NULL
);

-- Create Workers table
CREATE TABLE IF NOT EXISTS Workers (
    worker_id INTEGER PRIMARY KEY,
    worker_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob DATE NOT NULL
);

-- Create Hospital_Worker table
CREATE TABLE IF NOT EXISTS Hospital_Worker (
    worker_id INTEGER,
    hospital_id INTEGER,
    password TEXT NOT NULL,
    PRIMARY KEY (worker_id, hospital_id),
    FOREIGN KEY (worker_id) REFERENCES Workers(worker_id),
    FOREIGN KEY (hospital_id) REFERENCES Hospitals(hospital_id)
);

-- Create Patients table
CREATE TABLE IF NOT EXISTS Patients (
    patient_id INTEGER PRIMARY KEY,
    password TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL
);

-- Create Patient_history table
CREATE TABLE IF NOT EXISTS Patient_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    result TEXT NOT NULL,
    date DATE NOT NULL,
    hospital_id INTEGER,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (hospital_id) REFERENCES Hospitals(hospital_id)
);

-- Insertion of Portuguese Hospitals
INSERT INTO Hospitals (hospital_id, hospital_name, location) VALUES
    (1, 'Hospital de Santa Cruz', 'Funchal'),
    (2, 'Hospital de São João', 'Porto'),
    (3, 'Centro Hospitalar Lisboa Norte', 'Lisboa'),
    (4, 'Hospital Garcia de Orta', 'Almada');

-- Insertion of Workers
INSERT INTO Workers (worker_id, worker_name, gender, dob) VALUES
    (1, 'Dr. João Silva', 'M', '1980-05-15'),
    (2, 'Dra. Maria Fernandes', 'F', '1975-03-22'),
    (3, 'Dr. Pedro Costa', 'M', '1985-11-30'),
    (4, 'Dra. Carla Sousa', 'F', '1990-07-10'),
    (5, 'Dr. Luís Ribeiro', 'M', '1978-02-28');

-- Associate Workers with Hospitals in Hospital_Worker (using sample passwords)
INSERT INTO Hospital_Worker (worker_id, hospital_id, password) VALUES
    (1, 1, 'pass123'),
    (2, 2, 'senha456'),
    (3, 3, 'admin789'),
    (4, 4, 'secure321'),
    (5, 1, 'mypassword');

-- Insertion of Patients (with random data)
INSERT INTO Patients (patient_id, password, patient_name, dob, gender) VALUES
    (1, 'p1', 'Ana Gomes', '1990-06-10', 'F'),
    (2, 'p2', 'Carlos Mendes', '1982-12-03', 'M'),
    (3, 'p3', 'Rita Sousa', '2000-04-25', 'F'),
    (4, 'p4', 'Miguel Oliveira', '1978-09-15', 'M'),
    (5, 'p5', 'Sofia Martins', '1995-08-20', 'F'),
    (6, 'p6', 'Ricardo Silva', '1988-11-11', 'M'),
    (7, 'p7', 'Beatriz Dias', '1992-03-05', 'F');

-- Insertion of Patient History records (linking each patient to a hospital)
INSERT INTO Patient_history (patient_id, result, date, hospital_id) VALUES
    (1, 'Positive', '2023-05-10', 1),
    (2, 'Negative', '2023-04-22', 2),
    (3, 'Inconclusive', '2023-03-15', 3),
    (4, 'Positive', '2023-01-20', 4),
    (5, 'Negative', '2023-06-05', 2),
    (6, 'Positive', '2023-07-12', 1),
    (7, 'Negative', '2023-08-01', 3);