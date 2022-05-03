let resp,userPhone,carID, carLat, carLon;
let lat, lon;
let marker=[];
// let carMakeSelect = document.getElementById('make');
// let carColorSelect = document.getElementById('color');
// let carYearSelect = document.getElementById('year');

document.querySelector('#submitButton').addEventListener('click',fetchCustomer);

//setup leaflet
let map = L.map('map').setView([0, 0], 2);
const attribution = '&copy; <a href = "https://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors';
const tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(map);
userLoc();


//clear map before placing new markers
function delMarkers(){
    map.eachLayer(function(layer) {
        if(layer._latlng!=null && layer.options.name!='home')
         map.removeLayer(layer);
});
}

// function clearOptions(){
//         carMakeSelect.innerText = '';
// }

//Get nearby cars from neo4j and place it on map.
async function responseProcess(lat,lon) {
    const latlon = {};
    latlon.lat =lat;
    latlon.lon=lon;
    const options =  {
        method: 'POST',
        headers: {
            "Content-type": "Application/json"
        },
     
        body: JSON.stringify(latlon)
    }
    const rawData = await fetch('/nodes',options);
    resp = await rawData.json();
    const totCars = await resp.records;
    console.log(totCars);
    totCars.forEach(async (element, index) => {
        const cd = await carDet(index);
        // const makeOption = document.createElement('option');
        // makeOption.text = cd.carDetails[0].car_make;
        // carMakeSelect.append(makeOption);
        // const colorOption = document.createElement('option');
        // colorOption.text = cd.carDetails[0].color;
        // carColorSelect.append(colorOption);
        // const yearOption = document.createElement('option');
        // yearOption.text = cd.carDetails[0].year;
        // carYearSelect.append(yearOption);
        lon = parseFloat(element._fields[0].x);
        lat = parseFloat(element._fields[0].y);  
        if(cd.carDetails[0].status!=0){         
         marker = new L.Marker([lat, lon], {
            _icon_id: index
        });
        marker.addTo(map);
        // marker.bindPopup(`car id ${marker.options._icon_id}`); //do not delete ---- understand marker options.
        marker.bindPopup
        (`${cd.carDetails[0].color} ${cd.carDetails[0].car_make} ${cd.carDetails[0].car_model}<br> 
        Rent/day:€${cd.carDetails[0].price}<br>Distance: ${parseFloat(element._fields[1].toFixed(2))} KMs<br><img src=${cd.carDetails[0].photo}/>`)
        marker.on('click', (e) => console.log(e.target));
        marker.on('dblclick', async (e) => {
            //Proceed with booking
            carLat = e.target._latlng.lat;
            carLon = e.target._latlng.lng;
            carID = e.target.options._icon_id;
            console.log(`You double clicked on ${e.target.options._icon_id}`);
            const mapDiv = document.querySelector('#map');
            mapDiv.style.visibility = 'hidden';
            const inputDiv = document.querySelector('#userDetails');
            inputDiv.style.visibility = 'visible';
        });
    }
    });
}
async function carDet(id) {
    const data = { id };
    const options = {
        method: 'POST',
        headers: {
            "Content-type": "Application/json"
        },
        body: JSON.stringify(data)
    };
    const cardDetails = await fetch('/cardetails', options);
    const jsonCars = await cardDetails.json();
    return jsonCars;
}

//Get the user's location from browser
function userLoc() {
    var myIcon = L.icon({
        iconUrl: 'home_icon.png',
        iconSize: [38, 45]
    });
    const position = navigator.geolocation.getCurrentPosition((position) => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        map.flyTo([lat,lon],7, 'zoom');
        L.marker([lat, lon], { name:'home', icon: myIcon, draggable:true }).on('dragend',async (e)=>{
        delMarkers();
        //clearOptions();
        responseProcess(e.target._latlng.lat, e.target._latlng.lng);
    }).on('click', (e)=>console.log(e)).addTo(map).bindPopup('Your location');
        responseProcess(lat,lon);
    });
}





async function fetchCustomer(){
    userPhone = document.querySelector('#phone').value;
    const phone={userPhone};
    const options = {
        method: 'POST',
        headers: {
            "Content-type": "Application/json"
        },
        body: JSON.stringify(phone)
    }
    const response = await fetch('/fetchuser', options);
    const userDetails = await response.json();
    console.log(userDetails.userDetails);
    if(userDetails.userDetails==='NEW')
        {
            console.log('You are a new user');
            document.querySelector('#newcustomer').style.visibility='visible';
            document.querySelector('#newUserSub').addEventListener('click', async ()=>{
                document.querySelector('#newUserSub').disabled = true;
                console.log('New user');
                const fname = document.querySelector('#fname').value;
                const lname = document.querySelector('#lname').value;
                const phone = userPhone;
                const email = document.querySelector('#email').value;
                console.log(email);
                const userData = {fname,lname,email,phone};
                const options = {
                    method: 'POST',
                    headers: {
                        "Content-type": "Application/json"
                    },
                    body: JSON.stringify(userData)
                }

                const resp = await fetch('/newuser',options);
                console.log(resp.ok);
                if(resp.ok)
                fetchCustomer();
                document.querySelector('#newcustomer').style.visibility='collapse';
            })
        }
    else
    {
    custBookings(userPhone);
    const welcomeMessage = document.querySelector('#welcome');
    welcomeMessage.innerHTML = 'Welcome Mr. ' + userDetails.userDetails.first_name +' '+userDetails.userDetails.last_name;
    const selectedCar = document.querySelector('#selectedCar');
    const carDets = await carDet(carID);
    selectedCar.innerHTML = `You selected the ${carDets.carDetails[0].color} ${carDets.carDetails[0].car_make} ${carDets.carDetails[0].car_model} (${carDets.carDetails[0].year}) 
    for €${carDets.carDetails[0].price}/day`;
    document.querySelector('#to').addEventListener('change', ()=>{
        bookedDays(carDets.carDetails[0].price);
    })
    
    document.querySelector('#dates').style.visibility='visible';
    document.querySelector('#submitBooking').addEventListener('click',async ()=>{
        document.querySelector('#submitBooking').disabled = true;
        const from = document.querySelector('#from').value;
        const to = document.querySelector('#to').value;
        const bookingData={carID,userPhone, from, to};
        const options = {
            method: 'POST',
            headers: {
                "Content-type": "Application/json"
            },
            body: JSON.stringify(bookingData)
        };

        const resp = await fetch('/newbooking', options);
        console.log(resp);

        const bookedCar = document.createElement('div');
        const text = document.createElement('h4');
        text.innerText = "Your car location:";
        bookedCar.innerHTML = 
        `<iframe width="600" height="450" style="border:0" loading="lazy" allowfullscreen 
        src="https://www.google.com/maps/embed/v1/search?q=${carLat}%2C${carLon}&key=AIzaSyDDW_15VmvhkfdDWLYrPGvjvOJ9B8VIjeg">
        </iframe>`
        document.querySelector('#userDetails').append(text);
        document.querySelector('#userDetails').append(bookedCar);
        await custBookings(userPhone);
    })

    }
}

async function custBookings(userPhone){
    const phone = {userPhone};
    const options = {
        method: 'POST',
        headers: {
            "Content-type": "Application/json"
        },
        body: JSON.stringify(phone)
    };
    const resp = await fetch('/custbookings',options);
    const bookings = await resp.json();
    // console.log(bookings);
    if(bookings.length!=0)
    {
        document.getElementById('prevBookings').style.visibility = 'visible';
        
    }
    bookings.forEach(booking=>{
        const detailsDiv = document.createElement('div');
        const details = document.createElement('span');
        details.innerText = `Booked on: ${booking.timestamp} Car: ${booking.Car[0].color} ${booking.Car[0].car_make} ${booking.Car[0].car_model}`
        const delButton = document.createElement('button');
        delButton.innerHTML = "Delete";
        delButton.setAttribute('bookid', `${booking._id}`)
        delButton.addEventListener('click', async(e)=>{
            e.target.innerHTML = 'Deleted';
            e.target.disabled = true;

           const bookid = e.target.getAttribute('bookid');
           const data = {bookid};
           const options = {
            method: 'POST',
            headers: {
                "Content-type": "Application/json"
            },
            body: JSON.stringify(data)
        };
        await fetch('/delbooking', options);
    })
        detailsDiv.append(details);
        detailsDiv.append(delButton);
        document.getElementById('prevBookings').append(detailsDiv);
    })
}

function bookedDays(pricePerDay){
    let from = document.querySelector('#from').value;
    let to = document.querySelector('#to').value;
    let d1 = new Date(from);
    let d2 = new Date(to);

    let noOfDays = (d2-d1)/(24*3600*1000);
    if(noOfDays ===0)
     noOfDays = 1;
    const totalPrice = noOfDays*pricePerDay;
    console.log(totalPrice);
    document.getElementById('proceedBooking').style.visibility = 'visible';
    document.getElementById('totalPrice').innerText = `Total price to be paid: €${totalPrice}`;

}