from flask import Flask, jsonify, send_from_directory, request, redirect, url_for, render_template, session
import sqlite3
import os
from werkzeug.utils import secure_filename
import smtplib
from email.message import EmailMessage
from flask_cors import CORS
import logging  # Import logging module

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a strong secret key

# Allow frontend to access backend (CORS)
CORS(app)

# Set database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'hospital_db.sqlite')

# Configure logging
logging.basicConfig(level=logging.DEBUG,  # Set the logging level to DEBUG
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Route to fetch patient list
@app.route('/hospital-patients')
def get_patients():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT patient_id, patient_name FROM Patients")  # Updated table name
        patients = [{"patient_id": row[0], "patient_name": row[1]} for row in cursor.fetchall()]
        conn.close()
        logging.debug(f"Fetched patients: {patients}")
        return jsonify({"patients": patients})
    except Exception as e:
        logging.error(f"Error fetching patients: {e}")
        return jsonify({"error": str(e)}), 500

# Serve static files (HTML, CSS, JS)
@app.route('/')
def serve_index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('public', filename)

# Route to fetch patient details
@app.route('/patient-details/<int:patient_id>')
def get_patient_details(patient_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT patient_id, patient_name, gender, dob FROM Patients WHERE patient_id = ?", (patient_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            patient = {
                "patient_id": row[0],
                "patient_name": row[1],
                "patient_gender": row[2],
                "patient_dob": row[3],
            }
            logging.debug(f"Fetched patient details: {patient}")
            return jsonify({"patient": patient})
        else:
            logging.warning(f"Patient not found: {patient_id}")
            return jsonify({"error": "Patient not found."}), 404
    except Exception as e:
        logging.error(f"Error fetching patient details: {e}")
        return jsonify({"error": str(e)}), 500

# Route to verify hospital worker login
@app.route('/hospital-verify', methods=['POST'])
def verify_hospital_worker():
    worker_id = request.form.get('worker')
    password = request.form.get('senha')
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT worker_id FROM Hospital_Worker WHERE worker_id = ? AND password = ?", (worker_id, password))
        row = cursor.fetchone()
        conn.close()
        if row:
            session['worker_id'] = worker_id  # Store worker_id in session
            logging.info(f"Worker {worker_id} logged in successfully.")
            return redirect(url_for('serve_dashboard'))
        else:
            logging.warning("Invalid Worker ID or Password.")
            return render_template('login.html', error="Invalid Worker ID or Password.")
    except Exception as e:
        logging.error(f"Error verifying hospital worker: {e}")
        return jsonify({"error": str(e)}), 500

# Route for dashboard after successful login
@app.route('/hospital-dashboard')
def serve_dashboard():
    return send_from_directory('public', 'hospital-dashboard.html')

# Route to record exam and send result by email
@app.route('/record-exam', methods=['POST'])
def record_exam():
    patient_id = request.form.get('patient_id')
    exam_result = request.form.get('exam_result')
    exam_date = request.form.get('date')
    client_email = request.form.get('client_email')
    exam_file = request.files.get('exam_file')

    if not patient_id or not exam_result or not exam_date or not client_email:
        logging.warning("Missing required fields in the exam record.")
        return jsonify({"error": "Missing required fields"}), 400

    # Save the uploaded exam file (if provided)
    file_path = None
    if exam_file:
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        filename = secure_filename(exam_file.filename)
        file_path = os.path.join(upload_folder, filename)
        exam_file.save(file_path)

    # Insert exam record into the Patient_history table.
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Patient_history (patient_id, result, date, hospital_id) VALUES (?, ?, ?, ?)",
            (patient_id, exam_result, exam_date, 1)
        )
        conn.commit()
        conn.close()
        logging.info(f"Recorded exam for patient_id {patient_id} with result '{exam_result}'.")
    except Exception as e:
        logging.error(f"Error inserting exam record: {e}")
        return jsonify({"error": str(e)}), 500

    # Compose the email message
    subject = "Resultado do Exame de Raio-X - ExaminAI"
    body = f"""
Olá,

Seu exame realizado em {exam_date} apresentou o seguinte resultado:
{exam_result}

Atenciosamente,
ExaminAI
    """
    msg = EmailMessage()
    msg.set_content(body)
    msg['Subject'] = subject
    msg['From'] = "examinai.health@gmail.com"  # Replace with your sender email
    msg['To'] = client_email

    # Send the email using Gmail's SMTP server
    try:
        logging.debug("Attempting to send email via Gmail SMTP...")
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()  # Upgrade the connection to a secure encrypted SSL/TLS connection
            server.login('examinai.health@gmail.com', 'cogs ippx momo eakg')  # Replace with your Gmail address and App Password
            server.send_message(msg)
        logging.info(f"Email sent to {client_email} successfully.")
    except Exception as e:
        logging.error(f"Error sending email to {client_email}: {e}")

    return redirect(url_for('serve_dashboard'))

# Route to handle logout
@app.route('/logout')
def logout():
    session.pop('worker_id', None)  # Remove worker_id from session
    return redirect(url_for('serve_index'))  # Redirect to index.html


# Route to add a new patient
@app.route('/add-patient', methods=['POST'])
def add_patient():
    patient_id = request.form.get('patient_id')
    patient_name = request.form.get('patient_name')
    dob = request.form.get('dob')
    gender = request.form.get('gender')
    password = request.form.get('password')

    # Basic validation
    if not patient_id or not patient_name or not dob or not gender or not password:
        return jsonify({"error": "All fields are required."}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Patients (patient_id, patient_name, dob, gender, password) VALUES (?, ?, ?, ?, ?)",
            (patient_id, patient_name, dob, gender, password)
        )
        conn.commit()
        conn.close()
        logging.info(f"Added new patient: {patient_name} (ID: {patient_id})")
        
        # Redirect to the hospital dashboard after successfully adding the patient
        return redirect(url_for('serve_dashboard'))  # Redirect to the dashboard

    except sqlite3.IntegrityError:
        logging.warning(f"Patient ID {patient_id} already exists.")
        return jsonify({"error": "Patient ID already exists."}), 400
    except Exception as e:
        logging.error(f"Error adding patient: {e}")
        return jsonify({"error": str(e)}), 500


# Route to fetch patient exam history
@app.route('/patient-history')
def get_patient_history():
    patient_id = request.args.get('patient_id')
    if not patient_id:
        return jsonify({"error": "Patient ID is required."}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT history_id, result, date, hospital_id
            FROM Patient_history
            WHERE patient_id = ?
        """, (patient_id,))
        history_records = cursor.fetchall()

        # Fetch hospital names for each history record
        history = []
        for record in history_records:
            history_id, result, date, hospital_id = record
            # Fetch hospital name
            cursor.execute("SELECT hospital_name FROM Hospitals WHERE hospital_id = ?", (hospital_id,))
            hospital_name = cursor.fetchone()
            hospital_name = hospital_name[0] if hospital_name else "Unknown Hospital"
            history.append({
                "history_id": history_id,
                "result": result,
                "date": date,
                "hospital_name": hospital_name
            })

        conn.close()
        logging.debug(f"Fetched patient history: {history}")
        return jsonify({"history": history})
    except Exception as e:
        logging.error(f"Error fetching patient history: {e}")
        return jsonify({"error": str(e)}), 500


# Run Flask app
if __name__ == '__main__':
    app.run(debug=True)
