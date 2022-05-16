# Car Rental system using MongoDB and Neo4j.
### This is a simple car rental system built with node.js using MongoDB and Neo4j as the databases. It uses Neo4j's geoloaction function to calculate the distance between two nodes to calculate the distance between the cars and the user and shows the nearby cars.

# Installation
- Install MongoDB compass
- Install Neo4j Desktop (Or use Neo4j web)
- Use the following command in cypher to import car locations into Neo4j 
```
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/abirbanerjee/Misc/main/car_neo4j.csv" AS ROW
CREATE (C:Car {car_id:ROW.car_id, lat:ROW.lat, lon:ROW.long})
```
- Create a new database in MongoDB called car_rental
- Import [cars](https://github.com/abirbanerjee/Misc/blob/main/cars.json) and [customers](https://github.com/abirbanerjee/Misc/blob/main/customers.json) collection into the database.
- Copy or download this repository and do 
```
npm install
npm run test
```

- Open your browser and go to (localhost:3000)


# Screenshots
![Home Screen](https://i.ibb.co/ZV1D8sJ/Picture2.png) ![Cars around the user](https://i.ibb.co/TwddPSH/Picture3.png) ![Description](https://i.ibb.co/GRfmFdV/Picture4.png) ![Booking](https://i.ibb.co/CWp6JQw/Picture5.png) ![Bookng 2](https://i.ibb.co/kyknCg5/Picture6.png) ![Booking final](https://i.ibb.co/rpyHDCZ/Picture7.png) ![Retrieval screen](https://i.ibb.co/d5P4ZFN/Picture8.png)
