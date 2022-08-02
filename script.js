document.querySelector("#btnSearch").addEventListener("click", () => {
    let text = document.getElementById("txtSearch").value;
    document.getElementById("details").style.opacity = 0;
    document.getElementById("loading").style.display = "block";
    getCountry(text);
});

document.querySelector("#btnLocation").addEventListener("click", () => {
    if(navigator.geolocation){
        document.getElementById("loading").style.display = "block";
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
});

const onError = (err) => {
    console.log(err);
    document.getElementById("loading").style.display = "none";
}

const onSuccess = async (position) => {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;

    // google, opencagedata: Bu API'leri göndereceğin lokasyon bilgilerine göre adres bilgilerini çekmek için kullanabilirsin.

    const api_key = "a50657074dbf47da90f6251a6af63b38";
    const url= `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${api_key}`;

    const response = await fetch(url);
    const data = await response.json();
    const country = data.results[0].components.country;

    document.querySelector("#txtSearch").value = country;
    document.querySelector("#btnSearch").click();
}

async function getCountry(country) {
    try{
        const response = await fetch('https://restcountries.com/v3.1/name/' + country);
        if (!response.ok)
            throw new Error('Country can not be found!');
        const data = await response.json();
        renderCountry(data[0]);

        const countries = data[0].borders;
        if (!countries)
            throw new Error('Neighbor country can not be found!');
        const response2 = await fetch('https://restcountries.com/v3.1/alpha?codes=' + countries.toString());
        const neighbors= await response2.json();
        renderNeighbors(neighbors);
    }
    catch(err){
        console.log(err.message);
        renderErr(err);
    }
}

function renderCountry(data) {
    document.getElementById("loading").style.display = "none";
    document.querySelector("#country-details").innerHTML = "";
    document.querySelector("#neighbors").innerHTML = "";            

    let html = `
        <div class="col-4">
            <img src="${data.flags.png}" alt="" class="img-fluid">
        </div>
        <div class="col-8">
            <h3 class="card-title">${data.name.common}</h3>
            <hr>
            <div class="row">
                <div class="col-4">Population:</div>
                <div class="col-8">${(data.population / 1000000).toFixed(1)} million</div>
            </div>
            <div class="row">
                <div class="col-4">Language:</div>
                <div class="col-8">${Object.values(data.languages)}</div>
            </div>
            <div class="row">
                <div class="col-4">Capital:</div>
                <div class="col-8">${data.capital[0]}</div>
            </div>
            <div class="row">
                <div class="col-4">Curency Unit:</div>
                <div class="col-8">${Object.values(data.currencies)[0].name} (${Object.values(data.currencies)[0].symbol})</div>
            </div>
        </div>
    `;

    document.getElementById("details").style.opacity = 1;
    document.querySelector("#country-details").innerHTML = html;
    
}

function renderNeighbors(data) {
    let html = "";
    for (let country of data){
        html += `
            <div class="col-2 mt-2">
                <div class="card">
                    <img src="${country.flags.png}" class="card-img-top">
                    <div class="card-body">
                        <h6 class="card-title">${country.name.common}</h6>
                    </div>
                </div>
            </div>
        `;

        document.querySelector("#neighbors").innerHTML = html;
    }
}

function renderErr(err){
    document.getElementById("loading").style.display = "none";
    const html = `
        <div class="alert alert-danger">
            ${err.message}
        </div>
    `;

    setTimeout(() => {
        document.querySelector("#errors").innerHTML = "";
    }, 3000);
    document.querySelector("#errors").innerHTML = html;
}