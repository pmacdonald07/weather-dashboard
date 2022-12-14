// establish global variables
var searchButtonEl = $("#search-btn");
var errorModalEl = $("#error-modal");
var catchModalEl = $("#catch-modal");
var apiKey = "a0aca8a89948154a4182dcecc780b513";
let currentCity = "";
var weatherContainerEl = $("#weather-container");
var forecastCounter = 1;
var cityArray = [];


var formSubmitHandler = function (event) {
    event.preventDefault();

    var city = $("#search-city").val().trim();
    if (city) {
        currentCity = city.toUpperCase();
        $("#search-city").val("");
        getCity(city);
        searchButtons (city);
        saveCities(currentCity);
    } else {
       errorModalEl.modal("show");
    }
}

var getCity = function (search) {
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + search + "&limit=1&appid=" + apiKey;
    fetch(apiUrl)
        .then(function(response){
            if (response.ok) {
                response.json().then(function(data) {
                    var cityLat = data[0].lat;
                    var cityLon = data[0].lon;
                    getWeather(cityLat, cityLon);
                })
            }
        })
        .catch(function(error) {
            catchModalEl.modal("show");
        })
}

var getWeather = function (lat, lon) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&units=imperial&appid=" + apiKey;
    fetch(apiUrl)
        .then(function(response){
            if (response.ok) {
                response.json().then(function(data) {
                    displayCurrentWeather(data);
                })
            }
        })
        .catch(function(error) {
            catchModalEl.modal("show");
        })
}

var displayCurrentWeather = function (response) {
    $("#weather-container").text("");
    // create current weather container
    currentWeatherEl = $("<div></div>");
    currentWeatherEl.addClass("col-12 border border-dark p-3");
    currentWeatherEl.attr("id", "current-weather-display");

    //create icon span and image
    currentIconSpanEl = $("<span></span>");
    currentIconImgEl = $("<img></img");
    currentIconImgEl.attr("class", "icon-img-lg");
    currentIconImgEl.attr("src", "https://openweathermap.org/img/wn/" + response.current.weather[0].icon + "@2x.png");
    currentIconSpanEl.append(currentIconImgEl);
    
    // create current weather h2
    currentCityH2 = $("<h2></h2");
    currentCityH2.text(currentCity + " (" + moment().format("L") + ")");
    currentCityH2.append(currentIconSpanEl);
    currentWeatherEl.append(currentCityH2);

    // create <p> elements for current weather info
    currentTempEl = $("<p></p>");
    currentTempEl.html(
        "Temp: " + response.current.temp+ "&#8457" + "<br>" + "<br>" +  
        "Wind: " + response.current.wind_speed + " MPH" + "<br>" + "<br>" + 
        "Humidity: " + response.current.humidity + "%" + "<br>" + "<br>" +
        "UV Index: " + "<span class='uv-index py-1 px-2 rounded' id='current-uvi'>" + response.current.uvi + "</span>");

    currentCityH2.append(currentTempEl);

    // append to weather container
    weatherContainerEl.append(currentWeatherEl);
    checkUVI(response.current.uvi);
    displayFutureWeather(response);
}

var displayFutureWeather = function (response) {
    // add h3 for 5-day forecast
    forecastCounter = 1;
    forecastH3 = $("<h3></h3");
    forecastH3.attr("class", "my-2");
    forecastH3.text("5-Day Forecast:");
    weatherContainerEl.append(forecastH3);

    // create row for forecast cards
    futureWeatherEl = $("<div></div");
    futureWeatherEl.attr("class", "row justify-content-around");
    futureWeatherEl.attr("id", "future-weather-display");
    weatherContainerEl.append(futureWeatherEl);

    // for loop to create cards
    for (i = 0; i < 5; i++) {
        forecastCard = $("<div></div");
        forecastCard.attr("class", "card col-5 col-md-2 text-light bg-primary mb-3");

        //set card body
        cardBody = $("<div></div");
        cardBody.attr("class", "card-body")
        forecastCard.append(cardBody);

        // set card title
        cardTitle = $("<h4></h4>");
        cardTitle.attr("class", "card-title");
        cardTitle.text(moment().add(forecastCounter, 'd').format("L"));
        forecastCounter++;
        cardBody.append(cardTitle);

        // set weather icon
        futureIconSpanEl = $("<span></span>");
        futureIconImgEl = $("<img></img");
        futureIconImgEl.attr("class", "icon-img-sm card-text");
        futureIconImgEl.attr("src", "https://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + "@2x.png");
        futureIconSpanEl.append(futureIconImgEl);
        cardBody.append(futureIconSpanEl);

        // set card text
        cardText = $("<p></p>");
        cardText.attr("class", "card-text");
        cardText.html(
        "Temp: " + response.daily[i].temp.day+ "&#8457" + "<br>" + "<br>" +  
        "Wind: " + response.daily[i].wind_speed + " MPH" + "<br>" + "<br>" + 
        "Humidity: " + response.daily[i].humidity + "%" + "<br>"
        )
        cardBody.append(cardText);
        
       // append cards
       futureWeatherEl.append(forecastCard);

    }
}

// check the current uvi and change color depending on the severity
var checkUVI = function (uvi) {
    if (uvi < 3) {
        $("#current-uvi").addClass("bg-success text-light");
    } else if (uvi >= 3 && uvi < 6) {
        $("#current-uvi").addClass("bg-warning text-light");
    } else if (uvi >= 6) {
        $("#current-uvi").addClass("bg-danger text-light");
    };
}

// generate a search button upon each search for ease of use
var searchButtons = function (city) {
    cityButton = $("<button></button>");
    cityButton.text(city.toUpperCase());
    cityButton.attr("class", "btn btn-primary p-2 col-12 mb-3");
    cityButton.attr("type", "button");
    cityButton.attr("data-city", city);

    $("#city-buttons").append(cityButton);
}

var buttonClickHandler = function (event) {
    $("#weather-container").text("");
    var target = $(event.target);
    var city = target.attr("data-city");
    if (city) {
        currentCity = city.toUpperCase();
        getCity(city);
    }
}

// save searches to local storage and checks to see it that city is already in the array to avoid duplication
var saveCities = function (city) {
    if (cityArray.includes(city)) {
        return;
    } else {
        cityArray.push(city);
        localStorage.setItem("Cities", JSON.stringify(cityArray));
    }
}

// load cities from local storage
var loadCities = function () {
    var localCities = localStorage.getItem("Cities");
    localCities = JSON.parse(localCities);
    cityArray = localCities;

    if (cityArray === null) {
        cityArray = [];
    }

    for (i = 0; i < cityArray.length; i++) {
        searchButtons (cityArray[i]);
    }
}

$("#search-form").on("submit", formSubmitHandler);
$("#city-buttons").on("click", buttonClickHandler);

loadCities();