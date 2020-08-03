


var apiKey = "c4f7d5eb4fa44500d2319b8cea2d5f68";


$("#search-btn").on("click", function (event) {

    event.preventDefault();

    let url = "https://api.openweathermap.org/data/2.5/weather?q=";
    let city = $("#search-input").val();
    console.log(city);
    let queryURL = url + city + "&appid=" + apiKey;
    let lat = "";
    let lon = "";

    let firstCall = $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        console.log(response);
        $("#city-date").text(city + response.weather.icon);
        $("#city-temp").text("Temperature : " + (response.main.temp * 9 / 5 - 459.67).toFixed(2) + "°F");
        $("#city-humidity").text("Humidity : " + response.main.humidity + "%");
        $("#city-windspeed").text("Windspeed : " + response.wind.speed + "mph");

        lat = response.coord.lat;
        lon = response.coord.lon;

        queryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon + "&cnt=5";
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (uvResponse) {

            console.log(uvResponse);
            $("#city-uvIndex").text("UV Index : " + uvResponse[0].value);
        });
    });
});