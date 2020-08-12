


const apiKey = "c4f7d5eb4fa44500d2319b8cea2d5f68";
const localStorageKey = "SearchedCities";
var weatherCard = $("#weather-card");
const lastCity = "LastCity";
var responseLat = "";
var responseLgn = "";

//UV index scale from the EPA
var uvIndexColorCodes = ["green", "green", "green", "yellow", "yellow", "yellow",
                          "orange", "orange", "red", "red", "red", "indigo"];


$("#search-btn").on("click", function (event) {

    event.preventDefault();
    getForcast($("#search-input").val());

});

$("UL").on("click", function() {
    
    event.preventDefault();
    console.log(event.target);
    getForcast(event.target.textContent);

});

function getForcast(city){

    city.trim();
    let url = "https://api.openweathermap.org/data/2.5/forecast?q=";

    let queryURL = url + city + "&appid=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        console.log(response);
        localStorage.setItem(lastCity, JSON.stringify(response));

        addToHistory(response);
        renderSearchedCities();
        renderWeatherCard(response);
        renderForecastCard(response);

        responseLat = response.city.coord.lat;
        responseLgn = response.city.coord.lon;

        queryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + responseLat + "&lon=" + responseLgn;
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (uvResponse) {

            console.log(uvResponse);
            $("#city-uvIndex").html("UV Index of <span id=\"uv-scale\">" + uvResponse.value + "</span>");
            let uvColor;
            uvResponse.value >= uvIndexColorCodes.length ? uvColorIndex = uvIndexColorCodes.length - 1 : uvColor = Math.floor(uvResponse.value);
            $("#uv-scale").css("background-color", uvIndexColorCodes[uvColor]);
            $("#uv-scale").css("color", "white");
        });

        imgURL = "http://openweathermap.org/img/wn/" + response.list[0].weather[0].icon + "@2x.png";
        $("#weather-card-header").html(response.city.name + ", " + response.city.country + " " +  "<span><img src=" + imgURL + "></span>");
    });
}

function renderLastCity(){

    let lastSearched = JSON.parse(localStorage.getItem(lastCity));
    if(lastSearched == null){
        lastSearched = "San Diego, US";
    }
    else {
        lastSearched = lastSearched.city.name + ", " + lastSearched.city.country
    }

    getForcast(lastSearched);
}

function addToHistory(response){
    
    var history = localStorage.getItem(localStorageKey);

    if(history == null){
        history = [response];
    }
    else{
        history = JSON.parse(history);
        let historyLen = history.length;
        let contains = false;

        for(let i = 0; i < historyLen; i++){
            //Note: Compare lon and lat instead? (cities with same name in US will not store correctly)
            if(history[i].city.name === response.city.name && history[i].city.country === response.city.country){
                contains = true;
                break;
            }
        }

        if(!contains){
            history.push(response);
        }
    }

    localStorage.setItem(localStorageKey, JSON.stringify(history));

    /*history.forEach(function (item) {
        console.log(item.city.name);
    })*/
}

function renderSearchedCities() {
    
    let history = JSON.parse(localStorage.getItem(localStorageKey));
    let list = $("#searched-cities").empty();

    history.forEach(function(item) {
        let li = $("<LI>").addClass("list-group-item");
        li.text(item.city.name + ", " + item.city.country);

        list.append(li);
    })
}

function renderWeatherCard(response) {

    weatherCard.empty();
    weatherCard.append($("<h5>").attr("id", "city-date"));
    weatherCard.append($("<h5>").attr("id", "city-temp"));
    weatherCard.append($("<h5>").attr("id", "city-humidity"));
    weatherCard.append($("<h5>").attr("id", "city-windspeed"));
    weatherCard.append($("<h5>").attr("id", "city-uvIndex"));

    $("#city-date").text("Date: " + moment().format("MMMM Do YYYY"));
    $("#city-temp").text("Temperature : " + Math.round((response.list[0].main.temp * 9 / 5 - 459.67)) + "°F");
    $("#city-humidity").text("Humidity : " + response.list[0].main.humidity + "%");
    $("#city-windspeed").text("Windspeed : " + response.list[0].wind.speed + "mph");
}

function renderForecastCard(response) {

    $("#forecasting-row").empty();
    let len = response.list.length;

    for(let i = 7; i < len; i += 8){    

        let div = $("<DIV>").addClass("col");
        let srcTxt = "http://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png";
        div.attr("id", "day-" + i);
        div.addClass("forecasted");
        div.append($("<h5>").text(moment.unix(response.list[i].dt).format("MMMM Do")));
        div.append($("<img>").attr("src", srcTxt));
        div.append($("<h6>").text("Temp : " + Math.round(response.list[i].main.temp * 9 / 5 - 459.67) + "°F"));
        div.append($("<h6>").text("Humidity: " + response.list[i].main.humidity + "%"));
        div.attr("id", "day-" + i);

        $("#forecasting-row").append(div);
    }
}

renderSearchedCities();
renderLastCity();