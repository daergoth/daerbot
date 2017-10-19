$(function () {
    let dashboard = $("#dashboard-widget");

    $.getJSON("https://daerbot.herokuapp.com//heartbeat", function (data) {
        let currentDomElement = undefined;
        for (let property in data) {
            let propertyName = property.replace(/^./, (substring) => {
                return substring.toUpperCase();
            });
            let row = $(
                `<div class="dashboard-row">
                    <span class="dashboard-label">${propertyName}:</span>
                    <span class="dashboard-value">${data[property]}</span>
                </div>`
            );

            if (currentDomElement) {
                currentDomElement.append(row);
            } else {
                currentDomElement = row;
            }
        }

        dashboard.html(currentDomElement);
    });
});