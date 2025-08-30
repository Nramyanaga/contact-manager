# contact-manager
COP4331C LAMP small project for Group 25. A simple PHP/MySQL web app for managing contacts, colors, and users.
This project is designed to run locally using XAMPP (Apache + MySQL + phpMyAdmin).


# Setup Instructions

**_1. Install XAMPP_**
1) Download XAMPP for your OS: https://www.apachefriends.org/
2) Install and start:
    - Apache (for PHP)
    - MySQL (for phpMyAdmin/Database)
3) You should now be able to open:
    - http://localhost → XAMPP dashboard
    - http://localhost/phpmyadmin → phpMyAdmin


**_2. Clone the repository into XAMPP htdocs_**
1) Move into your XAMPP htdocs folder (default: C:\xampp\htdocs on Windows)
    - cd C:\xampp\htdocs
    - git clone https://github.com/<your-username>/<your-repo>.git contact-manager (replace the url with yours when you click the green button CODE)
2) Now the project is available at: http://localhost/contact-manager


**_3. Import the database_**
1) Open phpMyAdmin (http://localhost/phpmyadmin).
2) Create a new database: cop4331_dev (Collation: utf8mb4_unicode_ci)
3) Select the database → Go to Import.
4) Choose the file: db/cop4331_full.sql
5) Disable Enable foreign key checks
6) Click Go.


**_4. Configure the app_**
1) Copy the example config: cp config.example.php config.php
2) The provided defaults work for XAMPP


**_5. Run the website_**
1) Make sure Apache and MySQL are running in XAMPP.
2) Open your browser: http://localhost/contact-manager


**_6. Quick sanity check_**
1) Log into the site with a sample user from the Users table (RickL, SamH, etc.).
2) Check that contacts and colors display.


**_Notes_**
1) Don’t commit config.php (real config) — it’s already in .gitignore.
2) If you break the DB, just drop cop4331_dev in phpMyAdmin and re-import the SQL dump.
