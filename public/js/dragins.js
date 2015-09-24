/*global console, m */

"use strict";

var Dragins = {};

Dragins.Listery = function() {
    this.dragging = {
        name : m.prop(),
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
    this.pages = m.prop([
        "red",
        "green",
        "blue",
        "orange"
    ]);
    this.menus = {
        list     : m.prop([]),
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
};

Dragins.view = function(ctrl) {

    function renderTab(item) {
        return m(".tab.pure-button-active",
            {
                onmousedown : function(e) {
                    e.preventDefault();
                    ctrl.listery.dragging.name(e.currentTarget.innerText.trim());
                    // debugger;
                    ctrl.listery.dragging.size.x(e.currentTarget.clientWidth);
                    ctrl.listery.dragging.size.y(e.currentTarget.clientHeight);
                    ctrl.listery.dragging.position.x(e.clientX);
                    ctrl.listery.dragging.position.y(e.clientY);
                    ctrl.listery.dragging.offset.x(e.currentTarget.offsetLeft - e.clientX);
                    ctrl.listery.dragging.offset.y(e.currentTarget.offsetTop - e.clientY);
                }
            },
            [
                m("h4", item || "empty")
            ]
        );
    }

    function list(listery) {
        return m("ul.tabs",
            listery.pages()
                .map(function(page){
                    return m("li", renderTab(page));
                })
        );
    }

    function menu(listery) {
        return m("ul.tabs",
            listery.menus.list()
                .map(function(menu) {
                    return m("li", renderTab(menu));
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
                function droppedInMenu(e) {
                    var region = ctrl.listery.menus.region;
                    return e.clientX >= region.x1() &&
                           e.clientX <= region.x2() &&
                           e.clientY >= region.y1() &&
                           e.clientY <= region.y2();
                }
                if(ctrl.listery.dragging.name() && droppedInMenu(e)) {
                    // Update menu
                    var list = ctrl.listery.menus.list().slice();
                    list.push(ctrl.listery.dragging.name());
                    ctrl.listery.menus.list(list);

                    // Update pages
                    var pages = ctrl.listery.pages()
                                    .slice()
                                    .filter(function(page) {
                                        return page !== ctrl.listery.dragging.name();
                                    });
                    ctrl.listery.pages(pages);

                }
                ctrl.listery.dragging.name(undefined);
            },
            onmousemove : function(e) {
                if(!ctrl.listery.dragging.name()) {
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
                    class : ctrl.listery.dragging.name() ? "dragging-active" : "",
                    style : {
                        left       : ctrl.listery.dragging.position.x()   + "px" || 0,
                        top        : ctrl.listery.dragging.position.y()   + "px" || 0,
                        width      : ctrl.listery.dragging.size.x()       + "px" || 0,
                        height     : ctrl.listery.dragging.size.y()       + "px" || 0,
                        marginLeft : ctrl.listery.dragging.offset.x()     + "px" || 0,
                        marginTop  : ctrl.listery.dragging.offset.y()     + "px" || 0
                    }
                },
                renderTab(ctrl.listery.dragging.name())
            )
        ]
    );
};

m.mount(document.getElementById("mount"), Dragins);
