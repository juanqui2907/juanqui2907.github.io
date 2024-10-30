<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Colección de Hot Wheels</title>
    <style>
        /* Reset CSS */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* General Styles */
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f4f8;
            color: #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0;
        }

        header {
            background-color: #3a5ba0;
            color: white;
            padding: 20px;
            text-align: center;
            width: 100%;
        }

        .container {
            max-width: 1200px;
            width: 100%;
            margin: 20px;
            padding: 20px;
        }

        .section-title {
            color: #3a5ba0;
            margin-bottom: 10px;
            font-size: 1.5em;
        }

        .about, .cars-to-get, .cars-collected, .cars-x5 {
            background-color: #e1e5ec;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .car-images {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }

        .car-images img {
            width: 150px;
            height: auto;
            max-width: 100%; /* Ensures images scale on smaller screens */
            border-radius: 8px;
        }

        footer {
            text-align: center;
            padding: 10px;
            background-color: #3a5ba0;
            color: white;
            width: 100%;
        }
    </style>
</head>
<body>

    <header>
        <h1>Mi Colección de Hot Wheels</h1>
    </header>

    <div class="container">
        <div class="about">
            <h2 class="section-title">Sobre mí</h2>
            <p>¡Hola! Soy un apasionado de los carros a escala y colecciono Hot Wheels. Esta página está dedicada a mi colección y a los modelos que aún estoy buscando. ¡Bienvenido!</p>
        </div>

        <div class="cars-to-get">
            <h2 class="section-title">Carros a conseguir</h2>
            <ul>
                <li>Hot Wheels - Nissan Skyline GT-R (R34)</li>
                <li>Hot Wheels - Ford Mustang Shelby GT500</li>
                <li>Hot Wheels - Lamborghini Aventador J</li>
                <li>Hot Wheels - Porsche 911 GT3 RS</li>
            </ul>
        </div>

        <div class="cars-collected">
            <h2 class="section-title">Hot Wheels Coleccionados</h2>
            <div class="car-images">
                <!-- Imágenes de carros -->
                <img src="https://i.ebayimg.com/thumbs/images/g/QxwAAOSwjsNmrFNc/s-l1200.jpg" alt="Carro 1">
                <img src="https://http2.mlstatic.com/D_NQ_NP_868982-MCO76227391840_052024-O.webp" alt="Carro 2">
                <img src="https://http2.mlstatic.com/D_NQ_NP_620967-MCO77946314730_082024-O.webp" alt="Carro 3">
                <img src="https://http2.mlstatic.com/D_NQ_NP_778243-MCO76602000305_052024-O.webp" alt="Carro 4">
                <img src="https://http2.mlstatic.com/D_NQ_NP_867020-MCO76834188968_062024-O.webp" alt="Carro 5">
                <img src="https://http2.mlstatic.com/D_NQ_NP_921640-MCO74226573591_012024-O.webp" alt="Carro 6">
                <img src="https://http2.mlstatic.com/D_NQ_NP_784756-MCO75874782978_042024-O.webp" alt="Carro 7">
                <img src="https://i.ebayimg.com/images/g/ui8AAOSwgfllOFtT/s-l1600.jpg" alt="Carro 8">
                <img src="https://m.media-amazon.com/images/I/81UpMOhNNiL.jpg" alt="Carro 9">
                <img src="https://rukminim2.flixcart.com/image/850/1000/xif0q/vehicle-pull-along/g/1/m/hot-wheels-2024-mainline-bugatti-bolide-toptoysindia-18-original-imah2rm8cvxmmw6g.jpeg?q=90&crop=false" alt="Carro 10">
                <!-- Añadir más imágenes según sea necesario -->
            </div>
        </div>

        <div class="cars-x5">
            <h2 class="section-title">Hot Wheels Coleccionados x5</h2>
            <div class="car-images">
                <img src="https://images-cdn.ubuy.co.in/633aae6990375a1f9e23ec51-hot-wheels-batman-5-pack-multipack-of-5.jpg" alt="Carro 39-43">
            </div>
        </div>

        <div class="cars-x5">
            <h2 class="section-title">Matchbox</h2>
            <div class="car-images">
                <img src="https://http2.mlstatic.com/D_NQ_NP_988261-MCO73763157860_012024-O.webp" alt="Matchbox Carro 1">
            </div>
        </div>

    </div>

    <footer>
        <p>&copy; 2024 Mi Colección de Hot Wheels</p>
    </footer>

</body>
</html>

