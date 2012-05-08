window.applicationCache.addEventListener("updateready", function () {
    $('.update').css({visibility: 'visible'});
});

var workflow;

var transitionsTaken = {
    get : function () {
        var userState = window.localStorage.getItem('userState');
        if (userState) {
            userState = JSON.parse(userState);
            return userState.transitions;
        }
        return [];
    },
    set : function (transitions) {
        var userState = window.localStorage.getItem('userState');
        if (userState) {
            userState = JSON.parse(userState);
            userState.version += 1;
            userState.transitions = transitions;
        } else {
            userState = {
                version : 0,
                transitions : transitions
            };
        }
        window.localStorage.setItem('userState', JSON.stringify(userState));
        parseUser.updateData();
    },
    version : function () {
        var userState = window.localStorage.getItem('userState');
        if (userState) {
            userState = JSON.parse(userState);
            return userState.version;
        }
        return 'no user state';
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
    var history = $('.history .list');
    history.empty();

    var availableTransitions = $('.availableTransitions .list');
    availableTransitions.empty();

    function addHistoryItem(state) {
        var historyItems = $('.history .list');
        history.append(
            $('<li>')
                .click(historyClickHandler(historyItems.length))
                .attr('title', 'index : ' + historyItems.length)
                .append(state.description)
        );
    }

    var currentState = workflow[0];
    addHistoryItem(currentState);
    $.each(transitionsTaken.get(), function () {
        var transitionID = this;
        $.each(currentState.transitions, function () {
            var transitionTaken = this;
            if (transitionTaken.id === transitionID) {
                $('.history li').last().append(' : ' + transitionTaken.description);
                $.each(workflow, function () {
                    var state = this;
                    if (state.id === transitionTaken.destination) {
                        currentState = state;
                        addHistoryItem(currentState);
                    }
                });
            }
        });
    });

    $.each(currentState.transitions, function () {
        "use strict";
        var availableTransition = this;
        availableTransitions
            .append($('<li>')
            .attr('title', 'availableTransition id: ' + availableTransition.id)
            .click(transitionClickHandler(availableTransition.id))
            .append(availableTransition.description));
    });
    $('.version').text(transitionsTaken.version());
    console.timeEnd('draw');
}

$(document).ready(function () {
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
});
