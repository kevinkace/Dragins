/*global console, m */

"use strict";

var data = [
    {
        id    : 123,
        name  : "red 123",
        url   : "blah.com/123",
        desc  : "123 good"
    },{
        id    : 456,
        name  : "blue 456",
        url   : "blah.com/456",
        desc  : "456 good"
    },{
        id    : 789,
        name  : "green 789",
        url   : "blah.com/789",
        desc  : "789 good"
    },{
        id    : 159,
        name  : "yellow 159",
        url   : "blah.com/159",
        desc  : "159 good"
    },{
        id    : 753,
        name  : "orange 753",
        url   : "blah.com/753",
        desc  : "753 good"
    },{
        id    : 741,
        name  : "purple 741",
        url   : "blah.com/741",
        desc  : "741 good"
    }
];

var Dragins = {};

Dragins.Listery = function() {

    this.dragging = {
        id : m.prop(),
        origin : m.prop(),
        position : {
            x : m.prop(),
            y : m.prop()
        },
        size : {
            x : m.prop(),
            y : m.prop()
        },
        offset : {
            x : m.prop(),
            y : m.prop()
        }
    };

    this.list = data.map(function(data, idx) {
        data.position = m.prop();
        return data;
    });

    this.menus = {
        region : {
            x1 : m.prop(),
            y1 : m.prop(),
            x2 : m.prop(),
            y2 : m.prop()
        }
    };
};


Dragins.controller = function() {
    this.listery = new Dragins.Listery();

    this.getItemById = function(id) {
        return this.listery.list
            .filter(function(item) {
                return item.id === id;
            })[0];
    };
};

Dragins.view = function(ctrl) {

    function renderTab(item) {
        var self = item;
        return m(".tab.pure-button-active",
            {
                onmousedown : function(e) {
                    e.preventDefault();
                    ctrl.listery.dragging.id(self.id);
                    ctrl.listery.dragging.size.x(e.currentTarget.clientWidth);
                    ctrl.listery.dragging.size.y(e.currentTarget.clientHeight);
                    ctrl.listery.dragging.position.x(e.clientX);
                    ctrl.listery.dragging.position.y(e.clientY);
                    ctrl.listery.dragging.offset.x(e.currentTarget.offsetLeft - e.clientX);
                    ctrl.listery.dragging.offset.y(e.currentTarget.offsetTop - e.clientY);
                }
            },
            [
                m("h4", item.id || "empty")
            ]
        );
    }

    function list(listery) {
        return m("ul.tabs",
            listery.list
                .filter(function(item) {
                    return item.position() === undefined;
                })
                .map(function(item) {
                    return m("li", renderTab(item));
                })
        );
    }

    function menu(listery) {
        return m("ul.tabs",
            listery.list
                .filter(function(item) {
                    return item.position() !== undefined;
                })
                .map(function(item) {
                    return m("li", renderTab(item));
                })
        );
    }

    return m(".dragins.pure-g",
        {
            onmousedown : function(e) {
                var menus = document.getElementsByClassName("menu")[0];
                ctrl.listery.menus.region.x1(menus.offsetLeft);
                ctrl.listery.menus.region.y1(menus.offsetTop);
                ctrl.listery.menus.region.x2(menus.offsetLeft + menus.clientWidth);
                ctrl.listery.menus.region.y2(menus.offsetTop + menus.clientHeight);
            },
            onmouseup : function(e) {
                // helper
                function droppedInMenu(e) {
                    var region = ctrl.listery.menus.region;
                    return e.clientX >= region.x1() &&
                           e.clientX <= region.x2() &&
                           e.clientY >= region.y1() &&
                           e.clientY <= region.y2();
                }

                // if tab dropped in menu
                if(ctrl.listery.dragging.id() && droppedInMenu(e)) {
                    // update position
                    ctrl.listery.list
                        .forEach(function(item) {
                            if(item.id === ctrl.listery.dragging.id()) {
                                item.position(true);
                            }
                        });

                }
                ctrl.listery.dragging.id(undefined);
            },
            onmousemove : function(e) {
                if(!ctrl.listery.dragging.id()) {
                    m.redraw.strategy("none");
                    return;
                }
                ctrl.listery.dragging.position.x(e.clientX);
                ctrl.listery.dragging.position.y(e.clientY);
            }
        },
        [
            m(".list.pure-u-1-4", list(ctrl.listery)),
            m(".menu.pure-u-3-4", menu(ctrl.listery)),
            m(".dragging.pure-u",
                {
                    class : ctrl.listery.dragging.id() ? "dragging-active" : "",
                    style : {
                        left       : ctrl.listery.dragging.position.x()   + "px" || 0,
                        top        : ctrl.listery.dragging.position.y()   + "px" || 0,
                        width      : ctrl.listery.dragging.size.x()       + "px" || 0,
                        height     : ctrl.listery.dragging.size.y()       + "px" || 0,
                        marginLeft : ctrl.listery.dragging.offset.x()     + "px" || 0,
                        marginTop  : ctrl.listery.dragging.offset.y()     + "px" || 0
                    }
                },
                ctrl.getItemById(ctrl.listery.dragging.id()) ? renderTab(ctrl.getItemById(ctrl.listery.dragging.id())) : ""
            )
        ]
    );
};

m.mount(document.getElementById("mount"), Dragins);
