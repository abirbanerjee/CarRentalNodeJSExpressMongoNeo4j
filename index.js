const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
const MongoFunctions = require('./mongoFunctions');
app.use(express.static('web'));

const neo4j = require('neo4j-driver');
const uri = 'bolt://localhost:7687';
const user='neo4j';
const password = 'admin';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

let resultJson;

// session.run('MATCH (P) RETURN(P)').then(result=>resultJson=result).then(driver.close());
app.post('/nodes',async (req,res)=>{
    
    const lat = (req.body.lat).toFixed(3);
    const lon = (req.body.lon).toFixed(3);
    console.log(lat,lon);
    const session = driver.session();
    const ses = await session.run(`MATCH (p:Car)
    WITH point({longitude:toFloat(p.lon), latitude:toFloat(p.lat)}) as p1, point({longitude:toFloat(${lon}),latitude:toFloat(${lat})}) as p2
    WITH p1,p2,point.distance(p1,p2)/1000 as d
    WHERE d<50
    return p1,d`);
    res.send(ses);
    await session.close();
})

app.post('/cardetails',async (req,res)=>{
    const car_id = req.body.id;
    const carDetails = await MongoFunctions.avlbl(car_id);
    let data ={};
    data.carDetails = carDetails;
    res.send(data);
})

app.post('/fetchuser', async(req,res)=>{
    const phone = req.body.userPhone;
    const userDetails = await MongoFunctions.srchCust(phone);
    let data = {};
    data.userDetails = userDetails;
    res.send(data);
})

app.post('/newuser', async(req,res)=>{
    const fname = req.body.fname;
    const lname = req.body.lname;
    const phone = req.body.phone;
    const email = req.body.email;
    const status = await MongoFunctions.newCust([fname, lname, email], phone);
    res.send(status);
})

app.post('/newbooking', async(req,res)=>{
    const phone = req.body.userPhone;
    const car_id = req.body.carID;
    const from = req.body.from;
    const to = req.body.to;
    const pickupCode = req.body.carPickupCode;
    const status = await MongoFunctions.newBooking(car_id,phone,from,to, pickupCode);
    res.send(status);
})

app.post('/custbookings', async(req,res)=>{
    const phone = req.body.userPhone;
    let resBooking =[];
    let bookings = await MongoFunctions.srchBooking(phone);
    for(let i=0;i<bookings.length;i++){
        const stamp =(bookings[i]._id).getTimestamp();
        bookings[i].timestamp = stamp;
        const session = driver.session();
        const ses = await session.run(`MATCH (p:Car{car_id:'${bookings[0].Car[0].id}'}) RETURN p`);
        bookings[i].lat= await ses.records[0]._fields[0].properties.lat;
        bookings[i].lon=await ses.records[0]._fields[0].properties.lon;
    }
    res.send(bookings);


})

app.post('/delbooking', async (req,res)=>{
    const bookid = req.body.bookid;
    await MongoFunctions.deleteBooking(bookid);
})


app.get('/admin', (req,res)=>{
    
    res.sendFile('admin.html', {root : path.join(__dirname, 'web')});
})

app.get('/allcars',async (req,res)=>{
    const carDetails = await MongoFunctions.allBookings('cars');
    console.log(carDetails[0]);
    


for(let i=0;i<carDetails.length;i++){
    const car_id = carDetails[i].id;
    const session = driver.session();
    const ses = await session.run(`MATCH (p:Car{car_id:'${car_id}'}) RETURN p`);
    delete carDetails[i]._id;
    delete carDetails[i].photo;
    carDetails[i].lon = ses.records[0]._fields[0].properties.lon;
    carDetails[i].lat = ses.records[0]._fields[0].properties.lat;
    await session.close();
}

        res.send(carDetails);
})

app.post('/update',async (req,res)=>{
    console.log(req.body);
    const result = await MongoFunctions.updateCustomer(req.body.newFname, req.body.newLname, req.body.newEmail, req.body.newPhone, req.body.userPhone);
    console.log(result);
    res.send(result);
    
})


app.listen(3000);