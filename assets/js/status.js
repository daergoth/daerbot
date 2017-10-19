$(function () {
    function updateIcon(status) {
        $("#bot-status div.status-icon").css("background-color", status==0?"green":"red");
    }

    function doGet() {
        $.getJSON("https://daerbot.herokuapp.com/:3000/heartbeat", function (data) {
            updateIcon(data.status);
        })
        .fail(function() {
            updateIcon(1);
        });
    }

    doGet();    

    setInterval(function () {
        doGet();
    }, 10000);
});