# Oráculo de la Paciencia (Oracle of Patience)


"Oráculo de la Paciencia" es una adaptación digital del clásico juego de solitario, donde tu paciencia y estrategia son clave para resolver el desafío. Inspirado en el misticismo del oráculo, el juego te invita a formular una pregunta al inicio. La resolución exitosa del solitario se interpreta como un "SÍ" del oráculo a tu pregunta, mientras que no poder resolverlo, significa un "NO".

El objetivo del juego es organizar las 52 cartas de la baraja en 13 montones (uno por cada número del 1 al 13), cada montón conteniendo las 4 cartas de su respectivo valor numérico (por ejemplo, el montón '1' debe contener los cuatro Ases, el montón '2' los cuatro doses, y así sucesivamente hasta el '13').

## Características

* **Juego de Solitario con un Toque Místico:** Combina la estrategia del solitario con una narrativa de oráculo única.
* **Modal de Introducción:** Ingresa tu pregunta al oráculo antes de cada partida.
* **Modales de Victoria y Derrota:** Recibe la "respuesta" del oráculo al final de cada juego.

## Cómo Jugar

1.  **Inicia el Juego:** Al cargar el juego, se te pedirá que ingreses una pregunta al oráculo en el modal de introducción. Escribe tu pregunta y haz clic en "Comenzar Juego".
2.  **Barajar:** Haz clic en el botón "Barajar" para mezclar las cartas.
3.  **Repartir:** Haz clic en el botón "Repartir" para distribuir las cartas en los 13 montones. El temporizador y el contador de movimientos comenzarán.
4.  **Mover Cartas:**
    * El objetivo es mover cada carta a su "montón base" correspondiente. Por ejemplo, todos los Ases (valor 1) deben ir al montón 1, todos los Dos al montón 2, y así sucesivamente hasta el valor 13 monto 13.
    * Solo puedes mover la carta superior de cada montón.
    * Haz clic en la carta que deseas mover. El juego la moverá automáticamente a su montón base si hay espacio disponible.
   
5.  **Condiciones de Victoria:**
    * Ganas el juego cuando los 13 montones numerados (del 1 al 13) contienen cada uno las 4 cartas de su valor numérico respectivo.
    * Al ganar, el oráculo te dará un "SÍ" como respuesta a tu pregunta.
6.  **Condiciones de Derrota:**
    * Pierdes el juego si te quedas sin movimientos posibles.
    * También puedes perder si realizas demasiados movimientos consecutivos a un montón "correcto" (donde el valor de la carta coincide con el ID del montón) y este montón no se completa.
    * Al perder, el oráculo te dará un "NO" como respuesta a tu pregunta.
7.  **Botones Adicionales:**
    * **Reiniciar:** Restablece el juego a su estado inicial para comenzar una nueva partida.
 

## Desarrollo

Este juego está construido con:

* **HTML5:** Estructura del juego.
* **CSS3 (Tailwind CSS):** Estilos y diseño responsivo.
* **JavaScript:** Lógica del juego y animaciones.

## Instalación y Ejecución Local

Para ejecutar el juego localmente, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/oraculo-de-la-paciencia.git](https://github.com/tu-usuario/oraculo-de-la-paciencia.git)
    ```
2.  **Navega al directorio del proyecto:**
    ```bash
    cd oraculo-de-la-paciencia
    ```
3.  **Abre `index.html`:** Simplemente abre el archivo `index.html` en tu navegador web preferido.

