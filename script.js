$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    
    searchWeather(searchValue);
    // clear input box
    $("#search-value").val("");
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  } 
  
  function searchWeather(searchValue) {
  var queryURL ="http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&APPID=c456d5f36c7b59b5166a6b0dd2cff66b";
    $.ajax({
      type: "GET",
      url:  queryURL,
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
         
          makeRow(searchValue);
          
        };
        // clear any old content
        $("#today").empty();

        // Adding variable to temp
        var time = $("<p>").text(moment().format('l'));
        
        var tempF = (data.main.temp - 273.15) * 1.80 + 32;
        var temp = $("<p>").text("Temperature: " + tempF.toFixed(1) + "℉");

        var city = $("<h1>").text(data.name + (moment().format('l')));
        var humid = $("<p>").text("Humidity: " + data.main.humidity + "%");
        var wind = $("<p>").text("Wind Speed: " + data.wind.speed + " MPH");
        
        // merge and add to page
        $("#today").append(city, temp, humid, wind);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&APPID=c456d5f36c7b59b5166a6b0dd2cff66b",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            $(".timeEl").html(moment().format('l'));
            $(".humidEl").text("Humidity: " + data.list[i].main.humidity + "%");
            var tempF = (data.list[i].main.temp - 273.15) * 1.80 + 32;
            $(".tempEl").text("Temp: " + tempF.toFixed(1) + "℉");

            // merge together and put on page
            $("#forecast").append(timeEl, humidEl, tempEl);
            
            console.log(data);
            
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=c456d5f36c7b59b5166a6b0dd2cff66b&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value >= 1 && 2){
          btn.addClass("btn btn-success");
        }
        if (data.value >= 3 && 4 && 5){
          btn.addClass("btn btn-warning");
        }
        if (data.value >= 6 && 7){
          btn.addClass("btn btn-warning-color-dark");
        }
        if (data.value >= 8 && 9){
          btn.addClass("btn btn-danger");
        }
        if (data.value > 10){
          btn.addClass("btn btn-secondary-color");
        }
        $("#today").append(uv.append(btn));
        
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
