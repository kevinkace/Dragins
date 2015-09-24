/*global m */

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
    this.menus = m.prop([]);
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
                    ctrl.listery.dragging.name(e.currentTarget.innerText);
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
            listery.menus()
                .map(function(menu) {
                    return m("li", renderTab(menu));
                })
        );
    }

    return m(".dragins.pure-g",
        {
            onmouseup : function(e) {
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
