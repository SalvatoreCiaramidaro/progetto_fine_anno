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
    small_description VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    image VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT,
    engine VARCHAR(100) NOT NULL
);

INSERT INTO cars (id, name, small_description, description, image, brand, model, year, engine) VALUES
(1, 'Corvette C6', 'Macchina sportiva americana Muscle con motore V8',
 'La Corvette C6 rappresenta una combinazione perfetta tra tradizione e innovazione nella cultura automobilistica americana. Questa vettura è famosa per il suo design aggressivo e muscoloso, accompagnato da un potente motore V8 capace di erogare prestazioni eccezionali sia in pista che su strada. La C6 è stata progettata per offrire un’esperienza di guida intensa, mantenendo al contempo un comfort elevato per un uso quotidiano. Un’icona del design americano, che continua a incantare gli appassionati di automobile con il suo fascino intramontabile.',
 'https://upload.wikimedia.org/wikipedia/commons/9/99/2003_Chevrolet_Corvette_C6_%284794073538%29_%28cropped%29.jpg',
 'Chevrolet Corvette', 'C6', 2003, 'V8'),

(2, 'Ferrari 458', 'Macchina sportiva italiana con motore V8',
 'La Ferrari 458 incarna il meglio dell’ingegneria italiana, unendo prestazioni mozzafiato a un design elegante ed aerodinamico. Ogni linea della 458 è studiata per ottimizzare la velocità e l’efficienza, mantenendo però un’inconfondibile raffinatezza. Il suo motore V8, affiancato da una tecnologia di ultima generazione, offre una guida reattiva e coinvolgente, facendo di questa supercar una scelta ideale sia per la pista che per chi desidera il massimo dal piacere di guida.',
 'https://images.ctfassets.net/uaddx06iwzdz/1qzdgJF4iYltZDsb6tOpLW/d44cbcf8ec3cb959494ac40c36d48a07/ferrari-458-italia-side.jpeg',
 'Ferrari', '458', 2009, 'V8'),

(3, 'Porsche 911', 'Macchina sportiva tedesca con motore 6 cilindri',
 'La Porsche 911 è una leggenda del mondo delle auto sportive, celebre per il suo design senza tempo e la perfetta sinergia tra tradizione e innovazione. Dotata di un motore a 6 cilindri, la 911 offre un equilibrio impeccabile tra potenza, maneggevolezza e raffinatezza. Ogni dettaglio, dalla silhouette aerodinamica al sofisticato interno, è stato progettato per garantire una guida dinamica e coinvolgente, rendendo ogni esperienza al volante un vero piacere.',
 'https://img.autoabc.lv/Porsche-911/Porsche-911_2011_Kupeja_231232737_4.jpg',
 'Porsche', '911', 2011, '6 cilindri'),

(4, 'Lamborghini Huracan', 'Macchina sportiva italiana con motore V10',
 'La Lamborghini Huracan rappresenta l’avanguardia del design e della tecnologia italiana nel segmento delle supercar. Con il suo motore V10 e linee audaci e dinamiche, la Huracan offre prestazioni estreme e un’esperienza di guida unica. Ogni curva e ogni dettaglio sono studiati per garantire aerodinamicità e stabilità, trasformando ogni corsa in un’avventura emozionante e piena di adrenalina.',
 'https://www.virgilio.it/motori/wp-content/uploads/sites/4/2024/04/Lamborghini-Huracan-STJ.jpeg',
 'Lamborghini', 'Huracan', 2014, 'V10'),

(5, 'Audi R8', 'Macchina sportiva tedesca con motore V10',
 'L’Audi R8 è il simbolo dell’eccellenza ingegneristica tedesca, capace di coniugare lusso, performance e comfort in un’unica vettura. Il suo motore V10 garantisce accelerazioni fulminee, mentre il design sofisticato e le tecnologie all’avanguardia offrono una guida tanto reattiva quanto raffinata. La R8 è stata progettata per conquistare sia le strade urbane sia le piste di gara, offrendo un’esperienza di guida completa e innovativa.',
 'https://mrsportscars.com/wp-content/uploads/2017/09/Audi-R8-2006-Photo-31.jpg',
 'Audi', 'R8', 2006, 'V10'),

(6, 'Nissan GT-R35', 'Macchina sportiva giapponese con motore V6',
 'La Nissan GT-R35 è sinonimo di tecnologia avanzata e prestazioni straordinarie, considerata tra le supercar giapponesi più innovative. Il suo motore V6, abbinato a un sofisticato sistema di trazione integrale, offre un’esperienza di guida dinamica e altamente reattiva. Con un design che unisce funzionalità ed estetica, la GT-R35 è stata progettata per dominare sia su strada che in pista, rappresentando una vera rivoluzione nell’automobilismo moderno.',
 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Nissan_GT-R_01.JPG',
 'Nissan', 'GT-R35', 2007, 'V6'),

(7, 'McLaren 720S', 'Macchina sportiva inglese con motore V8',
 'La McLaren 720S è una supercar britannica che unisce un design futuristico a prestazioni eccezionali. Realizzata con materiali leggeri e all’avanguardia, la 720S offre una dinamica di guida rivoluzionaria, grazie al suo motore V8 che eroga una potenza impressionante. Ogni dettaglio, dalle linee scolpite al sistema aerodinamico, è stato studiato per garantire massima efficienza e un’esperienza di guida emozionante e senza compromessi.',
 'https://www.supervettura.com/blobs/Cars/145/f81da39b-a5c6-4f2c-a56f-a6515ec0984f.jpg?width=1920&height=1080&mode=crop',
 'McLaren', '720S', 2017, 'V8'),

(8, 'Bugatti Veyron', 'Macchina sportiva francese con motore W16',
 'La Bugatti Veyron è una delle hypercar più iconiche al mondo, un capolavoro dell’ingegneria francese che unisce potenza estrema e lusso ineguagliabile. Dotata di un motore W16, la Veyron è in grado di raggiungere velocità incredibili mantenendo un comfort e una stabilità sorprendenti. Il suo design esclusivo, caratterizzato da eleganza e innovazione, la rende un simbolo di prestigio e tecnologia all’avanguardia.',
 'https://www.auto-data.net/images/f7/Bugatti-EB-Veyron-16.4-Coupe.jpg',
 'Bugatti', 'Veyron', 2005, 'W16'),

(9, 'Koenigsegg Agera', 'Macchina sportiva svedese con motore V8',
 'La Koenigsegg Agera è un esempio estremo di ingegneria automobilistica svedese, progettata per spingere i limiti delle performance e del design. Questa hypercar, dotata di un motore V8, offre accelerazioni fulminee e una dinamica di guida che rompe ogni convenzione. Con la sua estetica minimalista e sofisticata, l’Agera rappresenta l’evoluzione della tecnologia sportiva in ogni suo dettaglio.',
 'https://www.supervettura.com/blobs/Cars/69/c46edc49-82fe-4aca-bf90-9f8719bde185.jpg?width=1920&height=1080&mode=crop',
 'Koenigsegg', 'Agera', 2011, 'V8'),

(10, 'Pagani Huayra', 'Macchina sportiva italiana con motore V12',
 'La Pagani Huayra è l’emblema dell’eleganza e della maestria artigianale italiana, unendo il meglio del design e della tecnologia in una supercar che è autentica opera d’arte. Dotata di un potente motore V12, la Huayra offre prestazioni straordinarie accompagnate da una guida fluida e carismatica. Ogni elemento, dalle finiture interne in materiali pregiati fino alle linee esterne scolpite, è studiato per creare un equilibrio perfetto tra bellezza e potenza.',
 'https://www.autocar.co.uk/sites/autocar.co.uk/files/pagani-2511111948565911600x1060_0.jpg',
 'Pagani', 'Huayra', 2012, 'V12');



CREATE TABLE car_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT,
    image VARCHAR(200) NOT NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id)
);

INSERT INTO car_images (car_id, image) 
VALUES 

(1, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/2003_Chevrolet_Corvette_C6_%284794076030%29.jpg/1200px-2003_Chevrolet_Corvette_C6_%284794076030%29.jpg'),
(1, 'https://media-ys.automobile.it/api/v1/am-ad/images/7012cffc8470830ddbd50fc0d8c71e7b?rule=ad-1280.jpeg'),
(1, 'https://prod-01-loadandpay-media.s3.eu-west-1.amazonaws.com/medias/cache/app_auction_slides_thumb/616802750f6c6332789666.jpg'),

(2, 'https://example.com/image1.jpg'),
(2, 'https://example.com/image2.jpg'),
(2, 'https://example.com/image3.jpg'),
(2, 'https://example.com/image4.jpg'),
(2, 'https://example.com/image5.jpg'),

(3, 'https://example.com/image6.jpg'),
(3, 'https://example.com/image7.jpg'),

(4, 'https://example.com/image8.jpg'),
(4, 'https://example.com/image9.jpg'),

(5, 'https://example.com/image10.jpg'),
(5, 'https://example.com/image11.jpg'),

(6, 'https://example.com/image12.jpg'),
(6, 'https://example.com/image13.jpg'),

(7, 'https://example.com/image14.jpg'),
(7, 'https://example.com/image15.jpg'),

(8, 'https://example.com/image16.jpg'),
(8, 'https://example.com/image17.jpg'),

(9, 'https://example.com/image18.jpg'),
(9, 'https://example.com/image19.jpg'),

(10, 'https://example.com/image20.jpg'),
(10, 'https://example.com/image21.jpg');


DROP TABLE IF EXISTS `favorites`;
CREATE TABLE favorites (
    user_id INT,
    car_id INT,
    PRIMARY KEY (user_id, car_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
);