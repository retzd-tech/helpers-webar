
window.onload = () => {
    let method = 'dynamic';

    // if you want to statically add places, de-comment following line
    // method = 'static';

    if (method === 'static') {
        // setTimeout is a temporary fix
        setTimeout(() => {
            let places = staticLoadPlaces();
            renderPlaces(places);
        }, 3000);
    }

    if (method !== 'static') {

        // first get current user location
        return navigator.geolocation.getCurrentPosition(function (position) {

            // than use it to load from remote APIs some places nearby
            dynamicLoadPlaces(position.coords)
                .then((places) => {
                    renderPlaces(places);
                })
        },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }
};

function staticLoadPlaces() {
    return [
        {
            name: "Your place name",
            location: {
                lat: 0, // add here latitude if using static data
                lng: 0, // add here longitude if using static data
            }
        },
        {
            name: 'Another place name',
            location: {
                lat: 0,
                lng: 0,
            }
        }
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'KBHHVDDGIUEUHZIETDT41BMALEBRL4DS1OARGHM2LX1JPWCI',
        clientSecret: 'XUTGY0XKVKJNHL41N5MRI0H5TVSKIDTQ0E1CVCPFTNOTUY31',
        version: '20191025',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = '';
    let corsProxyheroku = 'https://cors-anywhere.herokuapp.com/';

  // https://api.foursquare.com/v2/venues/search?ll=40.7484,-73.9857&client_id=KBHHVDDGIUEUHZIETDT41BMALEBRL4DS1OARGHM2LX1JPWCI&client_secret=XUTGY0XKVKJNHL41N5MRI0H5TVSKIDTQ0E1CVCPFTNOTUY31&v=20191025

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        console.log(place);
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // add place name
        let text = document.createElement('a-link');
        text.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        text.setAttribute('title', place.name);
        text.setAttribute('href', 'http://www.example.com/');
        text.setAttribute('scale', '20 20 20');

        text.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });

        scene.appendChild(text);
    });
}
