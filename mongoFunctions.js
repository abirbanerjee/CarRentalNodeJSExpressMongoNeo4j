const mongoURI = 'mongodb://localhost:27017';
const {MongoClient, ObjectId} =require('mongodb');
let bookingSummary=[];
module.exports = {
    lctns: async ()=>{
        const client = new MongoClient(mongoURI);
        await client.connect();
        const db = client.db('car_rental');
        const carsColl = db.collection('cars');
        const locations = await carsColl.distinct('location');
        
        client.close();
        return locations;
    },
    avlbl: async function availableCars(car_id){
    const client = new MongoClient(mongoURI);
    await client.connect();
    filter={'id':car_id};
    const db = client.db('car_rental');
    const carsColl = db.collection('cars');
    const bookingCollection = db.collection('bookings');
    const carDetails = await carsColl.find(filter).toArray();
    client.close();
    return carDetails;       
},
srchCust: async (phoneNo)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    const cust = await custColl.findOne({$or: [{phone:phoneNo},{email:phoneNo}]});
    client.close();
    if(cust == null)
        return 'NEW';
    else
        return cust;
},
newCust: async(userDetails, phoneNo)=>{
    let email='';
    if(userDetails[2]!=null)
        email = userDetails[2];
    const newUser = {first_name:userDetails[0], last_name:userDetails[1], email:email,phone:phoneNo};
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    const reply = await custColl.insertOne(newUser);
    client.close();
    return reply;
},

newBooking: async (carId,custPhone, from, to, pickupCode)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const carsColl = db.collection('cars');
    const car = (await carsColl.findOne({id:carId}))._id;
    const custColl = db.collection('customers');
    const customer = (await custColl.findOne({$or: [{phone:custPhone},{email:custPhone}]}))._id;
    const bookingCollection = db.collection('bookings');
    await bookingCollection.insertOne({cust_id:customer, car_id:car, from:from, to:to, pickup_code:pickupCode});
    await carsColl.updateOne({id:carId},{$set: {status:0}});
    client.close();
    
},

srchBooking: async(phone)=>{
    // let bookigDetails={};
    const projection = {Customer:1, Car:1, from:1, to:1, _id:1, pickup_code:1};
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    const bookingCollection = db.collection('bookings');
    const custId = (await custColl.findOne({$or: [{phone:phone},{email:phone}]}))._id;
    const aggregatedList = await bookingCollection.aggregate([{$match:{cust_id:custId}}, { $lookup: 
        { from: 'customers', localField: 'cust_id', foreignField: '_id', as: 'Customer' } }, 
    { $lookup: { from: 'cars', localField: 'car_id', foreignField: '_id', as: 'Car' } }]).project(projection).toArray();
    client.close();
    return aggregatedList; 
},

updateCustomer : async(fname, lname, email, phone, oldphone)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    console.log(fname,lname, email, phone, oldphone);
    const res = await custColl.updateOne({phone:oldphone},{$set:{first_name:fname, last_name:lname, email:email, phone:phone}});
    client.close();
    console.log(res);
    return res;
},

deleteBooking: async (bookid)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const bookings = db.collection('bookings');
    const cars = db.collection('cars');
    const car_id = (await bookings.findOne({_id:ObjectId(bookid)})).car_id;
    const upStat = await cars.updateOne({_id:car_id},{$set:{status:1}});
    const status = await bookings.deleteOne({_id:ObjectId(bookid)});
    console.log(status);
    console.log(upStat);
    client.close();
},

allBookings: async (query)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const bookings = db.collection('bookings');
    const cars = db.collection('cars');
    const customers = db.collection('customers');
    const allBookings = bookings.find().toArray();
    const allCustomers = customers.find().toArray();
    const allCars = cars.find().toArray();
    
    switch(query){
        case 'cars':
            return allCars;
        case 'bookings':
            return allBookings;
        case 'customers':
            return allCustomers;
    }

    client.close();
}



};