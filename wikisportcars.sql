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
(3, 'Porsche 911', 'Macchina sportiva tedesca con motore 6 cilindri', 'https://img.autoabc.lv/Porsche-911/Porsche-911_2011_Kupeja_231232737_4.jpg', 'Porsche', '911', 2011, '6 cilindri'),
(4, 'Lamborghini Huracan', 'Macchina sportiva italiana con motore V10', 'https://www.virgilio.it/motori/wp-content/uploads/sites/4/2024/04/Lamborghini-Huracan-STJ.jpeg', 'Lamborghini', 'Huracan', 2014, 'V10'),
(5, 'Audi R8', 'Macchina sportiva tedesca con motore V10', 'https://mrsportscars.com/wp-content/uploads/2017/09/Audi-R8-2006-Photo-31.jpg', 'Audi', 'R8', 2006, 'V10'),
(6, 'Nissan GT-R35', 'Macchina sportiva giapponese con motore V6', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Nissan_GT-R_01.JPG', 'Nissan', 'GT-R35', 2007, 'V6'),
(7, 'McLaren 720S', 'Macchina sportiva inglese con motore V8', 'https://www.supervettura.com/blobs/Cars/145/f81da39b-a5c6-4f2c-a56f-a6515ec0984f.jpg?width=1920&height=1080&mode=crop', 'McLaren', '720S', 2017, 'V8'),
(8, 'Bugatti Veyron', 'Macchina sportiva francese con motore W16', 'https://www.auto-data.net/images/f7/Bugatti-EB-Veyron-16.4-Coupe.jpg', 'Bugatti', 'Veyron', 2005, 'W16'),
(9, 'Koenigsegg Agera', 'Macchina sportiva svedese con motore V8', 'https://www.supervettura.com/blobs/Cars/69/c46edc49-82fe-4aca-bf90-9f8719bde185.jpg?width=1920&height=1080&mode=crop', 'Koenigsegg', 'Agera', 2011, 'V8'),
(10, 'Pagani Huayra', 'Macchina sportiva italiana con motore V12', 'https://www.autocar.co.uk/sites/autocar.co.uk/files/pagani-2511111948565911600x1060_0.jpg', 'Pagani', 'Huayra', 2012, 'V12');

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE favorites (
    user_id INT,
    car_id INT,
    PRIMARY KEY (user_id, car_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
);