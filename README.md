# Wayamba Exchange - Phase 1

Welcome page, Sign up and Log in for the Wayamba University item exchange platform.

- **Front end:** HTML5, CSS3 and JavaScript (separate `.html` pages)
- **Back end:** PHP (small JSON API in the `api` folder)
- **Database:** MySQL (XAMPP)

## Setup (XAMPP)
1. Install XAMPP and start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Copy the `wayamba-exchange` folder into `C:\xampp\htdocs\`.
3. Open `http://localhost/phpmyadmin`, go to **Import**, choose `database/schema.sql` and click **Go**.
   This creates the `wayamba_exchange` database and the `users` table.
4. If your MySQL has a password, set it in `api/config.php` (XAMPP default is `root` with no password).
5. Open `http://localhost/wayamba-exchange/index.html`.

Open the site through `http://localhost/...`. Opening the `.html` files by double-clicking will not work,
because the pages need PHP.

## Create an administrator
Open a terminal in the project folder (the XAMPP shell, or a terminal where `php` works) and run:

    php create_admin.php ADMIN001 "Admin Name" "StrongPassword123"

Log in with that ID. Administrators are sent to `admin.html`, students to `profile.html`.

## How it fits together
The pages are plain HTML. JavaScript sends and receives JSON from the PHP files in `api/`,
and PHP reads and writes MySQL.

| Front end (browser) | Back end (server) |
|---|---|
| `index.html` Welcome page | `api/me.php` who is logged in |
| `signup.html` + `assets/js/signup.js` | `api/register.php`, `api/faculties.php` |
| `login.html` + `assets/js/login.js` | `api/login.php` |
| header Log out button (`assets/js/app.js`) | `api/logout.php` |
| `profile.html` (placeholder) | `api/me.php` |
| `admin.html` (placeholder) | `api/me.php` |

Other files: `assets/css/style.css` (all styles), `assets/js/app.js` (shared code: calls to the API,
header and footer, form helpers), `api/config.php` (database and faculty list), `api/db.php`
(MySQL connection), `api/helpers.php` (sessions, JSON replies, CSRF), `database/schema.sql`, `create_admin.php`.

## Built-in protection
- Passwords stored with `password_hash` (never plain text)
- All database queries use prepared statements
- CSRF token required on every POST request
- Session id renewed after login
- 5 wrong log in attempts lock the log in for 2 minutes
- Checks run in the browser and again on the server
- The server decides who is an administrator, not the browser

## Before you hand in
- Replace `[Admin email]` and `[Admin phone number]` in `index.html`, and check the faculty list in `api/config.php`.
- Student ID format: 4 to 20 letters, numbers, `/` or `-`. Change the pattern in `api/register.php`,
  `assets/js/app.js` if your university uses a fixed format.
