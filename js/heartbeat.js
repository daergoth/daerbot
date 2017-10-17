$(function () {
    let dashboard = $("#dashboard");
    
    $.get("localhost:3000", function(data){
        dashboard.val = data;
    });
});