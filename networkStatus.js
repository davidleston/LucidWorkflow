var keepCheckingNetworkStatus = false;

function checkNetworkStatus() {
    "use strict";
    var weHaveNetworkConnection = navigator.onLine;
    if (weHaveNetworkConnection) {
        // check if server is reachable
        $.ajax({
            cache: false,
            error: function (req, status, ex) {
                showNetworkStatus(false);
            },
            success: function (data, status, req) {
                showNetworkStatus(true);
            },
            timeout: 5000, // five seconds
            type: "GET",
            url: "ping.js"
        });
    } else {
        showNetworkStatus(false);
    }
}

function showNetworkStatus(isOnline) {
    "use strict";
    if (isOnline) {
        $('.networkStatus').html("Online");
        $('.signIn').css({visibility:'visible'});
    } else {
        $('.networkStatus').html("Offline");
        $('.signIn').css({visibility:'hidden'});
    }
    if (keepCheckingNetworkStatus) {
        window.setTimeout(checkNetworkStatus, 1000);
    }
}

$(document).ready(function() {
    "use strict";
    checkNetworkStatus();
});
