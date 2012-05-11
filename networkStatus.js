var keepCheckingNetworkStatus = false;

function checkNetworkStatus() {
    "use strict";
    if (navigator.onLine) {
        // check if server is reachable
        $.ajax({
            cache: false,
            error: showOffline,
            success: showOnline,
            timeout: 5000, // five seconds
            type: "GET",
            url: "ping.js"
        });
    } else {
        showOffline();
    }
}

function showOnline() {
    "use strict";
    $('.networkStatus').html('Online');
    $('.signIn').css({visibility:'visible'});
    checkAgain();
}

function showOffline() {
    "use strict";
    $('.networkStatus').html('Offline');
    $('.signIn').css({visibility:'hidden'});
    checkAgain();
}

function checkIfOnline() {
    "use strict";
    if (keepCheckingNetworkStatus) {
        window.setTimeout(checkNetworkStatus, 1000);
    }
}

function doNotCheckIfOnline() {
    // intentionally left blank
}

var checkAgain = checkIfOnline;
checkIfOnline.other = doNotCheckIfOnline;
doNotCheckIfOnline.other = checkIfOnline;

$(document).ready(function () {
    "use strict";
    checkNetworkStatus();
    $('.networkStatus').click(function () {
        checkAgain = checkAgain.other; checkNetworkStatus();
    });
});
