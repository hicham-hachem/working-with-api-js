'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

//////////////////////////////////////////////////////////////////////

const renderCountry = function (data, className = '') {
    // FIX BUG
    const languagesArray = [];
    for (const key in data.languages) {
        languagesArray.push(data.languages[key]);
    }
    const currenciesArray = [];
    for (const key in data.currencies) {
        currenciesArray.push(data.currencies[key]);
    }

    // prettier-ignore
    const html = `
        <article class="country ${className}">
            <img class="country__img" src="${data.flags.png}" />
            <div class="country__data">
                <h3 class="country__name">${data.name.common}</h3>
                <h4 class="country__region">${data.region}</h4>
                <p class="country__row">
                    <span>👫</span>
                    ${(+data.population / 1000000).toFixed(1)}
                </p>
                <p class="country__row">
                    <span>🗣️</span>
                    ${languagesArray[0]}
                </p>
                <p class="country__row">
                    <span>💰</span>
                    ${currenciesArray[0].name}
                </p>
            </div>
        </article>`;

    countriesContainer.insertAdjacentHTML('beforeend', html);
    // countriesContainer.style.opacity = 1;
};

//********************************//

const renderError = function (msg) {
    countriesContainer.insertAdjacentText('beforeend', msg);
    // countriesContainer.style.opacity = 1;
};

//////////////////////////////////////////////////////////////////////

// AJAX calls
// XML http request function
const getCountryAndNeighbour = function (country) {
    // AJAX call country 1
    const request = new XMLHttpRequest();
    request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
    request.send();

    request.addEventListener('load', function () {
        // JSON (string) to javascript object
        // We got an array with one element (one object)
        // const data = JSON.parse(this.responseText)[0];
        const [data] = JSON.parse(this.responseText); // FIX BUG
        console.log(data);

        // Render country 1
        renderCountry(data);

        // Get neighbour country (2)
        const [neighbour] = data.borders;

        if (!neighbour) return;
        // AJAX call country 2
        const request2 = new XMLHttpRequest();
        request2.open(
            'GET',
            `https://restcountries.com/v3.1/alpha/${neighbour}`
        );
        request2.send();

        request2.addEventListener('load', function () {
            const [data2] = JSON.parse(this.responseText);
            console.log(data2);

            // Render country 2
            renderCountry(data2, 'neighbour');
        });
    });
};

// getCountryAndNeighbour('spain');

//////////////////////////////////////////////////////////////////////

// Promises and the fetch API
const getCountryData1 = function (country) {
    fetch(`https://restcountries.com/v3.1/name/${country}`) // A promise
        .then(function (response) {
            console.log(response);
            return response.json(); // To red data from the response
        }) // Asynchronus function will return a new promise
        .then(function (data) {
            console.log(data);
            renderCountry(data[0]);
        });
};

// Simplified version of code
const getCountryData2 = function (country) {
    fetch(`https://restcountries.com/v3.1/name/${country}`)
        .then(response => response.json())
        .then(data => renderCountry(data[0]));
};

//********************************//

const getJSON = function (url, errorMsg = 'Something went wrong') {
    return fetch(url).then(response => {
        if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
        return response.json();
    });
};

// Get country data and neighbour
const getCountryData = function (country) {
    // Country 1
    // fetch(`https://restcountries.com/v3.1/name/${country}`)
    //     .then(response => {
    //         if (!response.ok)
    //             throw new Error(`Country not found (${response.status})`);
    //         return response.json();
    //     })
    getJSON(
        `https://restcountries.com/v3.1/name/${country}`,
        'Country not found'
    )
        .then(data => {
            renderCountry(data[0]);

            const neighbour = data[0].borders; // FIX BUG

            if (!neighbour) throw new Error('No neighbour found!');
            // Country 2
            return getJSON(
                `https://restcountries.com/v3.1/alpha/${neighbour}`,
                'Country not found'
            );
        })
        .then(data => renderCountry(data[0], 'neighbour')) // FIX BUG
        .catch(err => {
            console.error(`${err} 🎆🎆🎆`);
            renderError(`Something went wrong 🎆🎆 ${err.message}. Try again!`);
        }) // When the promise is rejected
        .finally(() => {
            countriesContainer.style.opacity = 1;
        }); // Will be called always
};

// getCountryData('australia');

//////////////////////////////////////////////////////////////////////

btn.addEventListener('click', function () {
    //
});

const whereAmI = function (lat, lng) {
    fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`)
        .then(response => {
            // console.log(response);
            if (!response.ok)
                throw new Error(`Problem with geocoding ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(data);
            console.log(`You are in ${data.city}, ${data.country}`);

            return fetch(`https://restcountries.com/v3.1/name/${data.country}`);
        })
        .then(response => {
            if (!response.ok)
                throw new Error(`Country not found (${response.status})`);
            return response.json();
        })
        .then(data => renderCountry(data[0], 'neighbour'))
        .catch(err => console.error(`${err.message} 🎆`))
        .finally(() => {
            countriesContainer.style.opacity = 1;
        });
};

whereAmI(52.508, 13.381);
// whereAmI(19.037, 72.873);
// whereAmI(-33.933, 18.474);
