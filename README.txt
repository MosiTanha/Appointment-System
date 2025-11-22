# Appointment System

## Project Overview
A simple full-stack web application for managing appointments.
The system allows users to sign up, log in, view, add, search, and delete appointments. Admin users have full access to all appointments, while regular users can manage only their own appointments.


##Technologies Used
Frontend: HTML5 / CSS3/JavaScript, Bootstrap, AJAX and, jQuery
Backend: Node.js
Database: Microsoft SQL Server database


## Installation
- Make sure these are installed: Node.js, Microsoft SQL Server, SQL Server Management Studio (optional for DB setup)
- Clone the repository.
- Navigate to the project folder.
- Run `npm install` to install dependencies.
- Configure MSSQL
- Update AppointmentServer.js with your database credentials.
- Ensure SQL Server is running and the database AppointmentSystem exists.
- Run SQL commands in SQL_Commands.txt to create tables.
- Start the server with `node AppointmentServer.js`.
- Open the application in your browser at `http://localhost:8081`.

## Notes
- Passwords are stored encrypted using AES-256-CBC.
- The system assumes admin is a special username for full access.
- Appointments are stored in MTable and linked to users via UserId.
- Datepicker is implemented using jQuery UI.
- Time input is validated and converted to 12-hour format with AM/PM.

