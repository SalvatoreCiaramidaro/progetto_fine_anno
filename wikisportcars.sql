DROP DATABASE IF EXISTS wikisportcars;

CREATE DATABASE wikisportcars;
USE wikisportcars;

DROP TABLE IF EXISTS `users`;
-- Struttura della tabella `users`
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `confirmed` BOOLEAN DEFAULT 0,
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `is_admin` BOOLEAN DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserisco un utente admin predefinito
INSERT INTO `users` (`username`, `email`, `password`, `confirmed`, `is_admin`) VALUES 
('admin', 'admin@example.com', 'pbkdf2:sha256:260000$7prJAiX6jHkAr75C$b0d3ff8cc49e3d1e1f2e9d0a80d8341c9d3f3c86ab0ca66c15c9f1e6a7c6b4f4', 1, 1);
-- Password: admin123

DROP TABLE IF EXISTS `cars`;
CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    small_description VARCHAR(100) NOT NULL,
    description VARCHAR(10000) NOT NULL,
    image VARCHAR(1024) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    engine VARCHAR(100) NOT NULL,
    car_type VARCHAR(50) NOT NULL
);

INSERT INTO cars (id, name, small_description, description, image, brand, model, year, engine, car_type) VALUES
(1, 'Corvette C6', 'Macchina sportiva americana Muscle con motore V8',
 'La Corvette C6 rappresenta una combinazione perfetta tra tradizione e innovazione nella cultura automobilistica americana. Questa vettura è famosa per il suo design aggressivo e muscoloso, accompagnato da un potente motore V8 capace di erogare prestazioni eccezionali sia in pista che su strada. La C6 è stata progettata per offrire un’esperienza di guida intensa, mantenendo al contempo un comfort elevato per un uso quotidiano. Un’icona del design americano, che continua a incantare gli appassionati di automobile con il suo fascino intramontabile.',
 'https://upload.wikimedia.org/wikipedia/commons/9/99/2003_Chevrolet_Corvette_C6_%284794073538%29_%28cropped%29.jpg',
 'Chevrolet Corvette', 'C6', 2003, 'V8', 'Muscle'),

(2, 'Ferrari 458', 'Macchina sportiva italiana con motore V8',
 'La Ferrari 458 incarna il meglio dell’ingegneria italiana, unendo prestazioni mozzafiato a un design elegante ed aerodinamico. Ogni linea della 458 è studiata per ottimizzare la velocità e l’efficienza, mantenendo però un’inconfondibile raffinatezza. Il suo motore V8, affiancato da una tecnologia di ultima generazione, offre una guida reattiva e coinvolgente, facendo di questa supercar una scelta ideale sia per la pista che per chi desidera il massimo dal piacere di guida.',
 'https://images.ctfassets.net/uaddx06iwzdz/1qzdgJF4iYltZDsb6tOpLW/d44cbcf8ec3cb959494ac40c36d48a07/ferrari-458-italia-side.jpeg',
 'Ferrari', '458', 2009, 'V8', 'Supercar'),

(3, 'Porsche 911', 'Macchina sportiva tedesca con motore 6 cilindri',
 'La Porsche 911 è una leggenda del mondo delle auto sportive, celebre per il suo design senza tempo e la perfetta sinergia tra tradizione e innovazione. Dotata di un motore a 6 cilindri, la 911 offre un equilibrio impeccabile tra potenza, maneggevolezza e raffinatezza. Ogni dettaglio, dalla silhouette aerodinamica al sofisticato interno, è stato progettato per garantire una guida dinamica e coinvolgente, rendendo ogni esperienza al volante un vero piacere.',
 'https://img.autoabc.lv/Porsche-911/Porsche-911_2011_Kupeja_231232737_4.jpg',
 'Porsche', '911', 2011, '6 cilindri', 'Sportiva'),

(4, 'Lamborghini Huracan', 'Macchina sportiva italiana con motore V10',
 'La Lamborghini Huracan rappresenta l’avanguardia del design e della tecnologia italiana nel segmento delle supercar. Con il suo motore V10 e linee audaci e dinamiche, la Huracan offre prestazioni estreme e un’esperienza di guida unica. Ogni curva e ogni dettaglio sono studiati per garantire aerodinamicità e stabilità, trasformando ogni corsa in un’avventura emozionante e piena di adrenalina.',
 'https://res.cloudinary.com/motortrak/image/upload/t_base_vehicle_transformation/v1706191867/ims2/vehicle-media/ce150f3a37083d090d804866f50f975a/lamborghini-Hurac%C3%A1n%20LP%20610-4-undefined-1/gdpoh2jpq6biwmqbkfu0.webp',
 'Lamborghini', 'Huracan', 2014, 'V10', 'Supercar'),

(5, 'Audi R8', 'Macchina sportiva tedesca con motore V10',
 'L’Audi R8 è il simbolo dell’eccellenza ingegneristica tedesca, capace di coniugare lusso, performance e comfort in un’unica vettura. Il suo motore V10 garantisce accelerazioni fulminee, mentre il design sofisticato e le tecnologie all’avanguardia offrono una guida tanto reattiva quanto raffinata. La R8 è stata progettata per conquistare sia le strade urbane sia le piste di gara, offrendo un’esperienza di guida completa e innovativa.',
 'https://mrsportscars.com/wp-content/uploads/2017/09/Audi-R8-2006-Photo-31.jpg',
 'Audi', 'R8', 2006, 'V10', 'Supercar'),

(6, 'Nissan GT-R35', 'Macchina sportiva giapponese con motore V6',
 'La Nissan GT-R35 è sinonimo di tecnologia avanzata e prestazioni straordinarie, considerata tra le supercar giapponesi più innovative. Il suo motore V6, abbinato a un sofisticato sistema di trazione integrale, offre un’esperienza di guida dinamica e altamente reattiva. Con un design che unisce funzionalità ed estetica, la GT-R35 è stata progettata per dominare sia su strada che in pista, rappresentando una vera rivoluzione nell’automobilismo moderno.',
 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Nissan_GT-R_01.JPG',
 'Nissan', 'GT-R35', 2007, 'V6', 'Supercar'),

(7, 'McLaren 720S', 'Macchina sportiva inglese con motore V8',
 'La McLaren 720S è una supercar britannica che unisce un design futuristico a prestazioni eccezionali. Realizzata con materiali leggeri e all’avanguardia, la 720S offre una dinamica di guida rivoluzionaria, grazie al suo motore V8 che eroga una potenza impressionante. Ogni dettaglio, dalle linee scolpite al sistema aerodinamico, è stato studiato per garantire massima efficienza e un’esperienza di guida emozionante e senza compromessi.',
 'https://www.supervettura.com/blobs/Cars/145/f81da39b-a5c6-4f2c-a56f-a6515ec0984f.jpg?width=1920&height=1080&mode=crop',
 'McLaren', '720S', 2017, 'V8', 'Supercar'),

(8, 'Bugatti Veyron', 'Macchina sportiva francese con motore W16',
 'La Bugatti Veyron è una delle hypercar più iconiche al mondo, un capolavoro dell’ingegneria francese che unisce potenza estrema e lusso ineguagliabile. Dotata di un motore W16, la Veyron è in grado di raggiungere velocità incredibili mantenendo un comfort e una stabilità sorprendenti. Il suo design esclusivo, caratterizzato da eleganza e innovazione, la rende un simbolo di prestigio e tecnologia all’avanguardia.',
 'https://www.auto-data.net/images/f7/Bugatti-EB-Veyron-16.4-Coupe.jpg',
 'Bugatti', 'Veyron', 2005, 'W16', 'Hypercar'),

(9, 'Koenigsegg Agera', 'Macchina sportiva svedese con motore V8',
 'La Koenigsegg Agera è un esempio estremo di ingegneria automobilistica svedese, progettata per spingere i limiti delle performance e del design. Questa hypercar, dotata di un motore V8, offre accelerazioni fulminee e una dinamica di guida che rompe ogni convenzione. Con la sua estetica minimalista e sofisticata, l’Agera rappresenta l’evoluzione della tecnologia sportiva in ogni suo dettaglio.',
 'https://www.supervettura.com/blobs/Cars/69/c46edc49-82fe-4aca-bf90-9f8719bde185.jpg?width=1920&height=1080&mode=crop',
 'Koenigsegg', 'Agera', 2011, 'V8', 'Hypercar'),

(10, 'Pagani Huayra', 'Macchina sportiva italiana con motore V12',
 'La Pagani Huayra è l’emblema dell’eleganza e della maestria artigianale italiana, unendo il meglio del design e della tecnologia in una supercar che è autentica opera d’arte. Dotata di un potente motore V12, la Huayra offre prestazioni straordinarie accompagnate da una guida fluida e carismatica. Ogni elemento, dalle finiture interne in materiali pregiati fino alle linee esterne scolpite, è studiato per creare un equilibrio perfetto tra bellezza e potenza.',
 'https://www.autocar.co.uk/sites/autocar.co.uk/files/pagani-2511111948565911600x1060_0.jpg',
 'Pagani', 'Huayra', 2012, 'V12', 'Hypercar');



CREATE TABLE car_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT,
    image VARCHAR(1024) NOT NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id)
);

INSERT INTO car_images (car_id, image) 
VALUES 


(1, 'https://extremeonlinestore.com/cdn/shop/files/FLIP-199-ABS_SS-080-ABS_SPOILER_218_ABS-HD-28_1400x.jpg?v=1743813788'),
(1, 'https://prod.pictures.autoscout24.net/listing-images/371eda98-9e26-4830-8020-e02e5d53f945_25712121-81eb-4913-8e92-48f42f7e9784.jpg/1280x960.webp'),
(1, 'https://prod-01-loadandpay-media.s3.eu-west-1.amazonaws.com/medias/cache/app_auction_slides_thumb/616802750f6c6332789666.jpg'),
(2, 'https://www.autoscout24.it/cms-content-assets/2kNB9B2UWSOJMfdLiCsn7u-0f66f5f33762f0ffbfee88bef76a5cfb-ferrari-458-italia-back-1100.jpeg'),
(2, 'https://www.autoscout24.it/cms-content-assets/6WYtZ8Kj5mO5QNBwcnCFpv-e23737ee3525530297d8ff37ec60840b-ferrari-458-italia-interior-1100.jpeg'),
(2, 'https://upload.wikimedia.org/wikipedia/commons/6/63/Ferrari_458_Italia_engine.jpg'),
(3, 'https://www.stuttcars.com/wp-content/uploads/2021/11/PORSCHE-911-Carrera-S-997-3811_16.jpeg'),
(3, 'https://res.cloudinary.com/unix-center/image/upload/c_limit,dpr_3.0,f_auto,fl_progressive,g_center,h_580,q_75,w_906/k6cuo7msynqzvbc30sd6.jpg'),
(3, 'https://img.stcrm.it/images/1202406/HOR_STD/800x/5-porsche-911-gt3-rs-4-0-2011-2.jpeg'),
(4, 'https://www.sportal.it/wp-content/uploads/2024/05/lamborghini_1232772Photogallery.jpg'),
(4, 'https://areamotori.files.wordpress.com/2017/03/lamborghini-huracan-performante-2017-interior2.jpg'),
(4, 'https://www.cataloge.eu/media/lamborghini/7/it/lamborghini-huracan-evo-2020-motore.jpg'),
(5, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/2007_Audi_R8_02.JPG/1200px-2007_Audi_R8_02.JPG'),
(5, 'https://img.stcrm.it/images/1188062/HOR_STD/800x/5-audi-r8-v8-4-2-2007-11-2.jpeg'),
(5, 'https://media.motorbox.com/image/5/0/7/50787/50787-16x9-lg.jpg'),
(6, 'https://www.cataloge.eu/media/nissan/30/it/thumbs-500/nissan-gt-r-r35-2009-1.jpg'),
(6, 'https://images.ctfassets.net/uaddx06iwzdz/woy7Qma4jGO2SSAbcZ3rL/37bea23352d8ac17d77ffbef4f639a04/nissan-gtr-l-04.jpg'),
(6, 'https://cdn.motor1.com/images/mgl/bggjWv/s1/nissan-gt-r-nismo-2016.jpg'),
(7, 'https://i.bstr.es/highmotor/2017/05/McLaren-720S-7.jpg'),
(7, 'https://www.automobiledimension.com/photos/interior/mclaren-720s-2017-dashboard.jpg'),
(7, 'https://www.cavallivapore.it/wp-content/uploads/2017/03/McLaren-720S-Motore-2.jpg'),
(8, 'https://cdn.veloce.it/wp-content/uploads/webp/2024/05/bugatti-veyron-3.webp'),
(8, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjcKJZnpYiHd5BiKM2aRmkugPrHAtClBcLiw&s'),
(8, 'https://www.autotecnica.org/wp-content/uploads/2015/07/BUG_Veyron_Photo_46.jpg'),
(9, 'https://www.topcarrating.com/koenigsegg/2011-koenigsegg-agera-r-9.jpg'),
(9, 'https://www.supercars.net/blog/wp-content/uploads/2016/01/914168-2.jpg'),
(9, 'https://www.cdn-docs-ck.com/ck_img/zoom/111936/autoart_1_18_koenigsegg_agera_anno_2011_grigio_arg.jpg'),
(10, 'https://www.kessel.ch/immaginiAutoNuove/kes_huayra_bc_2.jpg'),
(10, 'https://www.cavallivapore.it/wp-content/gallery/cache/13153__720x540_pagani-huayra-interni.jpg'),
(10, 'https://blog.euroimportpneumatici.com/wp-content/uploads/2019/08/Pagani-Huayra-BC-Roadster-9.jpg');


DROP TABLE IF EXISTS `favorites`;
CREATE TABLE favorites (
    user_id INT,
    car_id INT,
    PRIMARY KEY (user_id, car_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (car_id, user_id)
);