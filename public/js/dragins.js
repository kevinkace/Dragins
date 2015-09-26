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
        }
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
                    m("h4", item.name || "empty"),
                    item.id === ctrl.listery.dragging.id() ? m("p", "x: " + ctrl.listery.dragging.position.x() + ", y: " + ctrl.listery.dragging.position.y()) : "",
                    item.id === ctrl.listery.dragging.id() ? m("p", "li: " + ctrl.listery.dragging.listIndex() + ", mi: " + ctrl.listery.dragging.menuIndex()) : ""
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
        return m("ul.tabs",
            {
                class : ctrl.listery.dragging.id() ? "below" : ""
            },
            menu.items()
                .map(function(id, idx) {
                    return m("li",
                        {
                            class : ctrl.listery.dragging.menuIndex() > idx ? "below" : ""
                        },
                        renderTab(ctrl.getItemById(id))
                    );
                })
        );
    }

    function pushItem(list, id, idx) {
        var items = list.items();

        if(items.length < 1) {
            list.items([ id ]);
            return;
        }
        items.splice(idx, 0, id);
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
            pushItem(ctrl.listery.menu, dragging.id(), dragging.menuIndex());
            return;
        }
        if(dragging.menuIndex() === -1 && dragging.listIndex() >= 0) {
            popItem(ctrl.listery.menu, dragging.id());
            popItem(ctrl.listery.list, dragging.id());
            pushItem(ctrl.listery.list, dragging.id(), dragging.listIndex());
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

    function setItemsRegion(list) {
        list.items()
            .forEach(function(id) {
                var item = ctrl.getItemById(id),
                    tab  = document.getElementById(id);
                item.region.x1(tab.offsetLeft);
                item.region.y1(tab.offsetTop);
                item.region.x2(tab.offsetLeft + tab.clientWidth);
                item.region.y2(tab.offsetTop + tab.clientHeight);
            });
    }

    function draggingInList(e) {
        var region   = ctrl.listery.list.region,
            dragging = ctrl.listery.dragging;
        return dragging.position.x() >= region.x1() &&
               dragging.position.x() <= region.x2() &&
               dragging.position.y() >= region.y1() &&
               dragging.position.y() <= region.y2();
    }

    function draggingInMenu(e) {
        var region   = ctrl.listery.menu.region,
            dragging = ctrl.listery.dragging;
        return dragging.position.x() >= region.x1() &&
               dragging.position.y() <= region.x2() &&
               dragging.position.y() >= region.y1() &&
               dragging.position.y() <= region.y2();
    }

    function draggingBelowItem(id) {
        // debugger;
        var dragging = ctrl.listery.dragging;
            item     = ctrl.getItemById(id);

        return dragging.position.y > item.region.y2();
    }

    // function updateDraggingDrop(e) {
    //     if(!cursorInMenu(e)) {
    //         ctrl.listery.dragging.menuIndex(-1);
    //     } else {
    //         var belowId;

    //         ctrl.listery.menu.items().forEach(function(id) {
    //             // debugger;
    //             if(cursorBelowItem(e, id)) {
    //                 belowId = id;
    //             }
    //         });
    //         ctrl.listery.dragging.below(belowId);
    //         // ctrl.listery.dragging.menuIndex(ctrl.listery.menu.items().length);
    //     }

    //     if(!cursorInList(e)) {
    //         ctrl.listery.dragging.listIndex(-1);
    //     } else {
    //         ctrl.listery.dragging.listIndex(ctrl.listery.list.items().length);
    //     }

    // }

    function getBelow() {
        var lowestId,
            dragging = ctrl.listery.dragging,
            menu     = ctrl.listery.menu;

        menu.items().forEach(function(id) {
            if(draggingBelowItem(id)) {
                lowestId = id;
            }
        });

        return lowestId;
    }

    function getMenuIndex() {
        var dragging = ctrl.listery.dragging,
            menu     = ctrl.listery.menu,
            index    = undefined;

        if(!draggingInMenu()) {
            return -1;
        }

        index = 0;

        menu.items().forEach(function(id) {
            index = dragging.position.y() > ctrl.getItemById(id).region.y2() ?
                menu.items().indexOf(id) + 1 :
                index;
        });
        return index;
    }

    function getListIndex() {
        var dragging = ctrl.listery.dragging,
            list     = ctrl.listery.list,
            index    = undefined;

        if(!draggingInList()) {
            return -1;
        }

        index = 0;

        list.items().forEach(function(id) {
            index = dragging.position.y() > ctrl.getItemById(id).region.y2() ?
                list.items().indexOf(id) + 1 :
                index;
        });
        return index;
    }

    function updateDragging(e) {
        var dragging = ctrl.listery.dragging;

        dragging.position.x(e.clientX);
        dragging.position.y(e.clientY);
        dragging.menuIndex(getMenuIndex());
        dragging.listIndex(getListIndex());
    }

    function clearDragging() {
        ctrl.listery.dragging.id(undefined);
        ctrl.listery.dragging.menuIndex(undefined);
        ctrl.listery.dragging.listIndex(undefined);
    }

    return m(".dragins.pure-g",
        {
            onmousedown : function(e) {
                setItemsRegion(ctrl.listery.list);
                setItemsRegion(ctrl.listery.menu);
                setMenuRegion();
                setListRegion();
            },
            onmouseup : function(e) {
                if(ctrl.listery.dragging.id()) {
                    updateListAndMenu();
                }
                clearDragging();
            },
            onmousemove : function(e) {
                // don't do anything if not dragging a tab
                if(!ctrl.listery.dragging.id()) {
                    m.redraw.strategy("none");
                    return;
                }
                updateDragging(e);

                // updateDraggingDrop(e);

            }
        },
        [
            m(".list.pure-u-1-2", renderList(ctrl.listery.list)),
            m(".menu.pure-u-1-2", renderMenu(ctrl.listery.menu)),
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
