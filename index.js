window.applicationCache.addEventListener("updateready", function () {
    window.location.reload(true);
});

var workflow;
var hasbeeninit = false;

function getUserState() {
    "use strict";
    var userState = window.localStorage.getItem('userState');
    if (userState) {
        return JSON.parse(userState);
    }
    return {
        version : 0,
        transitions : []
    };
}

function setUserState(userState) {
    "use strict";
    window.localStorage.setItem('userState', JSON.stringify(userState))
}

var transitionsTaken = {
    get : function () {
        return getUserState().transitions;
    },
    set : function (transitions) {
        var userState = getUserState();
        userState.version += 1;
        userState.transitions = transitions;
        setUserState(userState);
        parseUser.updateData();
    },
    version : function () {
        return getUserState().version;
    }
};

function transitionClickHandler(id) {
    return function () {
        var ids = transitionsTaken.get();
        ids.push(id);
        transitionsTaken.set(ids);
        draw();
    };
}

function historyClickHandler(index) {
    return function () {
        transitionsTaken.set(transitionsTaken.get().slice(0, index));
        draw();
    };
}

function draw() {
    console.time('draw');
    var history = $('ol.history');
    history.empty();

    var availableTransitions = $('.availableTransitions');
    availableTransitions.empty();

    function addHistoryItem(state) {
        var historyItems = $('ol.history li');
        history.append(
            $('<li>')
                .click(historyClickHandler(historyItems.length))
                .attr('title', 'index : ' + historyItems.length)
                .append(state.description)
        );
    }

    var currentState = workflow[0];
    addHistoryItem(currentState);
    for (var i=0; i<transitionsTaken.get().length; i++) {
        var transitionID = transitionsTaken.get()[i];
        for (var j=0; j<currentState.transitions.length; j++) {
            var transitionTaken = currentState.transitions[j];
            if (transitionTaken.id === transitionID) {
                $('ol.history li').last().append(' : ' + transitionTaken.description);
                for (var k=0; k<workflow.length; k++) {
                    var state = workflow[k];
                    if (state.id === transitionTaken.destination) {
                        currentState = state;
                        addHistoryItem(currentState);
                    }
                }
            }
        }
    }

    for (i=0; i<currentState.transitions.length; i++) {
        var availableTransition = currentState.transitions[i];
        availableTransitions
            .append($('<li>')
            .attr('title', 'availableTransition id: ' + availableTransition.id)
            .click(transitionClickHandler(availableTransition.id))
            .append(availableTransition.description));
    }
    $('.version').text(transitionsTaken.version());
    if (hasbeeninit) {
        history.listview('refresh');
        availableTransitions.listview('refresh');
    }
    hasbeeninit = true;
    console.timeEnd('draw');
}

$(function () {
    var actions = $('.actions')
    var history = $('.history').hide();
    var authentication = $('.authentication').hide();
    $('.actionsNav').click(function() {
        actions.show();
        history.hide();
        authentication.hide();
    });
    $('.historyNav').click(function() {
        actions.hide();
        history.show();
        authentication.hide();
    });
    $('.authenticationNav').click(function() {
        actions.hide();
        history.hide();
        authentication.show();
    });

    // intentionally global
    workflow = [
        {
            id: 'chargeCC',
            description: 'Charge credit card',
            transitions: [
                {
                    id: 'success',
                    description: 'success',
                    destination: 'pack'
                },
                {
                    id: 'failure',
                    description: 'failure',
                    destination: 'promptCustomer'
                }
            ]
        },
        {
            id: 'pack',
            description: 'Check stock',
            transitions: [
                {
                    id: 'inStock',
                    description: 'completely in stock',
                    destination: 'ship'
                },
                {
                    id: 'notInStock',
                    description: 'incomplete stock',
                    destination: 'backorder'
                }
            ]
        },
        {
            id: 'backorder',
            description: 'Backorder items not in stock',
            transitions: [
                {
                    id: 'backordered',
                    description: 'Backordered',
                    destination: 'receive'
                }
            ]
        },
        {
            id: 'receive',
            description: 'Receive stock',
            transitions: [
                {
                    id: 'received',
                    description: 'Received',
                    destination: 'pack'
                }
            ]
        },
        {
            id: 'ship',
            description: 'Ship',
            transitions: []
        },
        {
            id: 'promptCustomer',
            description: 'Credit card declined',
            transitions: [
                {
                    id: 'update',
                    description: 'Update billing information',
                    destination: 'chargeCC'
                },
                {
                    id: 'cancel',
                    description: 'Cancel Order',
                    destination: 'cancelled'
                }
            ]
        },
        {
            id: 'cancelled',
            description: 'Order cancelled',
            transitions: []
        }
    ];
    draw();
    $('.clearHistory').click(function () {
        window.localStorage.clear();
        draw();
    });
});

$(document).bind("mobileinit", function() {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.buttonMarkup.hoverDelay = 0;
});
