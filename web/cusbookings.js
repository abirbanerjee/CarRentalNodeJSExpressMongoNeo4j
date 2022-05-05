const goButton = document.getElementById('submitButton');
        const updateSubmit = document.querySelector('#updateUserDetails');

        const userDetailsDiv = document.querySelector('#userDetails');
        goButton.addEventListener('click', fetchCustomer);
        async function fetchCustomer() {
            goButton.disabled = true;
            const userPhone = document.querySelector('#phone').value;
            const phone = { userPhone };
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
            if (userDetails.userDetails === 'NEW') {
                const newUserMessage = document.createElement('h5');
                newUserMessage.innerHTML = `Phone number is not registerd with us. Please go to the <a href = "http://localhost:3000">homepage</a> to book your first car.`
                userDetailsDiv.append(newUserMessage);
            }
            else {
                const welcomeMessage = document.querySelector('#welcome');
                const backHomeMessage = document.querySelector('#backhome');
                const modifyMessage = document.querySelector('#modify');
                welcomeMessage.innerHTML = 'Welcome Mr. ' + userDetails.userDetails.first_name + ' ' + userDetails.userDetails.last_name;
                custBookings(userPhone);
                modifyMessage.innerHTML = `<a href='#' id='modify'>Click here</a> to change your details.`
                backHomeMessage.innerHTML = `Go to the <a href = "http://localhost:3000">homepage</a>.`
                userDetailsDiv.append(modifyMessage);
                userDetailsDiv.append(backHomeMessage);
                document.getElementById('modify').addEventListener('click', async () => {
                    modifyMessage.style.visibility = 'hidden';
                    backHomeMessage.style.visibility = 'hidden';
                    document.querySelector('#changeDetails').style.visibility = 'visible';
                    const fname = document.querySelector('#fname');
                    const lname = document.querySelector('#lname');
                    const email = document.querySelector('#email');
                    const phone = document.querySelector('#phoneUpd');
                    fname.value = userDetails.userDetails.first_name;
                    lname.value = userDetails.userDetails.last_name;
                    email.value = userDetails.userDetails.email;
                    phone.value = userDetails.userDetails.phone;
                    updateSubmit.addEventListener('click', async() => {
                        let newFname = fname.value;
                        let newLname = lname.value;
                        let newEmail = email.value;
                        let newPhone = phone.value;
                        const updateData = { newFname, newLname, newEmail, newPhone, userPhone };
                        const options = {
                            method: 'POST',
                            headers: {
                                "Content-type": "Application/json"
                            },
                            body: JSON.stringify(updateData)
                        };
                        let respUpd = await fetch('/update', options);
                        let resultUpd = await respUpd.json();
                        console.log(resultUpd);
                        document.querySelector('#phone').value =phone.value;
                        modifyMessage.style.visibility = 'visible';
                        backHomeMessage.style.visibility = 'visible';
                        document.querySelector('#changeDetails').style.visibility = 'hidden';
                        fetchCustomer();
                    })
                    document.getElementById('cancel').addEventListener('click', ()=>{
                        modifyMessage.style.visibility = 'visible';
                        backHomeMessage.style.visibility = 'visible';
                        document.querySelector('#changeDetails').style.visibility = 'hidden';
                    })
                })
            }
        }
        async function custBookings(userPhone) {
            const phone = { userPhone };
            const options = {
                method: 'POST',
                headers: {
                    "Content-type": "Application/json"
                },
                body: JSON.stringify(phone)
            };
            const resp = await fetch('/custbookings', options);
            const bookings = await resp.json();
            // console.log(bookings);
            if (bookings.length != 0) {
                const text = document.querySelector('#yourBooking')
                text.innerText = 'Your bookings:';
            }
            bookings.forEach(booking => {
                const detailsDiv = document.createElement('div');
                const details = document.createElement('span');
                details.innerText = `Booked on: ${booking.timestamp} Car: ${booking.Car[0].color} ${booking.Car[0].car_make} ${booking.Car[0].car_model}`
                const delButton = document.createElement('button');
                delButton.innerHTML = "Delete";
                delButton.setAttribute('bookid', `${booking._id}`)
                delButton.addEventListener('click', async (e) => {
                    e.target.innerHTML = 'Deleted';
                    e.target.disabled = true;

                    const bookid = e.target.getAttribute('bookid');
                    const data = { bookid };
                    const options = {
                        method: 'POST',
                        headers: {
                            "Content-type": "Application/json"
                        },
                        body: JSON.stringify(data)
                    };
                    await fetch('/delbooking', options);
                })
                const viewButton = document.createElement('button');
                viewButton.innerHTML = 'View';
                viewButton.setAttribute('bookid', `${booking._id}`);
                viewButton.addEventListener('click',async ()=>{
                    let detailsWindow = window.open('','detailsWindow', 'width=800, height=650 resizable=0');
                    detailsWindow.document.write(`<head><link rel="stylesheet" href="styles.css"/></head>`);
                    detailsWindow.document.write(`<h4>Booked car licence plate is: ${booking.Car[0].licence_plate}. Your pickup code is:${booking.pickup_code}.<br> Your car pickup location:</h4>`);
                    detailsWindow.document.write(`<iframe width="500" height="350" style="border:0" loading="lazy" allowfullscreen 
        src="https://www.google.com/maps/embed/v1/search?q=${booking.lat}%2C${booking.lon}&key=AIzaSyDDW_15VmvhkfdDWLYrPGvjvOJ9B8VIjeg">
        </iframe>`);
                })
                detailsDiv.append(details);
                detailsDiv.append(delButton);
                detailsDiv.append(viewButton);
                document.getElementById('bookings').append(detailsDiv);
            })
        }