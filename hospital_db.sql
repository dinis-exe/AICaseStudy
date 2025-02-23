-- Ativar chaves estrangeiras no SQLite
PRAGMA foreign_keys = ON;

-- Criar tabela de Trabalhadores
CREATE TABLE Workers (
    worker_id INT PRIMARY KEY,
    worker_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    dob DATE NOT NULL
);

-- Criar tabela de Hospitais
CREATE TABLE Hospitals (
    hospital_id INT PRIMARY KEY,  
    hospital_name VARCHAR(255) NOT NULL,
    location TEXT
);

-- Criar tabela de Associação entre Trabalhadores e Hospitais
CREATE TABLE Hospital_Worker (
    worker_id INT NOT NULL,
    hospital_id INT NOT NULL,
    password TEXT NOT NULL,  -- Senha em texto puro (melhor seria usar hash)
    PRIMARY KEY (worker_id, hospital_id),
    FOREIGN KEY (worker_id) REFERENCES Workers(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES Hospitals(hospital_id) ON DELETE CASCADE
);

-- Criar tabela de Pacientes
CREATE TABLE Patients (
    patient_id INT PRIMARY KEY,
    password TEXT NOT NULL,   
    patient_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL
);

-- Criar tabela de Histórico de Pacientes
CREATE TABLE Patient_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INT NOT NULL,
    result VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    hospital_id INT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES Hospitals(hospital_id) ON DELETE CASCADE
);
