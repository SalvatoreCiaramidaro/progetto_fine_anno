DROP DATABASE IF EXISTS wikisportcars;

CREATE DATABASE wikisportcars;
USE wikisportcars;

DROP TABLE IF EXISTS `users`;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS `cars`;
CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    engine VARCHAR(100) NOT NULL
);

INSERT INTO cars (id, name, description, image, brand, model, year, engine) VALUES
(1, 'Corvette C6', 'Macchina sportiva americana Muscle con motore V8', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/2003_Chevrolet_Corvette_C6_%284794073538%29_%28cropped%29.jpg/260px-2003_Chevrolet_Corvette_C6_%284794073538%29_%28cropped%29.jpg', 'Chevrolet', 'Corvette', 2003, 'V8'),
(2, 'Ferrari 458', 'Macchina sportiva italiana con motore V8', 'https://images.ctfassets.net/uaddx06iwzdz/1qzdgJF4iYltZDsb6tOpLW/d44cbcf8ec3cb959494ac40c36d48a07/ferrari-458-italia-side.jpeg', 'Ferrari', '458', 2009, 'V8'),
(3, 'Porsche 911', 'Macchina sportiva tedesca con motore 6 cilindri', 'Porsche_911_Carrera_4S_(991)_(cropped).jpg', 'Porsche', '911', 2011, '6 cilindri'),
(4, 'Lamborghini Huracan', 'Macchina sportiva italiana con motore V10', 'Lamborghini_Huracán_LP_610-4_Spyder_(cropped).jpg', 'Lamborghini', 'Huracan', 2014, 'V10'),
(5, 'Audi R8', 'Macchina sportiva tedesca con motore V10', 'Audi_R8_V10_Spyder_(cropped).jpg', 'Audi', 'R8', 2006, 'V10'),
(6, 'Nissan GT-R', 'Macchina sportiva giapponese con motore V6', 'Nissan_GT-R_(R35)_(cropped).jpg', 'Nissan', 'GT-R', 2007, 'V6'),
(7, 'McLaren 720S', 'Macchina sportiva inglese con motore V8', 'McLaren_720S_(cropped).jpg', 'McLaren', '720S', 2017, 'V8'),
(8, 'Bugatti Veyron', 'Macchina sportiva francese con motore W16', 'Bugatti_Veyron_16.4_Super_Sport_(cropped).jpg', 'Bugatti', 'Veyron', 2005, 'W16'),
(9, 'Koenigsegg Agera', 'Macchina sportiva svedese con motore V8', 'Koenigsegg_Agera_(cropped).jpg', 'Koenigsegg', 'Agera', 2011, 'V8'),
(10, 'Pagani Huayra', 'Macchina sportiva italiana con motore V12', 'Pagani_Huayra_(cropped).jpg', 'Pagani', 'Huayra', 2012, 'V12');

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE favorites (
    user_id INT,
    car_id INT,
    PRIMARY KEY (user_id, car_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
);