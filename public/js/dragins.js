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

    this.data = data
        .map(function(data, idx) {
            data.region = {
                x1 : m.prop(),
                y1 : m.prop(),
                x2 : m.prop(),
                y2 : m.prop()
            };
            data.m = m.prop()
            return data;
        });

    this.list = {
        items : m.prop(data.map(function(item) {
                return item.id;
            })
        ),
        region : {
            x1 : m.prop(),
            y1 : m.prop(),
            x2 : m.prop(),
            y2 : m.prop()
        }
    };

    this.menu = {
        items : m.prop([]),
        region : {
            x1 : m.prop(),
            y1 : m.prop(),
            x2 : m.prop(),
            y2 : m.prop()
        }
    };

    this.dragging = {
        id        : m.prop(),
        listIndex : m.prop(),
        menuIndex : m.prop(),
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
        },
        below : m.prop()
    };

    this.dropzone = {
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
        return this.listery.data
            .filter(function(item) {
                return item.id === id;
            })[0];
    };
};

Dragins.view = function(ctrl) {

    function renderTab(item) {
        return m(".tab.pure-button-active",
                {
                    onmousedown : function(e) {
                        e.preventDefault();
                        ctrl.listery.dragging.id(item.id);
                        ctrl.listery.dragging.size.x(e.currentTarget.clientWidth);
                        ctrl.listery.dragging.size.y(e.currentTarget.clientHeight);
                        ctrl.listery.dragging.position.x(e.clientX);
                        ctrl.listery.dragging.position.y(e.clientY);
                        ctrl.listery.dragging.offset.x(e.currentTarget.offsetLeft - e.clientX);
                        ctrl.listery.dragging.offset.y(e.currentTarget.offsetTop - e.clientY);
                    },
                    id : item.id
                },
                [
                    m("h4", item.name || "empty")
                ]
            );
    }

    function renderList(list) {
        return m("ul.tabs",
            list.items()
                .map(function(id) {
                    return m("li", renderTab(ctrl.getItemById(id)) );
                })
        );
    }

    function renderMenu(menu) {
        debugger;
        return m("ul.tabs",
            {
                class : ctrl.listery.dragging.id() && typeof ctrl.listery.dragging.below() === "undefined" ? "below" : ""
            },
            menu.items()
                .map(function(id) {
                    return m("li",
                        // {
                        //     class : ctrl.listery.dragging.id() && ctrl.listery.dragging.below() === id ? "below" : ""
                        // },
                        renderTab(ctrl.getItemById(id))
                    );
                })
        );
    }

    function pushItem(list, id) {
        var items = list.items();

        if(items.length < 1) {
            list.items([ id ]);
            return;
        }
        items.splice(list.items().length, 0, id);
        list.items(items);
    }

    function popItem(list, id) {
        var items = list.items();
        if(items.indexOf(id) < 0) {
            return;
        }
        items.splice(items.indexOf(id), 1);
        list.items(items);
    }

    function updateListAndMenu() {
        var dragging = ctrl.listery.dragging;
        if(typeof dragging.listIndex() === "undefined" || typeof dragging.menuIndex() === "undefined") {
            return;
        }
        if(dragging.listIndex() === -1 && dragging.menuIndex() >= 0) {
            popItem(ctrl.listery.list, dragging.id());
            popItem(ctrl.listery.menu, dragging.id());
            pushItem(ctrl.listery.menu, dragging.id());
            return;
        }
        if(dragging.menuIndex() === -1 && dragging.listIndex() >= 0) {
            popItem(ctrl.listery.menu, dragging.id());
            popItem(ctrl.listery.list, dragging.id());
            pushItem(ctrl.listery.list, dragging.id());
            return;
        }
    }

    function setListRegion() {
        var list = document.getElementsByClassName("list")[0];
        ctrl.listery.list.region.x1(list.offsetLeft);
        ctrl.listery.list.region.y1(list.offsetTop);
        ctrl.listery.list.region.x2(list.offsetLeft + list.clientWidth);
        ctrl.listery.list.region.y2(list.offsetTop + list.clientHeight);
    }

    function setMenuRegion() {
        var menu = document.getElementsByClassName("menu")[0];
        ctrl.listery.menu.region.x1(menu.offsetLeft);
        ctrl.listery.menu.region.y1(menu.offsetTop);
        ctrl.listery.menu.region.x2(menu.offsetLeft + menu.clientWidth);
        ctrl.listery.menu.region.y2(menu.offsetTop + menu.clientHeight);
    }

    function setMenuItemsRegion() {
        ctrl.listery.menu.items()
            .forEach(function(id) {
                var item = ctrl.getItemById(id),
                    tab  = document.getElementById(id);
                item.region.x1(tab.offsetLeft);
                item.region.y1(tab.offsetTop);
                item.region.x2(tab.offsetLeft + tab.clientWidth);
                item.region.y2(tab.offsetTop + tab.clientHeight);
            });
    }

    function cursorInList(e) {
        var region = ctrl.listery.list.region;
        return e.clientX >= region.x1() &&
               e.clientX <= region.x2() &&
               e.clientY >= region.y1() &&
               e.clientY <= region.y2();
    }

    function cursorInMenu(e) {
        var region = ctrl.listery.menu.region;
        return e.clientX >= region.x1() &&
               e.clientX <= region.x2() &&
               e.clientY >= region.y1() &&
               e.clientY <= region.y2();
    }

    function updateDraggingDrop(e) {
        if(!cursorInMenu(e)) {
            ctrl.listery.dragging.menuIndex(-1);
        } else {
            ctrl.listery.dragging.below(ctrl.listery.menu.items().reduce(function(id) {

                })
            );
            ctrl.listery.dragging.menuIndex(ctrl.listery.menu.items().length);
        }

        if(!cursorInList(e)) {
            ctrl.listery.dragging.listIndex(-1);
        } else {
            ctrl.listery.dragging.listIndex(ctrl.listery.list.items().length);
        }

    }

    return m(".dragins.pure-g",
        {
            onmousedown : function(e) {
                setMenuItemsRegion();
                setMenuRegion();
                setListRegion();
            },
            onmouseup : function(e) {
                if(ctrl.listery.dragging.id()) {
                    updateListAndMenu();
                }
                ctrl.listery.dragging.id(undefined);
            },
            onmousemove : function(e) {
                // don't do anything if not dragging a tab
                if(!ctrl.listery.dragging.id()) {
                    m.redraw.strategy("none");
                    return;
                }
                ctrl.listery.dragging.position.x(e.clientX);
                ctrl.listery.dragging.position.y(e.clientY);

                updateDraggingDrop(e);

            }
        },
        [
            m(".list.pure-u-1-4", renderList(ctrl.listery.list)),
            m(".menu.pure-u-3-4", renderMenu(ctrl.listery.menu)),
            m(".dragging.pure-u",
                {
                    class : ctrl.listery.dragging.id() ? "dragging-active" : "",
                    style : {
                        left       : ctrl.listery.dragging.position.x() + "px" || 0,
                        top        : ctrl.listery.dragging.position.y() + "px" || 0,
                        width      : ctrl.listery.dragging.size.x()     + "px" || 0,
                        height     : ctrl.listery.dragging.size.y()     + "px" || 0,
                        marginLeft : ctrl.listery.dragging.offset.x()   + "px" || 0,
                        marginTop  : ctrl.listery.dragging.offset.y()   + "px" || 0
                    }
                },
                ctrl.getItemById(ctrl.listery.dragging.id()) ? renderTab(ctrl.getItemById(ctrl.listery.dragging.id())) : ""
            )
        ]
    );
};

m.mount(document.getElementById("mount"), Dragins);
