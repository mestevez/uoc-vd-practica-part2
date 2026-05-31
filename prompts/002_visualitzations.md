El següent prompt està pensat per a ser executat per un agent de IA capaç de generar un projecte de programació a partir d'una descripció textual. L'agent ha de seguir les instruccions detallades a continuació per crear un projecte estructurat i ben organitzat.

Les visualitzacions que conté el projecte fins ara són exemples per validar la instal·lació, no s'han de tenir en compte i es poden eliminar. 

El projecte constará d'una única pàgina d'inici (`Home`) que mostrarà les visualitzacions de dades. 

El Layout de la pàgina constarà d'un zona superior amb les estadístiques generals de les dades que es mostren a les visualitzacions (nombre total de restaurants, puntuació mitjana, preu mitjà i nombre de zones diferents).

A la part central es mostrarà la visualització de dades.

A l'esquerra hi haurà un menú lateral amb les diferents visualitzacions disponibles. Aquest menú permetrà navegar entre les diferents visualitzacions i mostrar-les a la part central de la pàgina.

A la part dreta hi haurà un panell de filtres que permetrà filtrar les dades que es mostren a les visualitzacions. Els filtres disponibles poden dependre de la visualització.

# Visualitzacions

## Mapa
Un mapa de Barcelona amb els restaurants representats com a punts. El color dels punts indicarà el preu mitjà i la mida indicarà la puntuació.
El mapa ha de permetre fer zoom i pan per explorar les diferents zones de la ciutat.
Quan es faci clic en un punt, es mostrarà una finestra emergent amb informació detallada del restaurant.
Els filtres disponibles per aquesta visualització seran:
- Zona (select amb possibilitat de seleccionar múltiples opcions i buscar per text)
- Menjar (select amb possibilitat de seleccionar múltiples opcions i buscar per text)

## Exploració
Mostra un gràfic de barres
- ha de permetre seleccionar la variable a mostrar a l'eix X i la variable a mostrar a l'eix Y.
  - A l'eix X es podrà seleccionar entre: zona, tipus de menjar i ambient.
  - A l'eix Y es podrà seleccionar entre: preu mitjà, puntuació i nombre d'opinions.
- ha de permetre filtrar les dades per_ zona, tipus de menjar, ambient i preu (slide).

## Anàlisi
Utilitza un gràfic de dispersió (scatter plot) per veure correlacions entre variables.
- ha de permetre seleccionar les variables a mostrar a l'eix X i a l'eix Y.
    - A l'eix X es podrà seleccionar entre: preu mitjà, puntuació, nombre d'opinions, distància al centre i renda mitjana bruta.
    - A l'eix Y es podrà seleccionar entre: preu mitjà, puntuació, nombre d'opinions, distància al centre i renda mitjana bruta.
- ha de permetre filtrar les dades per zona i tipus de menjar.