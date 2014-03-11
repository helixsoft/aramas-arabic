/*
 *  jQuery OwlCarousel v1.3.2
 *
 *  Copyright (c) 2013 Bartosz Wojciechowski
 *  http://www.owlgraphic.com/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function ($, window, document) {

    var Carousel = {
        init : function (options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent : function () {
            var base = this, url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn : function () {
            var base = this;

            base.$elem.data("owl-originalStyles", base.$elem.attr("style"))
                      .data("owl-originalClasses", base.$elem.attr("class"));

            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars : function () {
            var base = this;
            if (base.$elem.children().length === 0) {return false; }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup : function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate : function () {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars : function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload : function () {
            var base = this;
            window.setTimeout(function () {
                base.updateVars();
            }, 0);
        },

        watchVisibility : function () {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems : function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass : function () {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems : function () {
            var base = this, width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function (a, b) {return a[0] - b[0]; });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response : function () {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition : function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes : function () {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this
                    .css({"width": base.itemWidth})
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes : function () {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll : function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth : function () {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items);
        },

        max : function () {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min : function () {
            return 0;
        },

        loops : function () {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls : function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons : function () {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class" : "owl-prev",
                "html" : base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class" : "owl-next",
                "html" : base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination : function () {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination : function () {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class" : "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination : function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function () {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation : function () {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls : function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls : function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo : function (position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }

            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo : function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo : function () {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop : function () {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp : function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play : function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed : function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed : function (speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition : function () {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate : function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d : function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move : function (value) {
            var base = this;
            base.$owlWrapper.css({"left" : value});
        },

        css2slide : function (value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left" : value
            }, {
                duration : speed || base.options.slideSpeed,
                complete : function () {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser : function () {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                                  "; -ms-transform:"     + translate3D +
                                  "; -o-transform:"      + translate3D +
                                  "; -webkit-transform:" + translate3D +
                                  "; transform:"         + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            support3d = (asSupport !== null && asSupport.length === 1);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d" : support3d,
                "isTouch" : isTouch
            };
        },

        moveEvents : function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes : function () {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents :  function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) { event.preventDefault(); });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures : function () {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX : 0,
                    offsetY : 0,
                    baseElWidth : 0,
                    relativePos : 0,
                    position: null,
                    minSwipe : null,
                    maxSwipe: null,
                    sliding : null,
                    dargging: null,
                    targetElement : null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x : event.touches[0].pageX,
                        y : event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x : event.pageX,
                            y : event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x : event.clientX,
                            y : event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function () {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition : function () {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition  = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem : function () {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection : function () {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents : function () {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover : function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad : function () {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    base.lazyPreload($item, $lazyImg);
                }
            }
        },

        lazyPreload : function ($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {//if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight : function () {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg : function (img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems : function () {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes : function (className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition : function () {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin" : origin + "px",
                    "-moz-perspective-origin" : origin + "px",
                    "perspective-origin" : origin + "px"
                });
            function transStyles(prevPos) {
                return {
                    "position" : "relative",
                    "left" : prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function () {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function () {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle : function (item, classToRemove) {
            var base = this;
            item.css({
                "position" : "",
                "left" : ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus : function () {
            var base = this;
            base.owl = {
                "userOptions"   : base.userOptions,
                "baseElement"   : base.$elem,
                "userItems"     : base.$userItems,
                "owlItems"      : base.$owlItems,
                "currentItem"   : base.currentItem,
                "prevItem"      : base.prevItem,
                "visibleItems"  : base.visibleItems,
                "isTouch"       : base.browser.isTouch,
                "browser"       : base.browser,
                "dragDirection" : base.dragDirection
            };
        },

        clearEvents : function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap : function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem
                .attr("style", base.$elem.data("owl-originalStyles") || "")
                .attr("class", base.$elem.data("owl-originalClasses"));
        },

        destroy : function () {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit : function (newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem : function (htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {return false; }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem : function (targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items : 5,
        itemsCustom : false,
        itemsDesktop : [1199, 4],
        itemsDesktopSmall : [979, 3],
        itemsTablet : [768, 2],
        itemsTabletSmall : false,
        itemsMobile : [479, 1],
        singleItem : false,
        itemsScaleUp : false,

        slideSpeed : 200,
        paginationSpeed : 800,
        rewindSpeed : 1000,

        autoPlay : false,
        stopOnHover : false,

        navigation : false,
        navigationText : ["prev", "next"],
        rewindNav : true,
        scrollPerPage : false,

        pagination : true,
        paginationNumbers : false,

        responsive : true,
        responsiveRefreshRate : 200,
        responsiveBaseWidth : window,

        baseClass : "owl-carousel",
        theme : "owl-theme",

        lazyLoad : false,
        lazyFollow : true,
        lazyEffect : "fade",

        autoHeight : false,

        jsonPath : false,
        jsonSuccess : false,

        dragBeforeAnimFinish : true,
        mouseDrag : true,
        touchDrag : true,

        addClassActive : false,
        transitionStyle : false,

        beforeUpdate : false,
        afterUpdate : false,
        beforeInit : false,
        afterInit : false,
        beforeMove : false,
        afterMove : false,
        afterAction : false,
        startDragging : false,
        afterLazyLoad: false
    };
}(jQuery, window, document));
(function (e, t, n) {
    e.fn.jScrollPane = function (r) {
        function i(r, i) {
            function K(t) {
                var i, o, a, w, E, x, T = false,
                    C = false;
                s = t;
                if (u === n) {
                    E = r.scrollTop();
                    x = r.scrollLeft();
                    r.css({
                        overflow: "hidden",
                        padding: 0
                    });
                    f = r.innerWidth() + R;
                    l = r.innerHeight();
                    r.width(f);
                    u = e('<div class="jspPane" />').css("padding", q).append(r.children());
                    h = e('<div class="jspContainer" />').css({
                        width: f + "px",
                        height: l + "px"
                    }).append(u).appendTo(r)
                } else {
                    r.css("width", "");
                    T = s.stickToBottom && yt();
                    C = s.stickToRight && bt();
                    w = r.innerWidth() + R != f || r.outerHeight() != l;
                    if (w) {
                        f = r.innerWidth() + R;
                        l = r.innerHeight();
                        h.css({
                            width: f + "px",
                            height: l + "px"
                        })
                    }
                    if (!w && U == p && u.outerHeight() == d) {
                        r.width(f);
                        return
                    }
                    U = p;
                    u.css("width", "");
                    r.width(f);
                    h.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()
                }
                u.css("overflow", "auto");
                if (t.contentWidth) {
                    p = t.contentWidth
                } else {
                    p = u[0].scrollWidth
                }
                d = u[0].scrollHeight;
                u.css("overflow", "");
                v = p / f;
                m = d / l;
                g = m > 1;
                y = v > 1;
                if (!(y || g)) {
                    r.removeClass("jspScrollable");
                    u.css({
                        top: 0,
                        width: h.width() - R
                    });
                    Et();
                    Tt();
                    Ct();
                    st()
                } else {
                    r.addClass("jspScrollable");
                    i = s.maintainPosition && (S || N);
                    if (i) {
                        o = mt();
                        a = gt()
                    }
                    Q();
                    Y();
                    et();
                    if (i) {
                        dt(C ? p - f : o, false);
                        pt(T ? d - l : a, false)
                    }
                    xt();
                    wt();
                    At();
                    if (s.enableKeyboardNavigation) {
                        Nt()
                    }
                    if (s.clickOnTrack) {
                        it()
                    }
                    kt();
                    if (s.hijackInternalLinks) {
                        Lt()
                    }
                } if (s.autoReinitialise && !I) {
                    I = setInterval(function () {
                        K(s)
                    }, s.autoReinitialiseDelay)
                } else {
                    if (!s.autoReinitialise && I) {
                        clearInterval(I)
                    }
                }
                E && r.scrollTop(0) && pt(E, false);
                x && r.scrollLeft(0) && dt(x, false);
                r.trigger("jsp-initialised", [y || g])
            }

            function Q() {
                if (g) {
                    h.append(e('<div class="jspVerticalBar" />').append(e('<div class="jspCap jspCapTop" />'), e('<div class="jspTrack" />').append(e('<div class="jspDrag" />').append(e('<div class="jspDragTop" />'), e('<div class="jspDragBottom" />'))), e('<div class="jspCap jspCapBottom" />')));
                    C = h.find(">.jspVerticalBar");
                    k = C.find(">.jspTrack");
                    w = k.find(">.jspDrag");
                    if (s.showArrows) {
                        M = e('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp", nt(0, -1)).bind("click.jsp", St);
                        _ = e('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp", nt(0, 1)).bind("click.jsp", St);
                        if (s.arrowScrollOnHover) {
                            M.bind("mouseover.jsp", nt(0, -1, M));
                            _.bind("mouseover.jsp", nt(0, 1, _))
                        }
                        tt(k, s.verticalArrowPositions, M, _)
                    }
                    A = l;
                    h.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function () {
                        A -= e(this).outerHeight()
                    });
                    w.hover(function () {
                        w.addClass("jspHover")
                    }, function () {
                        w.removeClass("jspHover")
                    }).bind("mousedown.jsp", function (t) {
                        e("html").bind("dragstart.jsp selectstart.jsp", St);
                        w.addClass("jspActive");
                        var n = t.pageY - w.position().top;
                        e("html").bind("mousemove.jsp", function (e) {
                            ut(e.pageY - n, false)
                        }).bind("mouseup.jsp mouseleave.jsp", ot);
                        return false
                    });
                    G()
                }
            }

            function G() {
                k.height(A + "px");
                S = 0;
                L = s.verticalGutter + k.outerWidth();
                u.width(f - L - R);
                try {
                    if (C.position().left === 0) {
                        u.css("margin-left", L + "px")
                    }
                } catch (e) {}
            }

            function Y() {
                if (y) {
                    h.append(e('<div class="jspHorizontalBar" />').append(e('<div class="jspCap jspCapLeft" />'), e('<div class="jspTrack" />').append(e('<div class="jspDrag" />').append(e('<div class="jspDragLeft" />'), e('<div class="jspDragRight" />'))), e('<div class="jspCap jspCapRight" />')));
                    D = h.find(">.jspHorizontalBar");
                    P = D.find(">.jspTrack");
                    x = P.find(">.jspDrag");
                    if (s.showArrows) {
                        j = e('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp", nt(-1, 0)).bind("click.jsp", St);
                        F = e('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp", nt(1, 0)).bind("click.jsp", St);
                        if (s.arrowScrollOnHover) {
                            j.bind("mouseover.jsp", nt(-1, 0, j));
                            F.bind("mouseover.jsp", nt(1, 0, F))
                        }
                        tt(P, s.horizontalArrowPositions, j, F)
                    }
                    x.hover(function () {
                        x.addClass("jspHover")
                    }, function () {
                        x.removeClass("jspHover")
                    }).bind("mousedown.jsp", function (t) {
                        e("html").bind("dragstart.jsp selectstart.jsp", St);
                        x.addClass("jspActive");
                        var n = t.pageX - x.position().left;
                        e("html").bind("mousemove.jsp", function (e) {
                            ft(e.pageX - n, false)
                        }).bind("mouseup.jsp mouseleave.jsp", ot);
                        return false
                    });
                    H = h.innerWidth();
                    Z()
                }
            }

            function Z() {
                h.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function () {
                    H -= e(this).outerWidth()
                });
                P.width(H + "px");
                N = 0
            }

            function et() {
                if (y && g) {
                    var t = P.outerHeight(),
                        n = k.outerWidth();
                    A -= t;
                    e(D).find(">.jspCap:visible,>.jspArrow").each(function () {
                        H += e(this).outerWidth()
                    });
                    H -= n;
                    l -= n;
                    f -= t;
                    P.parent().append(e('<div class="jspCorner" />').css("width", t + "px"));
                    G();
                    Z()
                }
                if (y) {
                    u.width(h.outerWidth() - R + "px")
                }
                d = u.outerHeight();
                m = d / l;
                if (y) {
                    B = Math.ceil(1 / v * H);
                    if (B > s.horizontalDragMaxWidth) {
                        B = s.horizontalDragMaxWidth
                    } else {
                        if (B < s.horizontalDragMinWidth) {
                            B = s.horizontalDragMinWidth
                        }
                    }
                    x.width(B + "px");
                    T = H - B;
                    lt(N)
                }
                if (g) {
                    O = Math.ceil(1 / m * A);
                    if (O > s.verticalDragMaxHeight) {
                        O = s.verticalDragMaxHeight
                    } else {
                        if (O < s.verticalDragMinHeight) {
                            O = s.verticalDragMinHeight
                        }
                    }
                    w.height(O + "px");
                    E = A - O;
                    at(S)
                }
            }

            function tt(e, t, n, r) {
                var i = "before",
                    s = "after",
                    o;
                if (t == "os") {
                    t = /Mac/.test(navigator.platform) ? "after" : "split"
                }
                if (t == i) {
                    s = t
                } else {
                    if (t == s) {
                        i = t;
                        o = n;
                        n = r;
                        r = o
                    }
                }
                e[i](n)[s](r)
            }

            function nt(e, t, n) {
                return function () {
                    rt(e, t, this, n);
                    this.blur();
                    return false
                }
            }

            function rt(t, n, r, i) {
                r = e(r).addClass("jspActive");
                var u, a, f = true,
                    l = function () {
                        if (t !== 0) {
                            o.scrollByX(t * s.arrowButtonSpeed)
                        }
                        if (n !== 0) {
                            o.scrollByY(n * s.arrowButtonSpeed)
                        }
                        a = setTimeout(l, f ? s.initialDelay : s.arrowRepeatFreq);
                        f = false
                    };
                l();
                u = i ? "mouseout.jsp" : "mouseup.jsp";
                i = i || e("html");
                i.bind(u, function () {
                    r.removeClass("jspActive");
                    a && clearTimeout(a);
                    a = null;
                    i.unbind(u)
                })
            }

            function it() {
                st();
                if (g) {
                    k.bind("mousedown.jsp", function (t) {
                        if (t.originalTarget === n || t.originalTarget == t.currentTarget) {
                            var r = e(this),
                                i = r.offset(),
                                u = t.pageY - i.top - S,
                                a, f = true,
                                h = function () {
                                    var e = r.offset(),
                                        n = t.pageY - e.top - O / 2,
                                        i = l * s.scrollPagePercent,
                                        c = E * i / (d - l);
                                    if (u < 0) {
                                        if (S - c > n) {
                                            o.scrollByY(-i)
                                        } else {
                                            ut(n)
                                        }
                                    } else {
                                        if (u > 0) {
                                            if (S + c < n) {
                                                o.scrollByY(i)
                                            } else {
                                                ut(n)
                                            }
                                        } else {
                                            p();
                                            return
                                        }
                                    }
                                    a = setTimeout(h, f ? s.initialDelay : s.trackClickRepeatFreq);
                                    f = false
                                }, p = function () {
                                    a && clearTimeout(a);
                                    a = null;
                                    e(document).unbind("mouseup.jsp", p)
                                };
                            h();
                            e(document).bind("mouseup.jsp", p);
                            return false
                        }
                    })
                }
                if (y) {
                    P.bind("mousedown.jsp", function (t) {
                        if (t.originalTarget === n || t.originalTarget == t.currentTarget) {
                            var r = e(this),
                                i = r.offset(),
                                u = t.pageX - i.left - N,
                                a, l = true,
                                h = function () {
                                    var e = r.offset(),
                                        n = t.pageX - e.left - B / 2,
                                        i = f * s.scrollPagePercent,
                                        c = T * i / (p - f);
                                    if (u < 0) {
                                        if (N - c > n) {
                                            o.scrollByX(-i)
                                        } else {
                                            ft(n)
                                        }
                                    } else {
                                        if (u > 0) {
                                            if (N + c < n) {
                                                o.scrollByX(i)
                                            } else {
                                                ft(n)
                                            }
                                        } else {
                                            d();
                                            return
                                        }
                                    }
                                    a = setTimeout(h, l ? s.initialDelay : s.trackClickRepeatFreq);
                                    l = false
                                }, d = function () {
                                    a && clearTimeout(a);
                                    a = null;
                                    e(document).unbind("mouseup.jsp", d)
                                };
                            h();
                            e(document).bind("mouseup.jsp", d);
                            return false
                        }
                    })
                }
            }

            function st() {
                if (P) {
                    P.unbind("mousedown.jsp")
                }
                if (k) {
                    k.unbind("mousedown.jsp")
                }
            }

            function ot() {
                e("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp");
                if (w) {
                    w.removeClass("jspActive")
                }
                if (x) {
                    x.removeClass("jspActive")
                }
            }

            function ut(e, t) {
                if (!g) {
                    return
                }
                if (e < 0) {
                    e = 0
                } else {
                    if (e > E) {
                        e = E
                    }
                } if (t === n) {
                    t = s.animateScroll
                }
                if (t) {
                    o.animate(w, "top", e, at)
                } else {
                    w.css("top", e);
                    at(e)
                }
            }

            function at(e) {
                if (e === n) {
                    e = w.position().top
                }
                h.scrollTop(0);
                S = e;
                var t = S === 0,
                    i = S == E,
                    s = e / E,
                    o = -s * (d - l);
                if (z != t || X != i) {
                    z = t;
                    X = i;
                    r.trigger("jsp-arrow-change", [z, X, W, V])
                }
                ct(t, i);
                u.css("top", o);
                r.trigger("jsp-scroll-y", [-o, t, i]).trigger("scroll")
            }

            function ft(e, t) {
                if (!y) {
                    return
                }
                if (e < 0) {
                    e = 0
                } else {
                    if (e > T) {
                        e = T
                    }
                } if (t === n) {
                    t = s.animateScroll
                }
                if (t) {
                    o.animate(x, "left", e, lt)
                } else {
                    x.css("left", e);
                    lt(e)
                }
            }

            function lt(e) {
                if (e === n) {
                    e = x.position().left
                }
                h.scrollTop(0);
                N = e;
                var t = N === 0,
                    i = N == T,
                    s = e / T,
                    o = -s * (p - f);
                if (W != t || V != i) {
                    W = t;
                    V = i;
                    r.trigger("jsp-arrow-change", [z, X, W, V])
                }
                ht(t, i);
                u.css("left", o);
                r.trigger("jsp-scroll-x", [-o, t, i]).trigger("scroll")
            }

            function ct(e, t) {
                if (s.showArrows) {
                    M[e ? "addClass" : "removeClass"]("jspDisabled");
                    _[t ? "addClass" : "removeClass"]("jspDisabled")
                }
            }

            function ht(e, t) {
                if (s.showArrows) {
                    j[e ? "addClass" : "removeClass"]("jspDisabled");
                    F[t ? "addClass" : "removeClass"]("jspDisabled")
                }
            }

            function pt(e, t) {
                var n = e / (d - l);
                ut(n * E, t)
            }

            function dt(e, t) {
                var n = e / (p - f);
                ft(n * T, t)
            }

            function vt(t, n, r) {
                var i, o, u, a = 0,
                    c = 0,
                    p, d, v, m, g, y;
                try {
                    i = e(t)
                } catch (w) {
                    return
                }
                o = i.outerHeight();
                u = i.outerWidth();
                h.scrollTop(0);
                h.scrollLeft(0);
                while (!i.is(".jspPane")) {
                    a += i.position().top;
                    c += i.position().left;
                    i = i.offsetParent();
                    if (/^body|html$/i.test(i[0].nodeName)) {
                        return
                    }
                }
                p = gt();
                v = p + l;
                if (a < p || n) {
                    g = a - s.verticalGutter
                } else {
                    if (a + o > v) {
                        g = a - l + o + s.verticalGutter
                    }
                } if (g) {
                    pt(g, r)
                }
                d = mt();
                m = d + f;
                if (c < d || n) {
                    y = c - s.horizontalGutter
                } else {
                    if (c + u > m) {
                        y = c - f + u + s.horizontalGutter
                    }
                } if (y) {
                    dt(y, r)
                }
            }

            function mt() {
                return -u.position().left
            }

            function gt() {
                return -u.position().top
            }

            function yt() {
                var e = d - l;
                return e > 20 && e - gt() < 10
            }

            function bt() {
                var e = p - f;
                return e > 20 && e - mt() < 10
            }

            function wt() {
                h.unbind(J).bind(J, function (e, t, n, r) {
                    var i = N,
                        u = S;
                    o.scrollBy(n * s.mouseWheelSpeed, -r * s.mouseWheelSpeed, false);
                    return i == N && u == S
                })
            }

            function Et() {
                h.unbind(J)
            }

            function St() {
                return false
            }

            function xt() {
                u.find(":input,a").unbind("focus.jsp").bind("focus.jsp", function (e) {
                    vt(e.target, false)
                })
            }

            function Tt() {
                u.find(":input,a").unbind("focus.jsp")
            }

            function Nt() {
                function a() {
                    var e = N,
                        r = S;
                    switch (t) {
                    case 40:
                        o.scrollByY(s.keyboardSpeed, false);
                        break;
                    case 38:
                        o.scrollByY(-s.keyboardSpeed, false);
                        break;
                    case 34:
                    case 32:
                        o.scrollByY(l * s.scrollPagePercent, false);
                        break;
                    case 33:
                        o.scrollByY(-l * s.scrollPagePercent, false);
                        break;
                    case 39:
                        o.scrollByX(s.keyboardSpeed, false);
                        break;
                    case 37:
                        o.scrollByX(-s.keyboardSpeed, false);
                        break
                    }
                    n = e != N || r != S;
                    return n
                }
                var t, n, i = [];
                y && i.push(D[0]);
                g && i.push(C[0]);
                u.focus(function () {
                    r.focus()
                });
                r.attr("tabindex", 0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp", function (r) {
                    if (r.target !== this && !(i.length && e(r.target).closest(i).length)) {
                        return
                    }
                    var s = N,
                        o = S;
                    switch (r.keyCode) {
                    case 40:
                    case 38:
                    case 34:
                    case 32:
                    case 33:
                    case 39:
                    case 37:
                        t = r.keyCode;
                        a();
                        break;
                    case 35:
                        pt(d - l);
                        t = null;
                        break;
                    case 36:
                        pt(0);
                        t = null;
                        break
                    }
                    n = r.keyCode == t && s != N || o != S;
                    return !n
                }).bind("keypress.jsp", function (e) {
                    if (e.keyCode == t) {
                        a()
                    }
                    return !n
                });
                if (s.hideFocus) {
                    r.css("outline", "none");
                    if ("hideFocus" in h[0]) {
                        r.attr("hideFocus", true)
                    }
                } else {
                    r.css("outline", "");
                    if ("hideFocus" in h[0]) {
                        r.attr("hideFocus", false)
                    }
                }
            }

            function Ct() {
                r.attr("tabindex", "-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp")
            }

            function kt() {
                if (location.hash && location.hash.length > 1) {
                    var t, n, r = escape(location.hash.substr(1));
                    try {
                        t = e("#" + r + ', a[name="' + r + '"]')
                    } catch (i) {
                        return
                    }
                    if (t.length && u.find(r)) {
                        if (h.scrollTop() === 0) {
                            n = setInterval(function () {
                                if (h.scrollTop() > 0) {
                                    vt(t, true);
                                    e(document).scrollTop(h.position().top);
                                    clearInterval(n)
                                }
                            }, 50)
                        } else {
                            vt(t, true);
                            e(document).scrollTop(h.position().top)
                        }
                    }
                }
            }

            function Lt() {
                if (e(document.body).data("jspHijack")) {
                    return
                }
                e(document.body).data("jspHijack", true);
                e(document.body).delegate("a[href*=#]", "click", function (n) {
                    var r = this.href.substr(0, this.href.indexOf("#")),
                        i = location.href,
                        s, o, u, f, l, c;
                    if (location.href.indexOf("#") !== -1) {
                        i = location.href.substr(0, location.href.indexOf("#"))
                    }
                    if (r !== i) {
                        return
                    }
                    s = escape(this.href.substr(this.href.indexOf("#") + 1));
                    o;
                    try {
                        o = e("#" + s + ', a[name="' + s + '"]')
                    } catch (h) {
                        return
                    }
                    if (!o.length) {
                        return
                    }
                    u = o.closest(".jspScrollable");
                    f = u.data("jsp");
                    f.scrollToElement(o, true);
                    if (u[0].scrollIntoView) {
                        l = e(t).scrollTop();
                        c = o.offset().top;
                        if (c < l || c > l + e(t).height()) {
                            u[0].scrollIntoView()
                        }
                    }
                    n.preventDefault()
                })
            }

            function At() {
                var e, t, n, r, i, s = false;
                h.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp", function (o) {
                    var u = o.originalEvent.touches[0];
                    e = mt();
                    t = gt();
                    n = u.pageX;
                    r = u.pageY;
                    i = false;
                    s = true
                }).bind("touchmove.jsp", function (u) {
                    if (!s) {
                        return
                    }
                    var a = u.originalEvent.touches[0],
                        f = N,
                        l = S;
                    o.scrollTo(e + n - a.pageX, t + r - a.pageY);
                    i = i || Math.abs(n - a.pageX) > 5 || Math.abs(r - a.pageY) > 5;
                    return f == N && l == S
                }).bind("touchend.jsp", function (e) {
                    s = false
                }).bind("click.jsp-touchclick", function (e) {
                    if (i) {
                        i = false;
                        return false
                    }
                })
            }

            function Ot() {
                var e = gt(),
                    t = mt();
                r.removeClass("jspScrollable").unbind(".jsp");
                r.replaceWith($.append(u.children()));
                $.scrollTop(e);
                $.scrollLeft(t);
                if (I) {
                    clearInterval(I)
                }
            }
            var s, o = this,
                u, f, l, h, p, d, v, m, g, y, w, E, S, x, T, N, C, k, L, A, O, M, _, D, P, H, B, j, F, I, q, R, U, z = true,
                W = true,
                X = false,
                V = false,
                $ = r.clone(false, false).empty(),
                J = e.fn.mwheelIntent ? "mwheelIntent.jsp" : "mousewheel.jsp";
            q = r.css("paddingTop") + " " + r.css("paddingRight") + " " + r.css("paddingBottom") + " " + r.css("paddingLeft");
            R = (parseInt(r.css("paddingLeft"), 10) || 0) + (parseInt(r.css("paddingRight"), 10) || 0);
            e.extend(o, {
                reinitialise: function (t) {
                    t = e.extend({}, s, t);
                    K(t)
                },
                scrollToElement: function (e, t, n) {
                    vt(e, t, n)
                },
                scrollTo: function (e, t, n) {
                    dt(e, n);
                    pt(t, n)
                },
                scrollToX: function (e, t) {
                    dt(e, t)
                },
                scrollToY: function (e, t) {
                    pt(e, t)
                },
                scrollToPercentX: function (e, t) {
                    dt(e * (p - f), t)
                },
                scrollToPercentY: function (e, t) {
                    pt(e * (d - l), t)
                },
                scrollBy: function (e, t, n) {
                    o.scrollByX(e, n);
                    o.scrollByY(t, n)
                },
                scrollByX: function (e, t) {
                    var n = mt() + Math[e < 0 ? "floor" : "ceil"](e),
                        r = n / (p - f);
                    ft(r * T, t)
                },
                scrollByY: function (e, t) {
                    var n = gt() + Math[e < 0 ? "floor" : "ceil"](e),
                        r = n / (d - l);
                    ut(r * E, t)
                },
                positionDragX: function (e, t) {
                    ft(e, t)
                },
                positionDragY: function (e, t) {
                    ut(e, t)
                },
                animate: function (e, t, n, r) {
                    var i = {};
                    i[t] = n;
                    e.animate(i, {
                        duration: s.animateDuration,
                        easing: s.animateEase,
                        queue: false,
                        step: r
                    })
                },
                getContentPositionX: function () {
                    return mt()
                },
                getContentPositionY: function () {
                    return gt()
                },
                getContentWidth: function () {
                    return p
                },
                getContentHeight: function () {
                    return d
                },
                getPercentScrolledX: function () {
                    return mt() / (p - f)
                },
                getPercentScrolledY: function () {
                    return gt() / (d - l)
                },
                getIsScrollableH: function () {
                    return y
                },
                getIsScrollableV: function () {
                    return g
                },
                getContentPane: function () {
                    return u
                },
                scrollToBottom: function (e) {
                    ut(E, e)
                },
                hijackInternalLinks: e.noop,
                destroy: function () {
                    Ot()
                }
            });
            K(i)
        }
        r = e.extend({}, e.fn.jScrollPane.defaults, r);
        e.each(["mouseWheelSpeed", "arrowButtonSpeed", "trackClickSpeed", "keyboardSpeed"], function () {
            r[this] = r[this] || r.speed
        });
        return this.each(function () {
            var t = e(this),
                n = t.data("jsp");
            if (n) {
                n.reinitialise(r)
            } else {
                e("script", t).filter('[type="text/javascript"],:not([type])').remove();
                n = new i(t, r);
                t.data("jsp", n)
            }
        })
    };
    e.fn.jScrollPane.defaults = {
        showArrows: false,
        maintainPosition: true,
        stickToBottom: false,
        stickToRight: false,
        clickOnTrack: true,
        autoReinitialise: false,
        autoReinitialiseDelay: 500,
        verticalDragMinHeight: 0,
        verticalDragMaxHeight: 99999,
        horizontalDragMinWidth: 0,
        horizontalDragMaxWidth: 99999,
        contentWidth: n,
        animateScroll: false,
        animateDuration: 300,
        animateEase: "linear",
        hijackInternalLinks: false,
        verticalGutter: 4,
        horizontalGutter: 4,
        mouseWheelSpeed: 0,
        arrowButtonSpeed: 0,
        arrowRepeatFreq: 50,
        arrowScrollOnHover: false,
        trackClickSpeed: 0,
        trackClickRepeatFreq: 70,
        verticalArrowPositions: "split",
        horizontalArrowPositions: "split",
        enableKeyboardNavigation: true,
        hideFocus: false,
        keyboardSpeed: 0,
        initialDelay: 300,
        speed: 30,
        scrollPagePercent: .8
    }
})(jQuery, this);
(function (e) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], e)
    } else if (typeof exports === "object") {
        module.exports = e
    } else {
        e(jQuery)
    }
})(function (e) {
    function o(t) {
        var n = t || window.event,
            s = [].slice.call(arguments, 1),
            o = 0,
            u = 0,
            a = 0,
            f = 0,
            l = 0,
            c;
        t = e.event.fix(n);
        t.type = "mousewheel";
        if (n.wheelDelta) {
            o = n.wheelDelta
        }
        if (n.detail) {
            o = n.detail * -1
        }
        if (n.deltaY) {
            a = n.deltaY * -1;
            o = a
        }
        if (n.deltaX) {
            u = n.deltaX;
            o = u * -1
        }
        if (n.wheelDeltaY !== undefined) {
            a = n.wheelDeltaY
        }
        if (n.wheelDeltaX !== undefined) {
            u = n.wheelDeltaX * -1
        }
        f = Math.abs(o);
        if (!r || f < r) {
            r = f
        }
        l = Math.max(Math.abs(a), Math.abs(u));
        if (!i || l < i) {
            i = l
        }
        c = o > 0 ? "floor" : "ceil";
        o = Math[c](o / r);
        u = Math[c](u / i);
        a = Math[c](a / i);
        s.unshift(t, o, u, a);
        return (e.event.dispatch || e.event.handle).apply(this, s)
    }
    var t = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"];
    var n = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"];
    var r, i;
    if (e.event.fixHooks) {
        for (var s = t.length; s;) {
            e.event.fixHooks[t[--s]] = e.event.mouseHooks
        }
    }
    e.event.special.mousewheel = {
        setup: function () {
            if (this.addEventListener) {
                for (var e = n.length; e;) {
                    this.addEventListener(n[--e], o, false)
                }
            } else {
                this.onmousewheel = o
            }
        },
        teardown: function () {
            if (this.removeEventListener) {
                for (var e = n.length; e;) {
                    this.removeEventListener(n[--e], o, false)
                }
            } else {
                this.onmousewheel = null
            }
        }
    };
    e.fn.extend({
        mousewheel: function (e) {
            return e ? this.bind("mousewheel", e) : this.trigger("mousewheel")
        },
        unmousewheel: function (e) {
            return this.unbind("mousewheel", e)
        }
    })
});
(function (e, t) {
    var n = 0;
    e.fn.getPercentage = function () {
        var e = this.attr("style").match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1);
        return e
    };
    e.fn.adjRounding = function (t) {
        var n = e(this),
            r = n.find(t),
            i = n.parent().width() - r.eq(0).width();
        if (i !== 0) {
            r.css("position", "relative");
            for (var s = 0; s < r.length; s++) {
                r.eq(s).css("left", i * s + "px")
            }
        }
        return this
    };
    e.fn.carousel = function (r) {
        if (this.data("carousel-initialized")) {
            return
        }
        this.data("carousel-initialized", true);
        var i = {
            slider: ".slider",
            slide: ".slide",
            prevSlide: null,
            nextSlide: null,
            slideHed: null,
            addPagination: false,
            addNav: r != t && (r.prevSlide || r.nextSlide) ? false : true,
            namespace: "carousel",
            speed: 600,
            backToStart: true
        }, s = e.extend(i, r),
            o = this,
            u = document.body || document.documentElement,
            a = function () {
                u.setAttribute("style", "transition:top 1s ease;-webkit-transition:top 1s ease;-moz-transition:top 1s ease;");
                var e = !! (u.style.transition || u.style.webkitTransition || u.style.msTransition || u.style.OTransition || u.style.MozTransition);
                return e
            }, f = {
                init: function () {
                    n++;
                    o.each(function (t) {
                        var r = e(this),
                            i = r.find(s.slider),
                            o = r.find(s.slide),
                            u = o.length,
                            a = "margin-left " + s.speed / 1e3 + "s ease",
                            l = "carousel-" + n + "-" + t;
                        if (o.length <= 1) {
                            return
                        }
                        r.css({
                            overflow: "hidden",
                            width: "100%"
                        }).attr("role", "application");
                        i.attr("id", i[0].id || "carousel-" + n + "-" + t).css({
                            marginLeft: "0px",
                            "float": "left",
                            width: 100 * u + "%",
                            "-webkit-transition": a,
                            "-moz-transition": a,
                            "-ms-transition": a,
                            "-o-transition": a,
                            transition: a
                        }).bind("carouselmove", f.move).bind("nextprev", f.nextPrev).bind("navstate", f.navState);
                        o.css({
                            "float": "left",
                            width: 100 / u + "%"
                        }).each(function (t) {
                            var n = e(this);
                            n.attr({
                                role: "tabpanel document",
                                id: l + "-slide" + t
                            });
                            if (s.addPagination) {
                                n.attr("aria-labelledby", l + "-tab" + t)
                            }
                        });
                        s.addPagination && f.addPagination();
                        s.addNav && f.addNav();
                        i.trigger("navstate", {
                            current: 0
                        })
                    })
                },
                addNav: function () {
                    o.each(function (t) {
                        var n = e(this),
                            r = n.find(s.slider),
                            i = r[0].id,
                            o = ['<ul class="slidecontrols" role="navigation">', '  <li role="presentation"><a href="#' + i + '" class="' + s.namespace + '-next">Next</a></li>', '  <li role="presentation"><a href="#' + i + '" class="' + s.namespace + '-prev">Prev</a></li>', "</ul>"].join(""),
                            u = {
                                nextSlide: "." + s.namespace + "-next",
                                prevSlide: "." + s.namespace + "-prev"
                            };
                        s = e.extend(s, u);
                        n.prepend(o)
                    })
                },
                addPagination: function () {
                    o.each(function (t) {
                        var r = e(this),
                            i = e('<ol class="' + s.namespace + '-tabs" role="tablist navigation" />'),
                            o = r.find(s.slider),
                            u = r.find(s.slide);
                        slideNum = u.length, associated = "carousel-" + n + "-" + t;
                        while (slideNum--) {
                            var a = u.eq(slideNum).find(s.slideHed).text() || "Page " + (slideNum + 1),
                                f = ['<li role="presentation">', '<a href="#' + associated + "-slide" + slideNum + '"', ' aria-controls="' + associated + "-slide" + slideNum + '"', ' id="' + associated + "-tab" + slideNum + '" role="tab">' + a + "</a>", "</li>"].join("");
                            i.prepend(f)
                        }
                        i.appendTo(r).find("li").keydown(function (t) {
                            var n = e(this),
                                r = n.prev().find("a"),
                                i = n.next().find("a");
                            switch (t.which) {
                            case 37:
                            case 38:
                                r.length && r.trigger("click").focus();
                                t.preventDefault();
                                break;
                            case 39:
                            case 40:
                                i.length && i.trigger("click").focus();
                                t.preventDefault();
                                break
                            }
                        }).find("a").click(function (t) {
                            var n = e(this);
                            if (n.attr("aria-selected") == "false") {
                                var i = n.parent().index(),
                                    o = -(100 * i),
                                    u = r.find(s.slider);
                                u.trigger("carouselmove", {
                                    moveTo: o
                                })
                            }
                            t.preventDefault()
                        })
                    })
                },
                roundDown: function (e) {
                    var t = parseInt(e, 10);
                    return Math.ceil((t - t % 100) / 100) * 100
                },
                navState: function (t, n) {
                    var r = e(this),
                        i = r.find(s.slide),
                        o = -(n.current / 100),
                        u = i.eq(o);
                    r.attr("aria-activedescendant", u[0].id);
                    u.addClass(s.namespace + "-active-slide").attr("aria-hidden", false).siblings().removeClass(s.namespace + "-active-slide").attr("aria-hidden", true);
                    if ( !! s.prevSlide || !! s.nextSlide) {
                        var a = e('[href*="#' + this.id + '"]');
                        a.removeClass(s.namespace + "-disabled");
                        if (!s.backToStart) {
                            if (o == 0) {
                                a.filter(s.prevSlide).addClass(s.namespace + "-disabled")
                            } else if (o == i.length - 1) {
                                a.filter(s.nextSlide).addClass(s.namespace + "-disabled")
                            }
                        }
                    }
                    if ( !! s.addPagination) {
                        var f = u.attr("aria-labelledby"),
                            l = e("#" + f);
                        l.parent().addClass(s.namespace + "-active-tab").siblings().removeClass(s.namespace + "-active-tab").find("a").attr({
                            "aria-selected": false,
                            tabindex: -1
                        });
                        l.attr({
                            "aria-selected": true,
                            tabindex: 0
                        })
                    }
                },
                move: function (t, n) {
                    var r = e(this);
                    r.trigger(s.namespace + "-beforemove").trigger("navstate", {
                        current: n.moveTo
                    });
                    if (a()) {
                        r.adjRounding(s.slide).css("marginLeft", n.moveTo + "%").one("transitionend webkitTransitionEnd OTransitionEnd", function () {
                            e(this).trigger(s.namespace + "-aftermove")
                        })
                    } else {
                        r.adjRounding(s.slide).animate({
                            marginLeft: n.moveTo + "%"
                        }, {
                            duration: s.speed,
                            queue: false
                        }, function () {
                            e(this).trigger(s.namespace + "-aftermove")
                        })
                    }
                },
                nextPrev: function (t, n) {
                    var r = e(this),
                        i = r ? r.getPercentage() : 0,
                        o = r.find(s.slide),
                        u = n.dir === "prev" ? i != 0 : -i < (o.length - 1) * 100,
                        a = e('[href="#' + this.id + '"]');
                    if (!r.is(":animated") && u) {
                        if (n.dir === "prev") {
                            i = i % 100 != 0 ? f.roundDown(i) : i + 100
                        } else {
                            i = i % 100 != 0 ? f.roundDown(i) - 100 : i - 100
                        }
                        r.trigger("carouselmove", {
                            moveTo: i
                        });
                        a.removeClass(s.namespace + "-disabled").removeAttr("aria-disabled");
                        if (!s.backToStart) {
                            switch (i) {
                            case -(o.length - 1) * 100:
                                a.filter(s.nextSlide).addClass(s.namespace + "-disabled").attr("aria-disabled", true);
                                break;
                            case 0:
                                a.filter(s.prevSlide).addClass(s.namespace + "-disabled").attr("aria-disabled", true);
                                break
                            }
                        }
                    } else {
                        var l = f.roundDown(i);
                        if (s.backToStart) {
                            if (n.dir === "next") {
                                i = 0
                            } else if (n.dir === "prev" && n.event === "notauto") {
                                i = -(o.length - 1) * 100
                            }
                            r.trigger("carouselmove", {
                                moveTo: i
                            })
                        } else {
                            r.trigger("carouselmove", {
                                moveTo: l
                            })
                        }
                    }
                }
            };
        f.init(this);
        e(s.nextSlide + "," + s.prevSlide).bind("click", function (t) {
            var n = e(this),
                r = this.hash,
                i = n.is(s.prevSlide) ? "prev" : "next",
                o = e(r),
                u = "";
            if (n.is("." + s.namespace + "-disabled")) {
                return false
            }
            if (s.backToStart) {
                u = "notauto"
            } else {
                u = ""
            }
            o.trigger("nextprev", {
                dir: i,
                event: u
            });
            t.preventDefault()
        }).bind("keydown", function (t) {
            var n = e(this),
                r = this.hash,
                i = "";
            if (s.backToStart) {
                i = "notauto"
            } else {
                i = ""
            }
            switch (t.which) {
            case 37:
            case 38:
                e("#" + r).trigger("nextprev", {
                    dir: "next",
                    event: i
                });
                t.preventDefault();
                break;
            case 39:
            case 40:
                e("#" + r).trigger("nextprev", {
                    dir: "prev",
                    event: i
                });
                t.preventDefault();
                break
            }
        });
        var l = {
            wrap: this,
            slider: s.slider
        };
        o.bind("dragSnap", l, function (t, n) {
            var r = e(this).find(s.slider),
                i = n.direction === "left" ? "next" : "prev",
                o = "";
            if (s.backToStart) {
                o = "notauto"
            } else {
                o = ""
            }
            r.trigger("nextprev", {
                dir: i,
                event: o
            })
        });
        o.filter("[data-autorotate]").each(function () {
            var t, n = e(this),
                r = n.attr("data-autorotate"),
                i = n.find(s.slide).length,
                o = function () {
                    var u = n.find(s.slider),
                        a = -(e(s.slider).getPercentage() / 100) + 1;
                    switch (a) {
                    case i:
                        clearInterval(t);
                        t = setInterval(function () {
                            o();
                            u.trigger("nextprev", {
                                dir: "prev"
                            })
                        }, r);
                        break;
                    case 1:
                        clearInterval(t);
                        t = setInterval(function () {
                            o();
                            u.trigger("nextprev", {
                                dir: "next"
                            })
                        }, r);
                        break
                    }
                };
            t = setInterval(o, r)
        });
        return this
    };
    e.event.special.dragSnap = {
        setup: function (n) {
            var r = e(this),
                i = function (e, t) {
                    var n = .3,
                        r = t ? "margin-left " + n + "s ease" : "none";
                    e.css({
                        "-webkit-transition": r,
                        "-moz-transition": r,
                        "-ms-transition": r,
                        "-o-transition": r,
                        transition: r
                    })
                }, s = function (e) {
                    var e = parseInt(e, 10);
                    return Math.ceil((e - e % 100) / 100) * 100
                }, o = function (e, n) {
                    var r = n.target,
                        o = r.attr("style") != t ? r.getPercentage() : 0,
                        u = n.left === false ? s(o) - 100 : s(o),
                        a = document.body,
                        f = function () {
                            a.setAttribute("style", "transition:top 1s ease;-webkit-transition:top 1s ease;-moz-transition:top 1s ease;");
                            var e = !! (a.style.transition || a.style.webkitTransition || a.style.MozTransition);
                            return e
                        };
                    i(r, true);
                    if (f()) {
                        r.css("marginLeft", u + "%")
                    } else {
                        r.animate({
                            marginLeft: u + "%"
                        }, opt.speed)
                    }
                };
            r.bind("snapback", o).bind("touchstart", function (s) {
                function h(e) {
                    var t = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                    f = {
                        time: +(new Date),
                        coords: [t.pageX, t.pageY]
                    }, deltaX = Math.abs(a.coords[0] - t.pageX), deltaY = Math.abs(a.coords[1] - t.pageY);
                    if (!a || deltaX < deltaY || deltaX < 55) {
                        return
                    }
                    if (deltaX >= 55) {
                        a.interacting = true;
                        l.css({
                            "margin-left": c + (f.coords[0] - a.coords[0]) / a.origin.width() * 100 + "%"
                        });
                        e.preventDefault()
                    } else {
                        return
                    }
                }
                var o = s.originalEvent.touches ? s.originalEvent.touches[0] : s,
                    u = e(s.target),
                    a = {
                        time: +(new Date),
                        coords: [o.pageX, o.pageY],
                        origin: u.closest(n.wrap),
                        interacting: false
                    }, f, l = u.closest(n.slider),
                    c = l.attr("style") != t ? l.getPercentage() : 0;
                i(l, false);
                r.bind("gesturestart", function (e) {
                    r.unbind("touchmove", h).unbind("touchend", h)
                }).bind("touchmove", h).one("touchend", function (e) {
                    r.unbind("touchmove", h);
                    i(l, true);
                    if (a && f) {
                        var n = Math.abs(a.coords[0] - f.coords[0]),
                            s = Math.abs(a.coords[1] - f.coords[1]),
                            o = a.coords[0] > f.coords[0],
                            u;
                        if (n > 20 && n > s) {
                            e.preventDefault()
                        } else {
                            if (a.interacting) {
                                r.trigger("snapback", {
                                    target: l,
                                    left: o
                                })
                            }
                            return
                        }
                        u = a.origin.width() / 4;
                        if (-n > u || n > u) {
                            a.origin.trigger("dragSnap", {
                                direction: o ? "left" : "right"
                            })
                        } else {
                            r.trigger("snapback", {
                                target: l,
                                left: o
                            })
                        }
                    }
                    a = f = t
                })
            })
        }
    }
})(jQuery);
(function (e, t, n, r) {
    "use strict";
    var i = n("html"),
        s = n(e),
        o = n(t),
        u = n.fancybox = function () {
            u.open.apply(this, arguments)
        }, a = navigator.userAgent.match(/msie/i),
        f = null,
        l = t.createTouch !== r,
        c = function (e) {
            return e && e.hasOwnProperty && e instanceof n
        }, h = function (e) {
            return e && n.type(e) === "string"
        }, p = function (e) {
            return h(e) && e.indexOf("%") > 0
        }, d = function (e) {
            return e && !(e.style.overflow && e.style.overflow === "hidden") && (e.clientWidth && e.scrollWidth > e.clientWidth || e.clientHeight && e.scrollHeight > e.clientHeight)
        }, v = function (e, t) {
            var n = parseInt(e, 10) || 0;
            if (t && p(e)) {
                n = u.getViewport()[t] / 100 * n
            }
            return Math.ceil(n)
        }, m = function (e, t) {
            return v(e, t) + "px"
        };
    n.extend(u, {
        version: "2.1.5",
        defaults: {
            padding: 15,
            margin: 20,
            width: 800,
            height: 600,
            minWidth: 100,
            minHeight: 100,
            maxWidth: 9999,
            maxHeight: 9999,
            pixelRatio: 1,
            autoSize: true,
            autoHeight: false,
            autoWidth: false,
            autoResize: true,
            autoCenter: !l,
            fitToView: true,
            aspectRatio: false,
            topRatio: .5,
            leftRatio: .5,
            scrolling: "auto",
            wrapCSS: "",
            arrows: true,
            closeBtn: true,
            closeClick: false,
            nextClick: false,
            mouseWheel: true,
            autoPlay: false,
            playSpeed: 3e3,
            preload: 3,
            modal: false,
            loop: true,
            ajax: {
                dataType: "html",
                headers: {
                    "X-fancyBox": true
                }
            },
            iframe: {
                scrolling: "auto",
                preload: true
            },
            swf: {
                wmode: "transparent",
                allowfullscreen: "true",
                allowscriptaccess: "always"
            },
            keys: {
                next: {
                    13: "left",
                    34: "up",
                    39: "left",
                    40: "up"
                },
                prev: {
                    8: "right",
                    33: "down",
                    37: "right",
                    38: "down"
                },
                close: [27],
                play: [32],
                toggle: [70]
            },
            direction: {
                next: "left",
                prev: "right"
            },
            scrollOutside: true,
            index: 0,
            type: null,
            href: null,
            content: null,
            title: null,
            tpl: {
                wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                image: '<img class="fancybox-image" src="{href}" alt="" />',
                iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (a ? ' allowtransparency="true"' : "") + "></iframe>",
                error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
            },
            openEffect: "fade",
            openSpeed: 250,
            openEasing: "swing",
            openOpacity: true,
            openMethod: "zoomIn",
            closeEffect: "fade",
            closeSpeed: 250,
            closeEasing: "swing",
            closeOpacity: true,
            closeMethod: "zoomOut",
            nextEffect: "elastic",
            nextSpeed: 250,
            nextEasing: "swing",
            nextMethod: "changeIn",
            prevEffect: "elastic",
            prevSpeed: 250,
            prevEasing: "swing",
            prevMethod: "changeOut",
            helpers: {
                overlay: true,
                title: true
            },
            onCancel: n.noop,
            beforeLoad: n.noop,
            afterLoad: n.noop,
            beforeShow: n.noop,
            afterShow: n.noop,
            beforeChange: n.noop,
            beforeClose: n.noop,
            afterClose: n.noop
        },
        group: {},
        opts: {},
        previous: null,
        coming: null,
        current: null,
        isActive: false,
        isOpen: false,
        isOpened: false,
        wrap: null,
        skin: null,
        outer: null,
        inner: null,
        player: {
            timer: null,
            isActive: false
        },
        ajaxLoad: null,
        imgPreload: null,
        transitions: {},
        helpers: {},
        open: function (e, t) {
            if (!e) {
                return
            }
            if (!n.isPlainObject(t)) {
                t = {}
            }
            if (false === u.close(true)) {
                return
            }
            if (!n.isArray(e)) {
                e = c(e) ? n(e).get() : [e]
            }
            n.each(e, function (i, s) {
                var o = {}, a, f, l, p, d, v, m;
                if (n.type(s) === "object") {
                    if (s.nodeType) {
                        s = n(s)
                    }
                    if (c(s)) {
                        o = {
                            href: s.data("fancybox-href") || s.attr("href"),
                            title: s.data("fancybox-title") || s.attr("title"),
                            isDom: true,
                            element: s
                        };
                        if (n.metadata) {
                            n.extend(true, o, s.metadata())
                        }
                    } else {
                        o = s
                    }
                }
                a = t.href || o.href || (h(s) ? s : null);
                f = t.title !== r ? t.title : o.title || "";
                l = t.content || o.content;
                p = l ? "html" : t.type || o.type;
                if (!p && o.isDom) {
                    p = s.data("fancybox-type");
                    if (!p) {
                        d = s.prop("class").match(/fancybox\.(\w+)/);
                        p = d ? d[1] : null
                    }
                }
                if (h(a)) {
                    if (!p) {
                        if (u.isImage(a)) {
                            p = "image"
                        } else if (u.isSWF(a)) {
                            p = "swf"
                        } else if (a.charAt(0) === "#") {
                            p = "inline"
                        } else if (h(s)) {
                            p = "html";
                            l = s
                        }
                    }
                    if (p === "ajax") {
                        v = a.split(/\s+/, 2);
                        a = v.shift();
                        m = v.shift()
                    }
                }
                if (!l) {
                    if (p === "inline") {
                        if (a) {
                            l = n(h(a) ? a.replace(/.*(?=#[^\s]+$)/, "") : a)
                        } else if (o.isDom) {
                            l = s
                        }
                    } else if (p === "html") {
                        l = a
                    } else if (!p && !a && o.isDom) {
                        p = "inline";
                        l = s
                    }
                }
                n.extend(o, {
                    href: a,
                    type: p,
                    content: l,
                    title: f,
                    selector: m
                });
                e[i] = o
            });
            u.opts = n.extend(true, {}, u.defaults, t);
            if (t.keys !== r) {
                u.opts.keys = t.keys ? n.extend({}, u.defaults.keys, t.keys) : false
            }
            u.group = e;
            return u._start(u.opts.index)
        },
        cancel: function () {
            var e = u.coming;
            if (!e || false === u.trigger("onCancel")) {
                return
            }
            u.hideLoading();
            if (u.ajaxLoad) {
                u.ajaxLoad.abort()
            }
            u.ajaxLoad = null;
            if (u.imgPreload) {
                u.imgPreload.onload = u.imgPreload.onerror = null
            }
            if (e.wrap) {
                e.wrap.stop(true, true).trigger("onReset").remove()
            }
            u.coming = null;
            if (!u.current) {
                u._afterZoomOut(e)
            }
        },
        close: function (e) {
            u.cancel();
            if (false === u.trigger("beforeClose")) {
                return
            }
            u.unbindEvents();
            if (!u.isActive) {
                return
            }
            if (!u.isOpen || e === true) {
                n(".fancybox-wrap").stop(true).trigger("onReset").remove();
                u._afterZoomOut()
            } else {
                u.isOpen = u.isOpened = false;
                u.isClosing = true;
                n(".fancybox-item, .fancybox-nav").remove();
                u.wrap.stop(true, true).removeClass("fancybox-opened");
                u.transitions[u.current.closeMethod]()
            }
        },
        play: function (e) {
            var t = function () {
                clearTimeout(u.player.timer)
            }, n = function () {
                    t();
                    if (u.current && u.player.isActive) {
                        u.player.timer = setTimeout(u.next, u.current.playSpeed)
                    }
                }, r = function () {
                    t();
                    o.unbind(".player");
                    u.player.isActive = false;
                    u.trigger("onPlayEnd")
                }, i = function () {
                    if (u.current && (u.current.loop || u.current.index < u.group.length - 1)) {
                        u.player.isActive = true;
                        o.bind({
                            "onCancel.player beforeClose.player": r,
                            "onUpdate.player": n,
                            "beforeLoad.player": t
                        });
                        n();
                        u.trigger("onPlayStart")
                    }
                };
            if (e === true || !u.player.isActive && e !== false) {
                i()
            } else {
                r()
            }
        },
        next: function (e) {
            var t = u.current;
            if (t) {
                if (!h(e)) {
                    e = t.direction.next
                }
                u.jumpto(t.index + 1, e, "next")
            }
        },
        prev: function (e) {
            var t = u.current;
            if (t) {
                if (!h(e)) {
                    e = t.direction.prev
                }
                u.jumpto(t.index - 1, e, "prev")
            }
        },
        jumpto: function (e, t, n) {
            var i = u.current;
            if (!i) {
                return
            }
            e = v(e);
            u.direction = t || i.direction[e >= i.index ? "next" : "prev"];
            u.router = n || "jumpto";
            if (i.loop) {
                if (e < 0) {
                    e = i.group.length + e % i.group.length
                }
                e = e % i.group.length
            }
            if (i.group[e] !== r) {
                u.cancel();
                u._start(e)
            }
        },
        reposition: function (e, t) {
            var r = u.current,
                i = r ? r.wrap : null,
                s;
            if (i) {
                s = u._getPosition(t);
                if (e && e.type === "scroll") {
                    delete s.position;
                    i.stop(true, true).animate(s, 200)
                } else {
                    i.css(s);
                    r.pos = n.extend({}, r.dim, s)
                }
            }
        },
        update: function (e) {
            var t = e && e.type,
                n = !t || t === "orientationchange";
            if (n) {
                clearTimeout(f);
                f = null
            }
            if (!u.isOpen || f) {
                return
            }
            f = setTimeout(function () {
                var r = u.current;
                if (!r || u.isClosing) {
                    return
                }
                u.wrap.removeClass("fancybox-tmp");
                if (n || t === "load" || t === "resize" && r.autoResize) {
                    u._setDimension()
                }
                if (!(t === "scroll" && r.canShrink)) {
                    u.reposition(e)
                }
                u.trigger("onUpdate");
                f = null
            }, n && !l ? 0 : 300)
        },
        toggle: function (e) {
            if (u.isOpen) {
                u.current.fitToView = n.type(e) === "boolean" ? e : !u.current.fitToView;
                if (l) {
                    u.wrap.removeAttr("style").addClass("fancybox-tmp");
                    u.trigger("onUpdate")
                }
                u.update()
            }
        },
        hideLoading: function () {
            o.unbind(".loading");
            n("#fancybox-loading").remove()
        },
        showLoading: function () {
            var e, t;
            u.hideLoading();
            e = n('<div id="fancybox-loading"><div></div></div>').click(u.cancel).appendTo("body");
            o.bind("keydown.loading", function (e) {
                if ((e.which || e.keyCode) === 27) {
                    e.preventDefault();
                    u.cancel()
                }
            });
            if (!u.defaults.fixed) {
                t = u.getViewport();
                e.css({
                    position: "absolute",
                    top: t.h * .5 + t.y,
                    left: t.w * .5 + t.x
                })
            }
        },
        getViewport: function () {
            var t = u.current && u.current.locked || false,
                n = {
                    x: s.scrollLeft(),
                    y: s.scrollTop()
                };
            if (t) {
                n.w = t[0].clientWidth;
                n.h = t[0].clientHeight
            } else {
                n.w = l && e.innerWidth ? e.innerWidth : s.width();
                n.h = l && e.innerHeight ? e.innerHeight : s.height()
            }
            return n
        },
        unbindEvents: function () {
            if (u.wrap && c(u.wrap)) {
                u.wrap.unbind(".fb")
            }
            o.unbind(".fb");
            s.unbind(".fb")
        },
        bindEvents: function () {
            var e = u.current,
                t;
            if (!e) {
                return
            }
            s.bind("orientationchange.fb" + (l ? "" : " resize.fb") + (e.autoCenter && !e.locked ? " scroll.fb" : ""), u.update);
            t = e.keys;
            if (t) {
                o.bind("keydown.fb", function (i) {
                    var s = i.which || i.keyCode,
                        o = i.target || i.srcElement;
                    if (s === 27 && u.coming) {
                        return false
                    }
                    if (!i.ctrlKey && !i.altKey && !i.shiftKey && !i.metaKey && !(o && (o.type || n(o).is("[contenteditable]")))) {
                        n.each(t, function (t, o) {
                            if (e.group.length > 1 && o[s] !== r) {
                                u[t](o[s]);
                                i.preventDefault();
                                return false
                            }
                            if (n.inArray(s, o) > -1) {
                                u[t]();
                                i.preventDefault();
                                return false
                            }
                        })
                    }
                })
            }
            if (n.fn.mousewheel && e.mouseWheel) {
                u.wrap.bind("mousewheel.fb", function (t, r, i, s) {
                    var o = t.target || null,
                        a = n(o),
                        f = false;
                    while (a.length) {
                        if (f || a.is(".fancybox-skin") || a.is(".fancybox-wrap")) {
                            break
                        }
                        f = d(a[0]);
                        a = n(a).parent()
                    }
                    if (r !== 0 && !f) {
                        if (u.group.length > 1 && !e.canShrink) {
                            if (s > 0 || i > 0) {
                                u.prev(s > 0 ? "down" : "left")
                            } else if (s < 0 || i < 0) {
                                u.next(s < 0 ? "up" : "right")
                            }
                            t.preventDefault()
                        }
                    }
                })
            }
        },
        trigger: function (e, t) {
            var r, i = t || u.coming || u.current;
            if (!i) {
                return
            }
            if (n.isFunction(i[e])) {
                r = i[e].apply(i, Array.prototype.slice.call(arguments, 1))
            }
            if (r === false) {
                return false
            }
            if (i.helpers) {
                n.each(i.helpers, function (t, r) {
                    if (r && u.helpers[t] && n.isFunction(u.helpers[t][e])) {
                        u.helpers[t][e](n.extend(true, {}, u.helpers[t].defaults, r), i)
                    }
                })
            }
            o.trigger(e)
        },
        isImage: function (e) {
            return h(e) && e.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)
        },
        isSWF: function (e) {
            return h(e) && e.match(/\.(swf)((\?|#).*)?$/i)
        },
        _start: function (e) {
            var t = {}, r, i, s, o, a;
            e = v(e);
            r = u.group[e] || null;
            if (!r) {
                return false
            }
            t = n.extend(true, {}, u.opts, r);
            o = t.margin;
            a = t.padding;
            if (n.type(o) === "number") {
                t.margin = [o, o, o, o]
            }
            if (n.type(a) === "number") {
                t.padding = [a, a, a, a]
            }
            if (t.modal) {
                n.extend(true, t, {
                    closeBtn: false,
                    closeClick: false,
                    nextClick: false,
                    arrows: false,
                    mouseWheel: false,
                    keys: null,
                    helpers: {
                        overlay: {
                            closeClick: false
                        }
                    }
                })
            }
            if (t.autoSize) {
                t.autoWidth = t.autoHeight = true
            }
            if (t.width === "auto") {
                t.autoWidth = true
            }
            if (t.height === "auto") {
                t.autoHeight = true
            }
            t.group = u.group;
            t.index = e;
            u.coming = t;
            if (false === u.trigger("beforeLoad")) {
                u.coming = null;
                return
            }
            s = t.type;
            i = t.href;
            if (!s) {
                u.coming = null;
                if (u.current && u.router && u.router !== "jumpto") {
                    u.current.index = e;
                    return u[u.router](u.direction)
                }
                return false
            }
            u.isActive = true;
            if (s === "image" || s === "swf") {
                t.autoHeight = t.autoWidth = false;
                t.scrolling = "visible"
            }
            if (s === "image") {
                t.aspectRatio = true
            }
            if (s === "iframe" && l) {
                t.scrolling = "scroll"
            }
            t.wrap = n(t.tpl.wrap).addClass("fancybox-" + (l ? "mobile" : "desktop") + " fancybox-type-" + s + " fancybox-tmp " + t.wrapCSS).appendTo(t.parent || "body");
            n.extend(t, {
                skin: n(".fancybox-skin", t.wrap),
                outer: n(".fancybox-outer", t.wrap),
                inner: n(".fancybox-inner", t.wrap)
            });
            n.each(["Top", "Right", "Bottom", "Left"], function (e, n) {
                t.skin.css("padding" + n, m(t.padding[e]))
            });
            u.trigger("onReady");
            if (s === "inline" || s === "html") {
                if (!t.content || !t.content.length) {
                    return u._error("content")
                }
            } else if (!i) {
                return u._error("href")
            }
            if (s === "image") {
                u._loadImage()
            } else if (s === "ajax") {
                u._loadAjax()
            } else if (s === "iframe") {
                u._loadIframe()
            } else {
                u._afterLoad()
            }
        },
        _error: function (e) {
            n.extend(u.coming, {
                type: "html",
                autoWidth: true,
                autoHeight: true,
                minWidth: 0,
                minHeight: 0,
                scrolling: "no",
                hasError: e,
                content: u.coming.tpl.error
            });
            u._afterLoad()
        },
        _loadImage: function () {
            var e = u.imgPreload = new Image;
            e.onload = function () {
                this.onload = this.onerror = null;
                u.coming.width = this.width / u.opts.pixelRatio;
                u.coming.height = this.height / u.opts.pixelRatio;
                u._afterLoad()
            };
            e.onerror = function () {
                this.onload = this.onerror = null;
                u._error("image")
            };
            e.src = u.coming.href;
            if (e.complete !== true) {
                u.showLoading()
            }
        },
        _loadAjax: function () {
            var e = u.coming;
            u.showLoading();
            u.ajaxLoad = n.ajax(n.extend({}, e.ajax, {
                url: e.href,
                error: function (e, t) {
                    if (u.coming && t !== "abort") {
                        u._error("ajax", e)
                    } else {
                        u.hideLoading()
                    }
                },
                success: function (t, n) {
                    if (n === "success") {
                        e.content = t;
                        u._afterLoad()
                    }
                }
            }))
        },
        _loadIframe: function () {
            var e = u.coming,
                t = n(e.tpl.iframe.replace(/\{rnd\}/g, (new Date).getTime())).attr("scrolling", l ? "auto" : e.iframe.scrolling).attr("src", e.href);
            n(e.wrap).bind("onReset", function () {
                try {
                    n(this).find("iframe").hide().attr("src", "//about:blank").end().empty()
                } catch (e) {}
            });
            if (e.iframe.preload) {
                u.showLoading();
                t.one("load", function () {
                    n(this).data("ready", 1);
                    if (!l) {
                        n(this).bind("load.fb", u.update)
                    }
                    n(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();
                    u._afterLoad()
                })
            }
            e.content = t.appendTo(e.inner);
            if (!e.iframe.preload) {
                u._afterLoad()
            }
        },
        _preloadImages: function () {
            var e = u.group,
                t = u.current,
                n = e.length,
                r = t.preload ? Math.min(t.preload, n - 1) : 0,
                i, s;
            for (s = 1; s <= r; s += 1) {
                i = e[(t.index + s) % n];
                if (i.type === "image" && i.href) {
                    (new Image).src = i.href
                }
            }
        },
        _afterLoad: function () {
            var e = u.coming,
                t = u.current,
                r = "fancybox-placeholder",
                i, s, o, a, f, l;
            u.hideLoading();
            if (!e || u.isActive === false) {
                return
            }
            if (false === u.trigger("afterLoad", e, t)) {
                e.wrap.stop(true).trigger("onReset").remove();
                u.coming = null;
                return
            }
            if (t) {
                u.trigger("beforeChange", t);
                t.wrap.stop(true).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove()
            }
            u.unbindEvents();
            i = e;
            s = e.content;
            o = e.type;
            a = e.scrolling;
            n.extend(u, {
                wrap: i.wrap,
                skin: i.skin,
                outer: i.outer,
                inner: i.inner,
                current: i,
                previous: t
            });
            f = i.href;
            switch (o) {
            case "inline":
            case "ajax":
            case "html":
                if (i.selector) {
                    s = n("<div>").html(s).find(i.selector)
                } else if (c(s)) {
                    if (!s.data(r)) {
                        s.data(r, n('<div class="' + r + '"></div>').insertAfter(s).hide())
                    }
                    s = s.show().detach();
                    i.wrap.bind("onReset", function () {
                        if (n(this).find(s).length) {
                            s.hide().replaceAll(s.data(r)).data(r, false)
                        }
                    })
                }
                break;
            case "image":
                s = i.tpl.image.replace("{href}", f);
                break;
            case "swf":
                s = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + f + '"></param>';
                l = "";
                n.each(i.swf, function (e, t) {
                    s += '<param name="' + e + '" value="' + t + '"></param>';
                    l += " " + e + '="' + t + '"'
                });
                s += '<embed src="' + f + '" type="application/x-shockwave-flash" width="100%" height="100%"' + l + "></embed></object>";
                break
            }
            if (!(c(s) && s.parent().is(i.inner))) {
                i.inner.append(s)
            }
            u.trigger("beforeShow");
            i.inner.css("overflow", a === "yes" ? "scroll" : a === "no" ? "hidden" : a);
            u._setDimension();
            u.reposition();
            u.isOpen = false;
            u.coming = null;
            u.bindEvents();
            if (!u.isOpened) {
                n(".fancybox-wrap").not(i.wrap).stop(true).trigger("onReset").remove()
            } else if (t.prevMethod) {
                u.transitions[t.prevMethod]()
            }
            u.transitions[u.isOpened ? i.nextMethod : i.openMethod]();
            u._preloadImages()
        },
        _setDimension: function () {
            var e = u.getViewport(),
                t = 0,
                r = false,
                i = false,
                s = u.wrap,
                o = u.skin,
                a = u.inner,
                f = u.current,
                l = f.width,
                c = f.height,
                h = f.minWidth,
                d = f.minHeight,
                g = f.maxWidth,
                y = f.maxHeight,
                b = f.scrolling,
                w = f.scrollOutside ? f.scrollbarWidth : 0,
                E = f.margin,
                S = v(E[1] + E[3]),
                x = v(E[0] + E[2]),
                T, N, C, k, L, A, O, M, _, D, P, H, B, j, I;
            s.add(o).add(a).width("auto").height("auto").removeClass("fancybox-tmp");
            T = v(o.outerWidth(true) - o.width());
            N = v(o.outerHeight(true) - o.height());
            C = S + T;
            k = x + N;
            L = p(l) ? (e.w - C) * v(l) / 100 : l;
            A = p(c) ? (e.h - k) * v(c) / 100 : c;
            if (f.type === "iframe") {
                j = f.content;
                if (f.autoHeight && j.data("ready") === 1) {
                    try {
                        if (j[0].contentWindow.document.location) {
                            a.width(L).height(9999);
                            I = j.contents().find("body");
                            if (w) {
                                I.css("overflow-x", "hidden")
                            }
                            A = I.outerHeight(true)
                        }
                    } catch (q) {}
                }
            } else if (f.autoWidth || f.autoHeight) {
                a.addClass("fancybox-tmp");
                if (!f.autoWidth) {
                    a.width(L)
                }
                if (!f.autoHeight) {
                    a.height(A)
                }
                if (f.autoWidth) {
                    L = a.width()
                }
                if (f.autoHeight) {
                    A = a.height()
                }
                a.removeClass("fancybox-tmp")
            }
            l = v(L);
            c = v(A);
            _ = L / A;
            h = v(p(h) ? v(h, "w") - C : h);
            g = v(p(g) ? v(g, "w") - C : g);
            d = v(p(d) ? v(d, "h") - k : d);
            y = v(p(y) ? v(y, "h") - k : y);
            O = g;
            M = y;
            if (f.fitToView) {
                g = Math.min(e.w - C, g);
                y = Math.min(e.h - k, y)
            }
            H = e.w - S;
            B = e.h - x;
            if (f.aspectRatio) {
                if (l > g) {
                    l = g;
                    c = v(l / _)
                }
                if (c > y) {
                    c = y;
                    l = v(c * _)
                }
                if (l < h) {
                    l = h;
                    c = v(l / _)
                }
                if (c < d) {
                    c = d;
                    l = v(c * _)
                }
            } else {
                l = Math.max(h, Math.min(l, g));
                if (f.autoHeight && f.type !== "iframe") {
                    a.width(l);
                    c = a.height()
                }
                c = Math.max(d, Math.min(c, y))
            } if (f.fitToView) {
                a.width(l).height(c);
                s.width(l + T);
                D = s.width();
                P = s.height();
                if (f.aspectRatio) {
                    while ((D > H || P > B) && l > h && c > d) {
                        if (t++ > 19) {
                            break
                        }
                        c = Math.max(d, Math.min(y, c - 10));
                        l = v(c * _);
                        if (l < h) {
                            l = h;
                            c = v(l / _)
                        }
                        if (l > g) {
                            l = g;
                            c = v(l / _)
                        }
                        a.width(l).height(c);
                        s.width(l + T);
                        D = s.width();
                        P = s.height()
                    }
                } else {
                    l = Math.max(h, Math.min(l, l - (D - H)));
                    c = Math.max(d, Math.min(c, c - (P - B)))
                }
            }
            if (w && b === "auto" && c < A && l + T + w < H) {
                l += w
            }
            a.width(l).height(c);
            s.width(l + T);
            D = s.width();
            P = s.height();
            r = (D > H || P > B) && l > h && c > d;
            i = f.aspectRatio ? l < O && c < M && l < L && c < A : (l < O || c < M) && (l < L || c < A);
            n.extend(f, {
                dim: {
                    width: m(D),
                    height: m(P)
                },
                origWidth: L,
                origHeight: A,
                canShrink: r,
                canExpand: i,
                wPadding: T,
                hPadding: N,
                wrapSpace: P - o.outerHeight(true),
                skinSpace: o.height() - c
            });
            if (!j && f.autoHeight && c > d && c < y && !i) {
                a.height("auto")
            }
        },
        _getPosition: function (e) {
            var t = u.current,
                n = u.getViewport(),
                r = t.margin,
                i = u.wrap.width() + r[1] + r[3],
                s = u.wrap.height() + r[0] + r[2],
                o = {
                    position: "absolute",
                    top: r[0],
                    left: r[3]
                };
            if (t.autoCenter && t.fixed && !e && s <= n.h && i <= n.w) {
                o.position = "fixed"
            } else if (!t.locked) {
                o.top += n.y;
                o.left += n.x
            }
            o.top = m(Math.max(o.top, o.top + (n.h - s) * t.topRatio));
            o.left = m(Math.max(o.left, o.left + (n.w - i) * t.leftRatio));
            return o
        },
        _afterZoomIn: function () {
            var e = u.current;
            if (!e) {
                return
            }
            u.isOpen = u.isOpened = true;
            u.wrap.css("overflow", "visible").addClass("fancybox-opened");
            u.update();
            if (e.closeClick || e.nextClick && u.group.length > 1) {
                u.inner.css("cursor", "pointer").bind("click.fb", function (t) {
                    if (!n(t.target).is("a") && !n(t.target).parent().is("a")) {
                        t.preventDefault();
                        u[e.closeClick ? "close" : "next"]()
                    }
                })
            }
            if (e.closeBtn) {
                n(e.tpl.closeBtn).appendTo(u.skin).bind("click.fb", function (e) {
                    e.preventDefault();
                    u.close()
                })
            }
            if (e.arrows && u.group.length > 1) {
                if (e.loop || e.index > 0) {
                    n(e.tpl.prev).appendTo(u.outer).bind("click.fb", u.prev)
                }
                if (e.loop || e.index < u.group.length - 1) {
                    n(e.tpl.next).appendTo(u.outer).bind("click.fb", u.next)
                }
            }
            u.trigger("afterShow");
            if (!e.loop && e.index === e.group.length - 1) {
                u.play(false)
            } else if (u.opts.autoPlay && !u.player.isActive) {
                u.opts.autoPlay = false;
                u.play()
            }
        },
        _afterZoomOut: function (e) {
            e = e || u.current;
            n(".fancybox-wrap").trigger("onReset").remove();
            n.extend(u, {
                group: {},
                opts: {},
                router: false,
                current: null,
                isActive: false,
                isOpened: false,
                isOpen: false,
                isClosing: false,
                wrap: null,
                skin: null,
                outer: null,
                inner: null
            });
            u.trigger("afterClose", e)
        }
    });
    u.transitions = {
        getOrigPosition: function () {
            var e = u.current,
                t = e.element,
                n = e.orig,
                r = {}, i = 50,
                s = 50,
                o = e.hPadding,
                a = e.wPadding,
                f = u.getViewport();
            if (!n && e.isDom && t.is(":visible")) {
                n = t.find("img:first");
                if (!n.length) {
                    n = t
                }
            }
            if (c(n)) {
                r = n.offset();
                if (n.is("img")) {
                    i = n.outerWidth();
                    s = n.outerHeight()
                }
            } else {
                r.top = f.y + (f.h - s) * e.topRatio;
                r.left = f.x + (f.w - i) * e.leftRatio
            } if (u.wrap.css("position") === "fixed" || e.locked) {
                r.top -= f.y;
                r.left -= f.x
            }
            r = {
                top: m(r.top - o * e.topRatio),
                left: m(r.left - a * e.leftRatio),
                width: m(i + a),
                height: m(s + o)
            };
            return r
        },
        step: function (e, t) {
            var n, r, i, s = t.prop,
                o = u.current,
                a = o.wrapSpace,
                f = o.skinSpace;
            if (s === "width" || s === "height") {
                n = t.end === t.start ? 1 : (e - t.start) / (t.end - t.start);
                if (u.isClosing) {
                    n = 1 - n
                }
                r = s === "width" ? o.wPadding : o.hPadding;
                i = e - r;
                u.skin[s](v(s === "width" ? i : i - a * n));
                u.inner[s](v(s === "width" ? i : i - a * n - f * n))
            }
        },
        zoomIn: function () {
            var e = u.current,
                t = e.pos,
                r = e.openEffect,
                i = r === "elastic",
                s = n.extend({
                    opacity: 1
                }, t);
            delete s.position;
            if (i) {
                t = this.getOrigPosition();
                if (e.openOpacity) {
                    t.opacity = .1
                }
            } else if (r === "fade") {
                t.opacity = .1
            }
            u.wrap.css(t).animate(s, {
                duration: r === "none" ? 0 : e.openSpeed,
                easing: e.openEasing,
                step: i ? this.step : null,
                complete: u._afterZoomIn
            })
        },
        zoomOut: function () {
            var e = u.current,
                t = e.closeEffect,
                n = t === "elastic",
                r = {
                    opacity: .1
                };
            if (n) {
                r = this.getOrigPosition();
                if (e.closeOpacity) {
                    r.opacity = .1
                }
            }
            u.wrap.animate(r, {
                duration: t === "none" ? 0 : e.closeSpeed,
                easing: e.closeEasing,
                step: n ? this.step : null,
                complete: u._afterZoomOut
            })
        },
        changeIn: function () {
            var e = u.current,
                t = e.nextEffect,
                n = e.pos,
                r = {
                    opacity: 1
                }, i = u.direction,
                s = 200,
                o;
            n.opacity = .1;
            if (t === "elastic") {
                o = i === "down" || i === "up" ? "top" : "left";
                if (i === "down" || i === "right") {
                    n[o] = m(v(n[o]) - s);
                    r[o] = "+=" + s + "px"
                } else {
                    n[o] = m(v(n[o]) + s);
                    r[o] = "-=" + s + "px"
                }
            }
            if (t === "none") {
                u._afterZoomIn()
            } else {
                u.wrap.css(n).animate(r, {
                    duration: e.nextSpeed,
                    easing: e.nextEasing,
                    complete: u._afterZoomIn
                })
            }
        },
        changeOut: function () {
            var e = u.previous,
                t = e.prevEffect,
                r = {
                    opacity: .1
                }, i = u.direction,
                s = 200;
            if (t === "elastic") {
                r[i === "down" || i === "up" ? "top" : "left"] = (i === "up" || i === "left" ? "-" : "+") + "=" + s + "px"
            }
            e.wrap.animate(r, {
                duration: t === "none" ? 0 : e.prevSpeed,
                easing: e.prevEasing,
                complete: function () {
                    n(this).trigger("onReset").remove()
                }
            })
        }
    };
    u.helpers.overlay = {
        defaults: {
            closeClick: true,
            speedOut: 200,
            showEarly: true,
            css: {},
            locked: !l,
            fixed: true
        },
        overlay: null,
        fixed: false,
        el: n("html"),
        create: function (e) {
            e = n.extend({}, this.defaults, e);
            if (this.overlay) {
                this.close()
            }
            this.overlay = n('<div class="fancybox-overlay"></div>').appendTo(u.coming ? u.coming.parent : e.parent);
            this.fixed = false;
            if (e.fixed && u.defaults.fixed) {
                this.overlay.addClass("fancybox-overlay-fixed");
                this.fixed = true
            }
        },
        open: function (e) {
            var t = this;
            e = n.extend({}, this.defaults, e);
            if (this.overlay) {
                this.overlay.unbind(".overlay").width("auto").height("auto")
            } else {
                this.create(e)
            } if (!this.fixed) {
                s.bind("resize.overlay", n.proxy(this.update, this));
                this.update()
            }
            if (e.closeClick) {
                this.overlay.bind("click.overlay", function (e) {
                    if (n(e.target).hasClass("fancybox-overlay")) {
                        if (u.isActive) {
                            u.close()
                        } else {
                            t.close()
                        }
                        return false
                    }
                })
            }
            this.overlay.css(e.css).show()
        },
        close: function () {
            var e, t;
            s.unbind("resize.overlay");
            if (this.el.hasClass("fancybox-lock")) {
                n(".fancybox-margin").removeClass("fancybox-margin");
                e = s.scrollTop();
                t = s.scrollLeft();
                this.el.removeClass("fancybox-lock");
                s.scrollTop(e).scrollLeft(t)
            }
            n(".fancybox-overlay").remove().hide();
            n.extend(this, {
                overlay: null,
                fixed: false
            })
        },
        update: function () {
            var e = "100%",
                n;
            this.overlay.width(e).height("100%");
            if (a) {
                n = Math.max(t.documentElement.offsetWidth, t.body.offsetWidth);
                if (o.width() > n) {
                    e = o.width()
                }
            } else if (o.width() > s.width()) {
                e = o.width()
            }
            this.overlay.width(e).height(o.height())
        },
        onReady: function (e, t) {
            var r = this.overlay;
            n(".fancybox-overlay").stop(true, true);
            if (!r) {
                this.create(e)
            }
            if (e.locked && this.fixed && t.fixed) {
                if (!r) {
                    this.margin = o.height() > s.height() ? n("html").css("margin-right").replace("px", "") : false
                }
                t.locked = this.overlay.append(t.wrap);
                t.fixed = false
            }
            if (e.showEarly === true) {
                this.beforeShow.apply(this, arguments)
            }
        },
        beforeShow: function (e, t) {
            var r, i;
            if (t.locked) {
                if (this.margin !== false) {
                    n("*").filter(function () {
                        return n(this).css("position") === "fixed" && !n(this).hasClass("fancybox-overlay") && !n(this).hasClass("fancybox-wrap")
                    }).addClass("fancybox-margin");
                    this.el.addClass("fancybox-margin")
                }
                r = s.scrollTop();
                i = s.scrollLeft();
                this.el.addClass("fancybox-lock");
                s.scrollTop(r).scrollLeft(i)
            }
            this.open(e)
        },
        onUpdate: function () {
            if (!this.fixed) {
                this.update()
            }
        },
        afterClose: function (e) {
            if (this.overlay && !u.coming) {
                this.overlay.fadeOut(e.speedOut, n.proxy(this.close, this))
            }
        }
    };
    u.helpers.title = {
        defaults: {
            type: "float",
            position: "bottom"
        },
        beforeShow: function (e) {
            var t = u.current,
                r = t.title,
                i = e.type,
                s, o;
            if (n.isFunction(r)) {
                r = r.call(t.element, t)
            }
            if (!h(r) || n.trim(r) === "") {
                return
            }
            s = n('<div class="fancybox-title fancybox-title-' + i + '-wrap">' + r + "</div>");
            switch (i) {
            case "inside":
                o = u.skin;
                break;
            case "outside":
                o = u.wrap;
                break;
            case "over":
                o = u.inner;
                break;
            default:
                o = u.skin;
                s.appendTo("body");
                if (a) {
                    s.width(s.width())
                }
                s.wrapInner('<span class="child"></span>');
                u.current.margin[2] += Math.abs(v(s.css("margin-bottom")));
                break
            }
            s[e.position === "top" ? "prependTo" : "appendTo"](o)
        }
    };
    n.fn.fancybox = function (e) {
        var t, r = n(this),
            i = this.selector || "",
            s = function (s) {
                var o = n(this).blur(),
                    a = t,
                    f, l;
                if (!(s.ctrlKey || s.altKey || s.shiftKey || s.metaKey) && !o.is(".fancybox-wrap")) {
                    f = e.groupAttr || "data-fancybox-group";
                    l = o.attr(f);
                    if (!l) {
                        f = "rel";
                        l = o.get(0)[f]
                    }
                    if (l && l !== "" && l !== "nofollow") {
                        o = i.length ? n(i) : r;
                        o = o.filter("[" + f + '="' + l + '"]');
                        a = o.index(this)
                    }
                    e.index = a;
                    if (u.open(o, e) !== false) {
                        s.preventDefault()
                    }
                }
            };
        e = e || {};
        t = e.index || 0;
        if (!i || e.live === false) {
            r.unbind("click.fb-start").bind("click.fb-start", s)
        } else {
            o.undelegate(i, "click.fb-start").delegate(i + ":not('.fancybox-item, .fancybox-nav')", "click.fb-start", s)
        }
        this.filter("[data-fancybox-start=1]").trigger("click");
        return this
    };
    o.ready(function () {
        var t, s;
        if (n.scrollbarWidth === r) {
            n.scrollbarWidth = function () {
                var e = n('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),
                    t = e.children(),
                    r = t.innerWidth() - t.height(99).innerWidth();
                e.remove();
                return r
            }
        }
        if (n.support.fixedPosition === r) {
            n.support.fixedPosition = function () {
                var e = n('<div style="position:fixed;top:20px;"></div>').appendTo("body"),
                    t = e[0].offsetTop === 20 || e[0].offsetTop === 15;
                e.remove();
                return t
            }()
        }
        n.extend(u.defaults, {
            scrollbarWidth: n.scrollbarWidth(),
            fixed: n.support.fixedPosition,
            parent: n("body")
        });
        t = n(e).width();
        i.addClass("fancybox-lock-test");
        s = n(e).width();
        i.removeClass("fancybox-lock-test");
        n("<style type='text/css'>.fancybox-margin{margin-right:" + (s - t) + "px;}</style>").appendTo("head")
    })
})(window, document, jQuery);
eval(function (e, t, n, r, i, s) {
    i = function (e) {
        return (e < t ? "" : i(parseInt(e / t))) + ((e = e % t) > 35 ? String.fromCharCode(e + 29) : e.toString(36))
    };
    if (!"".replace(/^/, String)) {
        while (n--) s[i(n)] = r[n] || i(n);
        r = [
            function (e) {
                return s[e]
            }
        ];
        i = function () {
            return "\\w+"
        };
        n = 1
    }
    while (n--)
        if (r[n]) e = e.replace(new RegExp("\\b" + i(n) + "\\b", "g"), r[n]);
    return e
}("(C($){8($.1r.1v){G}$.1r.6s=$.1r.1v=C(u,w){8(1k.R==0){17(I,'6t 57 6u 1j \"'+1k.4p+'\".');G 1k}8(1k.R>1){G 1k.1W(C(){$(1k).1v(u,w)})}E y=1k,$13=1k[0],59=K;8(y.1m('5a')){59=y.1Q('3p','4q');y.S('3p',['4r',I])}y.5b=C(o,a,b){o=3T($13,o);o.D=6v($13,o.D);o.1M=6w($13,o.1M);o.M=6x($13,o.M);o.V=5c($13,o.V);o.Z=5c($13,o.Z);o.1a=6y($13,o.1a);o.1q=6z($13,o.1q);o.1h=6A($13,o.1h);8(a){34=$.1N(I,{},$.1r.1v.5d,o)}7=$.1N(I,{},$.1r.1v.5d,o);7.d=6B(7);z.2b=(7.2b=='4s'||7.2b=='1n')?'Z':'V';E c=y.14(),2n=5e($1s,7,'N');8(3q(7.23)){7.23='7T'+F.3U}7.3V=5f(7,2n);7.D=6C(7.D,7,c,b);7[7.d['N']]=6D(7[7.d['N']],7,c);7[7.d['1d']]=6E(7[7.d['1d']],7,c);8(7.2o){8(!3W(7[7.d['N']])){7[7.d['N']]='2J%'}}8(3W(7[7.d['N']])){z.6F=I;z.4t=7[7.d['N']];7[7.d['N']]=4u(2n,z.4t);8(!7.D.L){7.D.T.1c=I}}8(7.2o){7.1R=K;7.1i=[0,0,0,0];7.1A=K;7.D.T.1c=K}O{8(!7.D.L){7=6G(7,2n)}8(!7[7.d['N']]){8(!7.D.T.1c&&11(7.D[7.d['N']])&&7.D.1t=='*'){7[7.d['N']]=7.D.L*7.D[7.d['N']];7.1A=K}O{7[7.d['N']]='1c'}}8(1E(7.1A)){7.1A=(11(7[7.d['N']]))?'5g':K}8(7.D.T.1c){7.D.L=35(c,7,0)}}8(7.D.1t!='*'&&!7.D.T.1c){7.D.T.4v=7.D.L;7.D.L=3X(c,7,0)}7.D.L=2z(7.D.L,7,7.D.T.2c,$13);7.D.T.1Z=7.D.L;8(7.2o){8(!7.D.T.36){7.D.T.36=7.D.L}8(!7.D.T.1X){7.D.T.1X=7.D.L}7=5h(7,c,2n)}O{7.1i=6H(7.1i);8(7.1A=='3r'){7.1A='1n'}O 8(7.1A=='5i'){7.1A='3a'}1B(7.1A){Q'5g':Q'1n':Q'3a':8(7[7.d['N']]!='1c'){7=5j(7,c);7.1R=I}16;2A:7.1A=K;7.1R=(7.1i[0]==0&&7.1i[1]==0&&7.1i[2]==0&&7.1i[3]==0)?K:I;16}}8(!11(7.1M.1F)){7.1M.1F=6I}8(1E(7.1M.D)){7.1M.D=(7.2o||7.D.T.1c||7.D.1t!='*')?'L':7.D.L}7.M=$.1N(I,{},7.1M,7.M);7.V=$.1N(I,{},7.1M,7.V);7.Z=$.1N(I,{},7.1M,7.Z);7.1a=$.1N(I,{},7.1M,7.1a);7.M=6J($13,7.M);7.V=5k($13,7.V);7.Z=5k($13,7.Z);7.1a=6K($13,7.1a);7.1q=6L($13,7.1q);7.1h=6M($13,7.1h);8(7.2p){7.2p=5l(7.2p)}8(7.M.5m){7.M.4w=7.M.5m;2K('M.5m','M.4w')}8(7.M.5n){7.M.4x=7.M.5n;2K('M.5n','M.4x')}8(7.M.5o){7.M.4y=7.M.5o;2K('M.5o','M.4y')}8(7.M.5p){7.M.2L=7.M.5p;2K('M.5p','M.2L')}};y.6N=C(){y.1m('5a',I);E a=y.14(),3Y=5q(y,['6O','6P','3s','3r','3a','5i','1n','3Z','N','1d','6Q','1S','5r','6R']),5s='7U';1B(3Y.3s){Q'6S':Q'7V':5s=3Y.3s;16}$1s.X(3Y).X({'7W':'3t','3s':5s});y.1m('5t',3Y).X({'6O':'1n','6P':'41','3s':'6S','3r':0,'3a':'M','5i':'M','1n':0,'6Q':0,'1S':0,'5r':0,'6R':0});4z(a,7);5u(a,7);8(7.2o){5v(7,a)}};y.6T=C(){y.5w();y.12(H('5x',F),C(e,a){e.1f();8(!z.2d){8(7.M.W){7.M.W.3b(2B('4A',F))}}z.2d=I;8(7.M.1G){7.M.1G=K;y.S(H('3c',F),a)}G I});y.12(H('5y',F),C(e){e.1f();8(z.25){42(U)}G I});y.12(H('3c',F),C(e,a,b){e.1f();1u=3u(1u);8(a&&z.25){U.2d=I;E c=2q()-U.2M;U.1F-=c;8(U.3v){U.3v.1F-=c}8(U.3w){U.3w.1F-=c}42(U,K)}8(!z.26&&!z.25){8(b){1u.3x+=2q()-1u.2M}}8(!z.26){8(7.M.W){7.M.W.3b(2B('6U',F))}}z.26=I;8(7.M.4x){E d=7.M.2L-1u.3x,3d=2J-1H.2C(d*2J/7.M.2L);7.M.4x.1g($13,3d,d)}G I});y.12(H('1G',F),C(e,b,c,d){e.1f();1u=3u(1u);E v=[b,c,d],t=['2N','27','3e'],a=3f(v,t);b=a[0];c=a[1];d=a[2];8(b!='V'&&b!='Z'){b=z.2b}8(!11(c)){c=0}8(!1l(d)){d=K}8(d){z.2d=K;7.M.1G=I}8(!7.M.1G){e.2e();G 17(F,'3y 4A: 2r 3g.')}8(z.26){8(7.M.W){7.M.W.2O(2B('4A',F));7.M.W.2O(2B('6U',F))}}z.26=K;1u.2M=2q();E f=7.M.2L+c;43=f-1u.3x;3d=2J-1H.2C(43*2J/f);8(7.M.1e){1u.1e=7X(C(){E a=2q()-1u.2M+1u.3x,3d=1H.2C(a*2J/f);7.M.1e.4B.1g(7.M.1e.2s[0],3d)},7.M.1e.5z)}1u.M=7Y(C(){8(7.M.1e){7.M.1e.4B.1g(7.M.1e.2s[0],2J)}8(7.M.4y){7.M.4y.1g($13,3d,43)}8(z.25){y.S(H('1G',F),b)}O{y.S(H(b,F),7.M)}},43);8(7.M.4w){7.M.4w.1g($13,3d,43)}G I});y.12(H('3h',F),C(e){e.1f();8(U.2d){U.2d=K;z.26=K;z.25=I;U.2M=2q();2P(U)}O{y.S(H('1G',F))}G I});y.12(H('V',F)+' '+H('Z',F),C(e,b,f,g,h){e.1f();8(z.2d||y.2f(':3t')){e.2e();G 17(F,'3y 4A 7Z 3t: 2r 3g.')}E i=(11(7.D.4C))?7.D.4C:7.D.L+1;8(i>J.P){e.2e();G 17(F,'2r 6V D ('+J.P+' P, '+i+' 6W): 2r 3g.')}E v=[b,f,g,h],t=['2g','27/2N','C','3e'],a=3f(v,t);b=a[0];f=a[1];g=a[2];h=a[3];E k=e.5A.18(F.3z.44.R);8(!1I(b)){b={}}8(1o(g)){b.3i=g}8(1l(h)){b.2Q=h}b=$.1N(I,{},7[k],b);8(b.5B&&!b.5B.1g($13,k)){e.2e();G 17(F,'80 \"5B\" 81 K.')}8(!11(f)){8(7.D.1t!='*'){f='L'}O{E m=[f,b.D,7[k].D];1j(E a=0,l=m.R;a<l;a++){8(11(m[a])||m[a]=='6X'||m[a]=='L'){f=m[a];16}}}1B(f){Q'6X':e.2e();G y.1Q(H(k+'82',F),[b,g]);16;Q'L':8(!7.D.T.1c&&7.D.1t=='*'){f=7.D.L}16}}8(U.2d){y.S(H('3h',F));y.S(H('2Q',F),[k,[b,f,g]]);e.2e();G 17(F,'3y 83 3g.')}8(b.1F>0){8(z.25){8(b.2Q){8(b.2Q=='2R'){2h=[]}8(b.2Q!='Y'||2h.R==0){y.S(H('2Q',F),[k,[b,f,g]])}}e.2e();G 17(F,'3y 84 3g.')}}1u.3x=0;y.S(H('6Y'+k,F),[b,f]);8(7.2p){E s=7.2p,c=[b,f];1j(E j=0,l=s.R;j<l;j++){E d=k;8(!s[j][2]){d=(d=='V')?'Z':'V'}8(!s[j][1]){c[0]=s[j][0].1Q('3p',['4D',d])}c[1]=f+s[j][3];s[j][0].S('3p',['6Y'+d,c])}}G I});y.12(H('85',F),C(e,b,c){e.1f();E d=y.14();8(!7.1T){8(J.Y==0){8(7.3A){y.S(H('Z',F),J.P-1)}G e.2e()}}1U(d,7);8(!11(c)){8(7.D.T.1c){c=4E(d,7,J.P-1)}O 8(7.D.1t!='*'){E f=(11(b.D))?b.D:5C(y,7);c=6Z(d,7,J.P-1,f)}O{c=7.D.L}c=4F(c,7,b.D,$13)}8(!7.1T){8(J.P-c<J.Y){c=J.P-J.Y}}7.D.T.1Z=7.D.L;8(7.D.T.1c){E g=2z(35(d,7,J.P-c),7,7.D.T.2c,$13);8(7.D.L+c<=g&&c<J.P){c++;g=2z(35(d,7,J.P-c),7,7.D.T.2c,$13)}7.D.L=g}O 8(7.D.1t!='*'){E g=3X(d,7,J.P-c);7.D.L=2z(g,7,7.D.T.2c,$13)}1U(d,7,I);8(c==0){e.2e();G 17(F,'0 D 45 1M: 2r 3g.')}17(F,'70 '+c+' D 5D.');J.Y+=c;2i(J.Y>=J.P){J.Y-=J.P}8(!7.1T){8(J.Y==0&&b.4G){b.4G.1g($13,'V')}8(!7.3A){3B(7,J.Y,F)}}y.14().18(J.P-c,J.P).86(y);8(J.P<7.D.L+c){y.14().18(0,(7.D.L+c)-J.P).4H(I).46(y)}E d=y.14(),3j=71(d,7,c),2j=72(d,7),1Y=d.1O(c-1),20=3j.2R(),2t=2j.2R();1U(d,7);E h=0,2D=0;8(7.1A){E p=4I(2j,7);h=p[0];2D=p[1]}E i=(h<0)?7.1i[7.d[3]]:0;E j=K,2S=$();8(7.D.L<c){2S=d.18(7.D.T.1Z,c);8(b.1V=='73'){E k=7.D[7.d['N']];j=2S;1Y=2t;5E(j);7.D[7.d['N']]='1c'}}E l=K,3C=2T(d.18(0,c),7,'N'),2k=4J(4K(2j,7,I),7,!7.1R),3D=0,28={},4L={},2u={},2U={},4M={},2V={},5F={},2W=5G(b,7,c,3C);1B(b.1V){Q'1J':Q'1J-1w':3D=2T(d.18(0,7.D.L),7,'N');16}8(j){7.D[7.d['N']]=k}1U(d,7,I);8(2D>=0){1U(20,7,7.1i[7.d[1]])}8(h>=0){1U(1Y,7,7.1i[7.d[3]])}8(7.1A){7.1i[7.d[1]]=2D;7.1i[7.d[3]]=h}2V[7.d['1n']]=-(3C-i);5F[7.d['1n']]=-(3D-i);4L[7.d['1n']]=2k[7.d['N']];E m=C(){},1P=C(){},1C=C(){},3E=C(){},2E=C(){},5H=C(){},1D=C(){},3F=C(){},1x=C(){},1y=C(){},1K=C(){};1B(b.1V){Q'3k':Q'1J':Q'1J-1w':Q'21':Q'21-1w':l=y.4H(I).46($1s);16}1B(b.1V){Q'3k':Q'21':Q'21-1w':l.14().18(0,c).2v();l.14().18(7.D.T.1Z).2v();16;Q'1J':Q'1J-1w':l.14().18(7.D.L).2v();l.X(5F);16}y.X(2V);U=47(2W,b.2l);28[7.d['1n']]=(7.1R)?7.1i[7.d[3]]:0;8(7[7.d['N']]=='1c'||7[7.d['1d']]=='1c'){m=C(){$1s.X(2k)};1P=C(){U.19.1b([$1s,2k])}}8(7.1R){8(2t.4N(1Y).R){2u[7.d['1S']]=1Y.1m('29');8(h<0){1Y.X(2u)}O{1D=C(){1Y.X(2u)};3F=C(){U.19.1b([1Y,2u])}}}1B(b.1V){Q'1J':Q'1J-1w':l.14().1O(c-1).X(2u);16}8(2t.4N(20).R){2U[7.d['1S']]=20.1m('29');1C=C(){20.X(2U)};3E=C(){U.19.1b([20,2U])}}8(2D>=0){4M[7.d['1S']]=2t.1m('29')+7.1i[7.d[1]];2E=C(){2t.X(4M)};5H=C(){U.19.1b([2t,4M])}}}1K=C(){y.X(28)};E n=7.D.L+c-J.P;1y=C(){8(n>0){y.14().18(J.P).2v();3j=$(y.14().18(J.P-(7.D.L-n)).3G().74(y.14().18(0,n).3G()))}5I(j);8(7.1R){E a=y.14().1O(7.D.L+c-1);a.X(7.d['1S'],a.1m('29'))}};E o=5J(3j,2S,2j,c,'V',2W,2k);1x=C(){5K(y,l,b);z.25=K;2a.3i=48($13,b,'3i',o,2a);2h=5L(y,2h,F);8(!z.26){y.S(H('1G',F))}};z.25=I;1u=3u(1u);2a.3H=48($13,b,'3H',o,2a);1B(b.1V){Q'41':y.X(28);m();1C();2E();1D();1K();1y();1x();16;Q'1w':U.19.1b([y,{'1L':0},C(){m();1C();2E();1D();1K();1y();U=47(2W,b.2l);U.19.1b([y,{'1L':1},1x]);2P(U)}]);16;Q'3k':y.X({'1L':0});U.19.1b([l,{'1L':0}]);U.19.1b([y,{'1L':1},1x]);1P();1C();2E();1D();1K();1y();16;Q'1J':U.19.1b([l,28,C(){1C();2E();1D();1K();1y();1x()}]);1P();16;Q'1J-1w':U.19.1b([y,{'1L':0}]);U.19.1b([l,28,C(){y.X({'1L':1});1C();2E();1D();1K();1y();1x()}]);1P();16;Q'21':U.19.1b([l,4L,1x]);1P();1C();2E();1D();1K();1y();16;Q'21-1w':y.X({'1L':0});U.19.1b([y,{'1L':1}]);U.19.1b([l,4L,1x]);1P();1C();2E();1D();1K();1y();16;2A:U.19.1b([y,28,C(){1y();1x()}]);1P();3E();5H();3F();16}2P(U);5M(7.23,y,F);y.S(H('3I',F),[K,2k]);G I});y.12(H('87',F),C(e,c,d){e.1f();E f=y.14();8(!7.1T){8(J.Y==7.D.L){8(7.3A){y.S(H('V',F),J.P-1)}G e.2e()}}1U(f,7);8(!11(d)){8(7.D.1t!='*'){E g=(11(c.D))?c.D:5C(y,7);d=75(f,7,0,g)}O{d=7.D.L}d=4F(d,7,c.D,$13)}E h=(J.Y==0)?J.P:J.Y;8(!7.1T){8(7.D.T.1c){E i=35(f,7,d),g=4E(f,7,h-1)}O{E i=7.D.L,g=7.D.L}8(d+i>h){d=h-g}}7.D.T.1Z=7.D.L;8(7.D.T.1c){E i=2z(5N(f,7,d,h),7,7.D.T.2c,$13);2i(7.D.L-d>=i&&d<J.P){d++;i=2z(5N(f,7,d,h),7,7.D.T.2c,$13)}7.D.L=i}O 8(7.D.1t!='*'){E i=3X(f,7,d);7.D.L=2z(i,7,7.D.T.2c,$13)}1U(f,7,I);8(d==0){e.2e();G 17(F,'0 D 45 1M: 2r 3g.')}17(F,'70 '+d+' D 76.');J.Y-=d;2i(J.Y<0){J.Y+=J.P}8(!7.1T){8(J.Y==7.D.L&&c.4G){c.4G.1g($13,'Z')}8(!7.3A){3B(7,J.Y,F)}}8(J.P<7.D.L+d){y.14().18(0,(7.D.L+d)-J.P).4H(I).46(y)}E f=y.14(),3j=77(f,7),2j=78(f,7,d),1Y=f.1O(d-1),20=3j.2R(),2t=2j.2R();1U(f,7);E j=0,2D=0;8(7.1A){E p=4I(2j,7);j=p[0];2D=p[1]}E k=K,2S=$();8(7.D.T.1Z<d){2S=f.18(7.D.T.1Z,d);8(c.1V=='73'){E l=7.D[7.d['N']];k=2S;1Y=20;5E(k);7.D[7.d['N']]='1c'}}E m=K,3C=2T(f.18(0,d),7,'N'),2k=4J(4K(2j,7,I),7,!7.1R),3D=0,28={},4O={},2u={},2U={},2V={},2W=5G(c,7,d,3C);1B(c.1V){Q'21':Q'21-1w':3D=2T(f.18(0,7.D.T.1Z),7,'N');16}8(k){7.D[7.d['N']]=l}8(7.1A){8(7.1i[7.d[1]]<0){7.1i[7.d[1]]=0}}1U(f,7,I);1U(20,7,7.1i[7.d[1]]);8(7.1A){7.1i[7.d[1]]=2D;7.1i[7.d[3]]=j}2V[7.d['1n']]=(7.1R)?7.1i[7.d[3]]:0;E n=C(){},1P=C(){},1C=C(){},3E=C(){},1D=C(){},3F=C(){},1x=C(){},1y=C(){},1K=C(){};1B(c.1V){Q'3k':Q'1J':Q'1J-1w':Q'21':Q'21-1w':m=y.4H(I).46($1s);m.14().18(7.D.T.1Z).2v();16}1B(c.1V){Q'3k':Q'1J':Q'1J-1w':y.X('3Z',1);m.X('3Z',0);16}U=47(2W,c.2l);28[7.d['1n']]=-3C;4O[7.d['1n']]=-3D;8(j<0){28[7.d['1n']]+=j}8(7[7.d['N']]=='1c'||7[7.d['1d']]=='1c'){n=C(){$1s.X(2k)};1P=C(){U.19.1b([$1s,2k])}}8(7.1R){E o=2t.1m('29');8(2D>=0){o+=7.1i[7.d[1]]}2t.X(7.d['1S'],o);8(1Y.4N(20).R){2U[7.d['1S']]=20.1m('29')}1C=C(){20.X(2U)};3E=C(){U.19.1b([20,2U])};E q=1Y.1m('29');8(j>0){q+=7.1i[7.d[3]]}2u[7.d['1S']]=q;1D=C(){1Y.X(2u)};3F=C(){U.19.1b([1Y,2u])}}1K=C(){y.X(2V)};E r=7.D.L+d-J.P;1y=C(){8(r>0){y.14().18(J.P).2v()}E a=y.14().18(0,d).46(y).2R();8(r>0){2j=3J(f,7)}5I(k);8(7.1R){8(J.P<7.D.L+d){E b=y.14().1O(7.D.L-1);b.X(7.d['1S'],b.1m('29')+7.1i[7.d[3]])}a.X(7.d['1S'],a.1m('29'))}};E s=5J(3j,2S,2j,d,'Z',2W,2k);1x=C(){y.X('3Z',y.1m('5t').3Z);5K(y,m,c);z.25=K;2a.3i=48($13,c,'3i',s,2a);2h=5L(y,2h,F);8(!z.26){y.S(H('1G',F))}};z.25=I;1u=3u(1u);2a.3H=48($13,c,'3H',s,2a);1B(c.1V){Q'41':y.X(28);n();1C();1D();1K();1y();1x();16;Q'1w':U.19.1b([y,{'1L':0},C(){n();1C();1D();1K();1y();U=47(2W,c.2l);U.19.1b([y,{'1L':1},1x]);2P(U)}]);16;Q'3k':y.X({'1L':0});U.19.1b([m,{'1L':0}]);U.19.1b([y,{'1L':1},1x]);1P();1C();1D();1K();1y();16;Q'1J':y.X(7.d['1n'],$1s[7.d['N']]());U.19.1b([y,2V,1x]);1P();1C();1D();1y();16;Q'1J-1w':y.X(7.d['1n'],$1s[7.d['N']]());U.19.1b([m,{'1L':0}]);U.19.1b([y,2V,1x]);1P();1C();1D();1y();16;Q'21':U.19.1b([m,4O,1x]);1P();1C();1D();1K();1y();16;Q'21-1w':y.X({'1L':0});U.19.1b([y,{'1L':1}]);U.19.1b([m,4O,1x]);1P();1C();1D();1K();1y();16;2A:U.19.1b([y,28,C(){1K();1y();1x()}]);1P();3E();3F();16}2P(U);5M(7.23,y,F);y.S(H('3I',F),[K,2k]);G I});y.12(H('3l',F),C(e,b,c,d,f,g,h){e.1f();E v=[b,c,d,f,g,h],t=['2N/27/2g','27','3e','2g','2N','C'],a=3f(v,t);f=a[3];g=a[4];h=a[5];b=3K(a[0],a[1],a[2],J,y);8(b==0){G K}8(!1I(f)){f=K}8(g!='V'&&g!='Z'){8(7.1T){g=(b<=J.P/2)?'Z':'V'}O{g=(J.Y==0||J.Y>b)?'Z':'V'}}8(g=='V'){b=J.P-b}y.S(H(g,F),[f,b,h]);G I});y.12(H('88',F),C(e,a,b){e.1f();E c=y.1Q(H('4a',F));G y.1Q(H('5O',F),[c-1,a,'V',b])});y.12(H('89',F),C(e,a,b){e.1f();E c=y.1Q(H('4a',F));G y.1Q(H('5O',F),[c+1,a,'Z',b])});y.12(H('5O',F),C(e,a,b,c,d){e.1f();8(!11(a)){a=y.1Q(H('4a',F))}E f=7.1a.D||7.D.L,1X=1H.2C(J.P/f)-1;8(a<0){a=1X}8(a>1X){a=0}G y.1Q(H('3l',F),[a*f,0,I,b,c,d])});y.12(H('79',F),C(e,s){e.1f();8(s){s=3K(s,0,I,J,y)}O{s=0}s+=J.Y;8(s!=0){8(J.P>0){2i(s>J.P){s-=J.P}}y.8a(y.14().18(s,J.P))}G I});y.12(H('2p',F),C(e,s){e.1f();8(s){s=5l(s)}O 8(7.2p){s=7.2p}O{G 17(F,'6t 8b 45 2p.')}E n=y.1Q(H('4q',F)),x=I;1j(E j=0,l=s.R;j<l;j++){8(!s[j][0].1Q(H('3l',F),[n,s[j][3],I])){x=K}}G x});y.12(H('2Q',F),C(e,a,b){e.1f();8(1o(a)){a.1g($13,2h)}O 8(2X(a)){2h=a}O 8(!1E(a)){2h.1b([a,b])}G 2h});y.12(H('8c',F),C(e,b,c,d,f){e.1f();E v=[b,c,d,f],t=['2N/2g','2N/27/2g','3e','27'],a=3f(v,t);b=a[0];c=a[1];d=a[2];f=a[3];8(1I(b)&&!2w(b)){b=$(b)}O 8(1p(b)){b=$(b)}8(!2w(b)||b.R==0){G 17(F,'2r a 5P 2g.')}8(1E(c)){c='4b'}4z(b,7);5u(b,7);E g=c,4c='4c';8(c=='4b'){8(d){8(J.Y==0){c=J.P-1;4c='7a'}O{c=J.Y;J.Y+=b.R}8(c<0){c=0}}O{c=J.P-1;4c='7a'}}O{c=3K(c,f,d,J,y)}E h=y.14().1O(c);8(h.R){h[4c](b)}O{17(F,'8d 8e-3s 4N 6u! 8f 8g 45 3L 4b.');y.7b(b)}8(g!='4b'&&!d){8(c<J.Y){J.Y+=b.R}}J.P=y.14().R;8(J.Y>=J.P){J.Y-=J.P}y.S(H('4P',F));y.S(H('5Q',F));G I});y.12(H('7c',F),C(e,c,d,f){e.1f();E v=[c,d,f],t=['2N/27/2g','3e','27'],a=3f(v,t);c=a[0];d=a[1];f=a[2];E g=K;8(c 2Y $&&c.R>1){h=$();c.1W(C(i,a){E b=y.S(H('7c',F),[$(1k),d,f]);8(b)h=h.8h(b)});G h}8(1E(c)||c=='4b'){h=y.14().2R()}O{c=3K(c,f,d,J,y);E h=y.14().1O(c);8(h.R){8(c<J.Y)J.Y-=h.R}}8(h&&h.R){h.8i();J.P=y.14().R;y.S(H('4P',F))}G h});y.12(H('3H',F)+' '+H('3i',F),C(e,a){e.1f();E b=e.5A.18(F.3z.44.R);8(2X(a)){2a[b]=a}8(1o(a)){2a[b].1b(a)}G 2a[b]});y.12(H('4q',F),C(e,a){e.1f();8(J.Y==0){E b=0}O{E b=J.P-J.Y}8(1o(a)){a.1g($13,b)}G b});y.12(H('4a',F),C(e,a){e.1f();E b=7.1a.D||7.D.L,1X=1H.2C(J.P/b-1),2m;8(J.Y==0){2m=0}O 8(J.Y<J.P%b){2m=0}O 8(J.Y==b&&!7.1T){2m=1X}O{2m=1H.7d((J.P-J.Y)/b)}8(2m<0){2m=0}8(2m>1X){2m=1X}8(1o(a)){a.1g($13,2m)}G 2m});y.12(H('8j',F),C(e,a){e.1f();E b=3J(y.14(),7);8(1o(a)){a.1g($13,b)}G b});y.12(H('18',F),C(e,f,l,b){e.1f();8(J.P==0){G K}E v=[f,l,b],t=['27','27','C'],a=3f(v,t);f=(11(a[0]))?a[0]:0;l=(11(a[1]))?a[1]:J.P;b=a[2];f+=J.Y;l+=J.Y;8(D.P>0){2i(f>J.P){f-=J.P}2i(l>J.P){l-=J.P}2i(f<0){f+=J.P}2i(l<0){l+=J.P}}E c=y.14(),$i;8(l>f){$i=c.18(f,l)}O{$i=$(c.18(f,J.P).3G().74(c.18(0,l).3G()))}8(1o(b)){b.1g($13,$i)}G $i});y.12(H('26',F)+' '+H('2d',F)+' '+H('25',F),C(e,a){e.1f();E b=e.5A.18(F.3z.44.R),5R=z[b];8(1o(a)){a.1g($13,5R)}G 5R});y.12(H('4D',F),C(e,a,b,c){e.1f();E d=K;8(1o(a)){a.1g($13,7)}O 8(1I(a)){34=$.1N(I,{},34,a);8(b!==K)d=I;O 7=$.1N(I,{},7,a)}O 8(!1E(a)){8(1o(b)){E f=4Q('7.'+a);8(1E(f)){f=''}b.1g($13,f)}O 8(!1E(b)){8(2Z c!=='3e')c=I;4Q('34.'+a+' = b');8(c!==K)d=I;O 4Q('7.'+a+' = b')}O{G 4Q('7.'+a)}}8(d){1U(y.14(),7);y.5b(34);y.5S();E g=4R(y,7);y.S(H('3I',F),[I,g])}G 7});y.12(H('5Q',F),C(e,a,b){e.1f();8(1E(a)){a=$('8k')}O 8(1p(a)){a=$(a)}8(!2w(a)||a.R==0){G 17(F,'2r a 5P 2g.')}8(!1p(b)){b='a.6s'}a.8l(b).1W(C(){E h=1k.7e||'';8(h.R>0&&y.14().7f($(h))!=-1){$(1k).22('5T').5T(C(e){e.2F();y.S(H('3l',F),h)})}});G I});y.12(H('3I',F),C(e,b,c){e.1f();8(!7.1a.1z){G}E d=7.1a.D||7.D.L,4S=1H.2C(J.P/d);8(b){8(7.1a.3M){7.1a.1z.14().2v();7.1a.1z.1W(C(){1j(E a=0;a<4S;a++){E i=y.14().1O(3K(a*d,0,I,J,y));$(1k).7b(7.1a.3M.1g(i[0],a+1))}})}7.1a.1z.1W(C(){$(1k).14().22(7.1a.3N).1W(C(a){$(1k).12(7.1a.3N,C(e){e.2F();y.S(H('3l',F),[a*d,-7.1a.4T,I,7.1a])})})})}E f=y.1Q(H('4a',F))+7.1a.4T;8(f>=4S){f=0}8(f<0){f=4S-1}7.1a.1z.1W(C(){$(1k).14().2O(2B('7g',F)).1O(f).3b(2B('7g',F))});G I});y.12(H('4P',F),C(e){E a=7.D.L,2G=y.14(),2n=5e($1s,7,'N');J.P=2G.R;8(z.4t){7.3V=2n;7[7.d['N']]=4u(2n,z.4t)}O{7.3V=5f(7,2n)}8(7.2o){7.D.N=7.D.3O.N;7.D.1d=7.D.3O.1d;7=5h(7,2G,2n);a=7.D.L;5v(7,2G)}O 8(7.D.T.1c){a=35(2G,7,0)}O 8(7.D.1t!='*'){a=3X(2G,7,0)}8(!7.1T&&J.Y!=0&&a>J.Y){8(7.D.T.1c){E b=4E(2G,7,J.Y)-J.Y}O 8(7.D.1t!='*'){E b=7h(2G,7,J.Y)-J.Y}O{E b=7.D.L-J.Y}17(F,'8m 8n-1T: 8o '+b+' D 5D.');y.S(H('V',F),b)}7.D.L=2z(a,7,7.D.T.2c,$13);7.D.T.1Z=7.D.L;7=5j(7,2G);E c=4R(y,7);y.S(H('3I',F),[I,c]);4U(7,J.P,F);3B(7,J.Y,F);G c});y.12(H('4r',F),C(e,a){e.1f();1u=3u(1u);y.1m('5a',K);y.S(H('5y',F));8(a){y.S(H('79',F))}1U(y.14(),7);8(7.2o){y.14().1W(C(){$(1k).X($(1k).1m('7i'))})}y.X(y.1m('5t'));y.5w();y.5U();$1s.8p(y);G I});y.12(H('17',F),C(e){17(F,'3y N: '+7.N);17(F,'3y 1d: '+7.1d);17(F,'7j 8q: '+7.D.N);17(F,'7j 8r: '+7.D.1d);17(F,'4d 4e D L: '+7.D.L);8(7.M.1G){17(F,'4d 4e D 5V 8s: '+7.M.D)}8(7.V.W){17(F,'4d 4e D 5V 5D: '+7.V.D)}8(7.Z.W){17(F,'4d 4e D 5V 76: '+7.Z.D)}G F.17});y.12('3p',C(e,n,o){e.1f();G y.1Q(H(n,F),o)})};y.5w=C(){y.22(H('',F));y.22(H('',F,K));y.22('3p')};y.5S=C(){y.5U();4U(7,J.P,F);3B(7,J.Y,F);8(7.M.2H){E b=3P(7.M.2H);$1s.12(H('4V',F,K),C(){y.S(H('3c',F),b)}).12(H('4W',F,K),C(){y.S(H('3h',F))})}8(7.M.W){7.M.W.12(H(7.M.3N,F,K),C(e){e.2F();E a=K,b=2x;8(z.26){a='1G'}O 8(7.M.4X){a='3c';b=3P(7.M.4X)}8(a){y.S(H(a,F),b)}})}8(7.V.W){7.V.W.12(H(7.V.3N,F,K),C(e){e.2F();y.S(H('V',F))});8(7.V.2H){E b=3P(7.V.2H);7.V.W.12(H('4V',F,K),C(){y.S(H('3c',F),b)}).12(H('4W',F,K),C(){y.S(H('3h',F))})}}8(7.Z.W){7.Z.W.12(H(7.Z.3N,F,K),C(e){e.2F();y.S(H('Z',F))});8(7.Z.2H){E b=3P(7.Z.2H);7.Z.W.12(H('4V',F,K),C(){y.S(H('3c',F),b)}).12(H('4W',F,K),C(){y.S(H('3h',F))})}}8(7.1a.1z){8(7.1a.2H){E b=3P(7.1a.2H);7.1a.1z.12(H('4V',F,K),C(){y.S(H('3c',F),b)}).12(H('4W',F,K),C(){y.S(H('3h',F))})}}8(7.V.31||7.Z.31){$(4f).12(H('7k',F,K,I,I),C(e){E k=e.7l;8(k==7.Z.31){e.2F();y.S(H('Z',F))}8(k==7.V.31){e.2F();y.S(H('V',F))}})}8(7.1a.4Y){$(4f).12(H('7k',F,K,I,I),C(e){E k=e.7l;8(k>=49&&k<58){k=(k-49)*7.D.L;8(k<=J.P){e.2F();y.S(H('3l',F),[k,0,I,7.1a])}}})}8(7.V.4Z||7.Z.4Z){2K('3L 4g-7m','3L 8t-7m');8($.1r.4g){E c=(7.V.4Z)?C(){y.S(H('V',F))}:2x,4h=(7.Z.4Z)?C(){y.S(H('Z',F))}:2x;8(4h||4h){8(!z.4g){z.4g=I;E d={'8u':30,'8v':30,'8w':I};1B(7.2b){Q'4s':Q'5W':d.8x=c;d.8y=4h;16;2A:d.8z=4h;d.8A=c}$1s.4g(d)}}}}8($.1r.1q){E f='8B'8C 3m;8((f&&7.1q.4i)||(!f&&7.1q.5X)){E g=$.1N(I,{},7.V,7.1q),7n=$.1N(I,{},7.Z,7.1q),5Y=C(){y.S(H('V',F),[g])},5Z=C(){y.S(H('Z',F),[7n])};1B(7.2b){Q'4s':Q'5W':7.1q.2I.8D=5Z;7.1q.2I.8E=5Y;16;2A:7.1q.2I.8F=5Z;7.1q.2I.8G=5Y}8(z.1q){y.1q('4r')}$1s.1q(7.1q.2I);$1s.X('7o','8H');z.1q=I}}8($.1r.1h){8(7.V.1h){2K('7p V.1h 7q','3L 1h 4D 2g');7.V.1h=2x;7.1h={D:61(7.V.1h)}}8(7.Z.1h){2K('7p Z.1h 7q','3L 1h 4D 2g');7.Z.1h=2x;7.1h={D:61(7.Z.1h)}}8(7.1h){E h=$.1N(I,{},7.V,7.1h),7r=$.1N(I,{},7.Z,7.1h);8(z.1h){$1s.22(H('1h',F,K))}$1s.12(H('1h',F,K),C(e,a){e.2F();8(a>0){y.S(H('V',F),[h])}O{y.S(H('Z',F),[7r])}});z.1h=I}}8(7.M.1G){y.S(H('1G',F),7.M.62)}8(z.6F){E i=C(e){y.S(H('5y',F));8(7.M.63&&!z.26){y.S(H('1G',F))}1U(y.14(),7);y.S(H('4P',F))};E j=$(3m),4j=2x;8($.64&&F.65=='64'){4j=$.64(8I,i)}O 8($.51&&F.65=='51'){4j=$.51(8J,i)}O{E l=0,66=0;4j=C(){E a=j.N(),68=j.1d();8(a!=l||68!=66){i();l=a;66=68}}}j.12(H('8K',F,K,I,I),4j)}};y.5U=C(){E a=H('',F),3Q=H('',F,K);69=H('',F,K,I,I);$(4f).22(69);$(3m).22(69);$1s.22(3Q);8(7.M.W){7.M.W.22(3Q)}8(7.V.W){7.V.W.22(3Q)}8(7.Z.W){7.Z.W.22(3Q)}8(7.1a.1z){7.1a.1z.22(3Q);8(7.1a.3M){7.1a.1z.14().2v()}}8(z.1q){y.1q('4r');$1s.X('7o','2A');z.1q=K}8(z.1h){z.1h=K}4U(7,'4k',F);3B(7,'2O',F)};8(1l(w)){w={'17':w}}E z={'2b':'Z','26':I,'25':K,'2d':K,'1h':K,'1q':K},J={'P':y.14().R,'Y':0},1u={'M':2x,'1e':2x,'2M':2q(),'3x':0},U={'2d':K,'1F':0,'2M':0,'2l':'','19':[]},2a={'3H':[],'3i':[]},2h=[],F=$.1N(I,{},$.1r.1v.7s,w),7={},34=$.1N(I,{},u),$1s=y.8L('<'+F.6a.57+' 8M=\"'+F.6a.7t+'\" />').6b();F.4p=y.4p;F.3U=$.1r.1v.3U++;y.5b(34,I,59);y.6N();y.6T();y.5S();8(2X(7.D.3n)){E A=7.D.3n}O{E A=[];8(7.D.3n!=0){A.1b(7.D.3n)}}8(7.23){A.8N(4l(7u(7.23),10))}8(A.R>0){1j(E a=0,l=A.R;a<l;a++){E s=A[a];8(s==0){6c}8(s===I){s=3m.8O.7e;8(s.R<1){6c}}O 8(s==='7v'){s=1H.4m(1H.7v()*J.P)}8(y.1Q(H('3l',F),[s,0,I,{1V:'41'}])){16}}}E B=4R(y,7),7w=3J(y.14(),7);8(7.7x){7.7x.1g($13,{'N':B.N,'1d':B.1d,'D':7w})}y.S(H('3I',F),[I,B]);y.S(H('5Q',F));8(F.17){y.S(H('17',F))}G y};$.1r.1v.3U=1;$.1r.1v.5d={'2p':K,'3A':I,'1T':I,'2o':K,'2b':'1n','D':{'3n':0},'1M':{'2l':'8P','1F':6I,'2H':K,'3N':'5T','2Q':K}};$.1r.1v.7s={'17':K,'65':'51','3z':{'44':'','7y':'8Q'},'6a':{'57':'8R','7t':'8S'},'6d':{}};$.1r.1v.7z=C(a){G'<a 8T=\"#\"><7A>'+a+'</7A></a>'};$.1r.1v.7B=C(a){$(1k).X('N',a+'%')};$.1r.1v.23={3G:C(n){n+='=';E b=4f.23.3R(';');1j(E a=0,l=b.R;a<l;a++){E c=b[a];2i(c.8U(0)==' '){c=c.18(1)}8(c.3S(n)==0){G c.18(n.R)}}G 0},6e:C(n,v,d){E e=\"\";8(d){E a=6f 7C();a.8V(a.2q()+(d*24*60*60*8W));e=\"; 8X=\"+a.8Y()}4f.23=n+'='+v+e+'; 8Z=/'},2v:C(n){$.1r.1v.23.6e(n,\"\",-1)}};C 47(d,e){G{19:[],1F:d,90:d,2l:e,2M:2q()}}C 2P(s){8(1I(s.3v)){2P(s.3v)}1j(E a=0,l=s.19.R;a<l;a++){E b=s.19[a];8(!b){6c}8(b[3]){b[0].5x()}b[0].91(b[1],{92:b[2],1F:s.1F,2l:s.2l})}8(1I(s.3w)){2P(s.3w)}}C 42(s,c){8(!1l(c)){c=I}8(1I(s.3v)){42(s.3v,c)}1j(E a=0,l=s.19.R;a<l;a++){E b=s.19[a];b[0].5x(I);8(c){b[0].X(b[1]);8(1o(b[2])){b[2]()}}}8(1I(s.3w)){42(s.3w,c)}}C 5K(a,b,o){8(b){b.2v()}1B(o.1V){Q'1w':Q'3k':Q'1J-1w':Q'21-1w':a.X('1t','');16}}C 48(d,o,b,a,c){8(o[b]){o[b].1g(d,a)}8(c[b].R){1j(E i=0,l=c[b].R;i<l;i++){c[b][i].1g(d,a)}}G[]}C 5L(a,q,c){8(q.R){a.S(H(q[0][0],c),q[0][1]);q.93()}G q}C 5E(b){b.1W(C(){E a=$(1k);a.1m('7D',a.2f(':3t')).4k()})}C 5I(b){8(b){b.1W(C(){E a=$(1k);8(!a.1m('7D')){a.4n()}})}}C 3u(t){8(t.M){94(t.M)}8(t.1e){95(t.1e)}G t}C 5J(a,b,c,d,e,f,g){G{'N':g.N,'1d':g.1d,'D':{'1Z':a,'96':b,'L':c,'6f':c},'1M':{'D':d,'2b':e,'1F':f}}}C 5G(a,o,b,c){E d=a.1F;8(a.1V=='41'){G 0}8(d=='M'){d=o.1M.1F/o.1M.D*b}O 8(d<10){d=c/d}8(d<1){G 0}8(a.1V=='1w'){d=d/2}G 1H.7d(d)}C 4U(o,t,c){E a=(11(o.D.4C))?o.D.4C:o.D.L+1;8(t=='4n'||t=='4k'){E f=t}O 8(a>t){17(c,'2r 6V D ('+t+' P, '+a+' 6W): 97 98.');E f='4k'}O{E f='4n'}E s=(f=='4n')?'2O':'3b',h=2B('3t',c);8(o.M.W){o.M.W[f]()[s](h)}8(o.V.W){o.V.W[f]()[s](h)}8(o.Z.W){o.Z.W[f]()[s](h)}8(o.1a.1z){o.1a.1z[f]()[s](h)}}C 3B(o,f,c){8(o.1T||o.3A)G;E a=(f=='2O'||f=='3b')?f:K,52=2B('99',c);8(o.M.W&&a){o.M.W[a](52)}8(o.V.W){E b=a||(f==0)?'3b':'2O';o.V.W[b](52)}8(o.Z.W){E b=a||(f==o.D.L)?'3b':'2O';o.Z.W[b](52)}}C 3T(a,b){8(1o(b)){b=b.1g(a)}O 8(1E(b)){b={}}G b}C 6v(a,b){b=3T(a,b);8(11(b)){b={'L':b}}O 8(b=='1c'){b={'L':b,'N':b,'1d':b}}O 8(!1I(b)){b={}}G b}C 6w(a,b){b=3T(a,b);8(11(b)){8(b<=50){b={'D':b}}O{b={'1F':b}}}O 8(1p(b)){b={'2l':b}}O 8(!1I(b)){b={}}G b}C 53(a,b){b=3T(a,b);8(1p(b)){E c=6g(b);8(c==-1){b=$(b)}O{b=c}}G b}C 6x(a,b){b=53(a,b);8(2w(b)){b={'W':b}}O 8(1l(b)){b={'1G':b}}O 8(11(b)){b={'2L':b}}8(b.1e){8(1p(b.1e)||2w(b.1e)){b.1e={'2s':b.1e}}}G b}C 6J(a,b){8(1o(b.W)){b.W=b.W.1g(a)}8(1p(b.W)){b.W=$(b.W)}8(!1l(b.1G)){b.1G=I}8(!11(b.62)){b.62=0}8(1E(b.4X)){b.4X=I}8(!1l(b.63)){b.63=I}8(!11(b.2L)){b.2L=(b.1F<10)?9a:b.1F*5}8(b.1e){8(1o(b.1e.2s)){b.1e.2s=b.1e.2s.1g(a)}8(1p(b.1e.2s)){b.1e.2s=$(b.1e.2s)}8(b.1e.2s){8(!1o(b.1e.4B)){b.1e.4B=$.1r.1v.7B}8(!11(b.1e.5z)){b.1e.5z=50}}O{b.1e=K}}G b}C 5c(a,b){b=53(a,b);8(2w(b)){b={'W':b}}O 8(11(b)){b={'31':b}}G b}C 5k(a,b){8(1o(b.W)){b.W=b.W.1g(a)}8(1p(b.W)){b.W=$(b.W)}8(1p(b.31)){b.31=6g(b.31)}G b}C 6y(a,b){b=53(a,b);8(2w(b)){b={'1z':b}}O 8(1l(b)){b={'4Y':b}}G b}C 6K(a,b){8(1o(b.1z)){b.1z=b.1z.1g(a)}8(1p(b.1z)){b.1z=$(b.1z)}8(!11(b.D)){b.D=K}8(!1l(b.4Y)){b.4Y=K}8(!1o(b.3M)&&!54(b.3M)){b.3M=$.1r.1v.7z}8(!11(b.4T)){b.4T=0}G b}C 6z(a,b){8(1o(b)){b=b.1g(a)}8(1E(b)){b={'4i':K}}8(3q(b)){b={'4i':b}}O 8(11(b)){b={'D':b}}G b}C 6L(a,b){8(!1l(b.4i)){b.4i=I}8(!1l(b.5X)){b.5X=K}8(!1I(b.2I)){b.2I={}}8(!1l(b.2I.7E)){b.2I.7E=K}G b}C 6A(a,b){8(1o(b)){b=b.1g(a)}8(3q(b)){b={}}O 8(11(b)){b={'D':b}}O 8(1E(b)){b=K}G b}C 6M(a,b){G b}C 3K(a,b,c,d,e){8(1p(a)){a=$(a,e)}8(1I(a)){a=$(a,e)}8(2w(a)){a=e.14().7f(a);8(!1l(c)){c=K}}O{8(!1l(c)){c=I}}8(!11(a)){a=0}8(!11(b)){b=0}8(c){a+=d.Y}a+=b;8(d.P>0){2i(a>=d.P){a-=d.P}2i(a<0){a+=d.P}}G a}C 4E(i,o,s){E t=0,x=0;1j(E a=s;a>=0;a--){E j=i.1O(a);t+=(j.2f(':L'))?j[o.d['2y']](I):0;8(t>o.3V){G x}8(a==0){a=i.R}x++}}C 7h(i,o,s){G 6h(i,o.D.1t,o.D.T.4v,s)}C 6Z(i,o,s,m){G 6h(i,o.D.1t,m,s)}C 6h(i,f,m,s){E t=0,x=0;1j(E a=s,l=i.R;a>=0;a--){x++;8(x==l){G x}E j=i.1O(a);8(j.2f(f)){t++;8(t==m){G x}}8(a==0){a=l}}}C 5C(a,o){G o.D.T.4v||a.14().18(0,o.D.L).1t(o.D.1t).R}C 35(i,o,s){E t=0,x=0;1j(E a=s,l=i.R-1;a<=l;a++){E j=i.1O(a);t+=(j.2f(':L'))?j[o.d['2y']](I):0;8(t>o.3V){G x}x++;8(x==l+1){G x}8(a==l){a=-1}}}C 5N(i,o,s,l){E v=35(i,o,s);8(!o.1T){8(s+v>l){v=l-s}}G v}C 3X(i,o,s){G 6i(i,o.D.1t,o.D.T.4v,s,o.1T)}C 75(i,o,s,m){G 6i(i,o.D.1t,m+1,s,o.1T)-1}C 6i(i,f,m,s,c){E t=0,x=0;1j(E a=s,l=i.R-1;a<=l;a++){x++;8(x>=l){G x}E j=i.1O(a);8(j.2f(f)){t++;8(t==m){G x}}8(a==l){a=-1}}}C 3J(i,o){G i.18(0,o.D.L)}C 71(i,o,n){G i.18(n,o.D.T.1Z+n)}C 72(i,o){G i.18(0,o.D.L)}C 77(i,o){G i.18(0,o.D.T.1Z)}C 78(i,o,n){G i.18(n,o.D.L+n)}C 4z(i,o,d){8(o.1R){8(!1p(d)){d='29'}i.1W(C(){E j=$(1k),m=4l(j.X(o.d['1S']),10);8(!11(m)){m=0}j.1m(d,m)})}}C 1U(i,o,m){8(o.1R){E x=(1l(m))?m:K;8(!11(m)){m=0}4z(i,o,'7F');i.1W(C(){E j=$(1k);j.X(o.d['1S'],((x)?j.1m('7F'):m+j.1m('29')))})}}C 5u(i,o){8(o.2o){i.1W(C(){E j=$(1k),s=5q(j,['N','1d']);j.1m('7i',s)})}}C 5v(o,b){E c=o.D.L,7G=o.D[o.d['N']],6j=o[o.d['1d']],7H=3W(6j);b.1W(C(){E a=$(1k),6k=7G-7I(a,o,'9b');a[o.d['N']](6k);8(7H){a[o.d['1d']](4u(6k,6j))}})}C 4R(a,o){E b=a.6b(),$i=a.14(),$v=3J($i,o),55=4J(4K($v,o,I),o,K);b.X(55);8(o.1R){E p=o.1i,r=p[o.d[1]];8(o.1A&&r<0){r=0}E c=$v.2R();c.X(o.d['1S'],c.1m('29')+r);a.X(o.d['3r'],p[o.d[0]]);a.X(o.d['1n'],p[o.d[3]])}a.X(o.d['N'],55[o.d['N']]+(2T($i,o,'N')*2));a.X(o.d['1d'],6l($i,o,'1d'));G 55}C 4K(i,o,a){G[2T(i,o,'N',a),6l(i,o,'1d',a)]}C 6l(i,o,a,b){8(!1l(b)){b=K}8(11(o[o.d[a]])&&b){G o[o.d[a]]}8(11(o.D[o.d[a]])){G o.D[o.d[a]]}a=(a.6m().3S('N')>-1)?'2y':'3o';G 4o(i,o,a)}C 4o(i,o,b){E s=0;1j(E a=0,l=i.R;a<l;a++){E j=i.1O(a);E m=(j.2f(':L'))?j[o.d[b]](I):0;8(s<m){s=m}}G s}C 2T(i,o,b,c){8(!1l(c)){c=K}8(11(o[o.d[b]])&&c){G o[o.d[b]]}8(11(o.D[o.d[b]])){G o.D[o.d[b]]*i.R}E d=(b.6m().3S('N')>-1)?'2y':'3o',s=0;1j(E a=0,l=i.R;a<l;a++){E j=i.1O(a);s+=(j.2f(':L'))?j[o.d[d]](I):0}G s}C 5e(a,o,d){E b=a.2f(':L');8(b){a.4k()}E s=a.6b()[o.d[d]]();8(b){a.4n()}G s}C 5f(o,a){G(11(o[o.d['N']]))?o[o.d['N']]:a}C 6n(i,o,b){E s=K,v=K;1j(E a=0,l=i.R;a<l;a++){E j=i.1O(a);E c=(j.2f(':L'))?j[o.d[b]](I):0;8(s===K){s=c}O 8(s!=c){v=I}8(s==0){v=I}}G v}C 7I(i,o,d){G i[o.d['9c'+d]](I)-i[o.d[d.6m()]]()}C 4u(s,o){8(3W(o)){o=4l(o.18(0,-1),10);8(!11(o)){G s}s*=o/2J}G s}C H(n,c,a,b,d){8(!1l(a)){a=I}8(!1l(b)){b=I}8(!1l(d)){d=K}8(a){n=c.3z.44+n}8(b){n=n+'.'+c.3z.7y}8(b&&d){n+=c.3U}G n}C 2B(n,c){G(1p(c.6d[n]))?c.6d[n]:n}C 4J(a,o,p){8(!1l(p)){p=I}E b=(o.1R&&p)?o.1i:[0,0,0,0];E c={};c[o.d['N']]=a[0]+b[1]+b[3];c[o.d['1d']]=a[1]+b[0]+b[2];G c}C 3f(c,d){E e=[];1j(E a=0,7J=c.R;a<7J;a++){1j(E b=0,7K=d.R;b<7K;b++){8(d[b].3S(2Z c[a])>-1&&1E(e[b])){e[b]=c[a];16}}}G e}C 6H(p){8(1E(p)){G[0,0,0,0]}8(11(p)){G[p,p,p,p]}8(1p(p)){p=p.3R('9d').7L('').3R('9e').7L('').3R(' ')}8(!2X(p)){G[0,0,0,0]}1j(E i=0;i<4;i++){p[i]=4l(p[i],10)}1B(p.R){Q 0:G[0,0,0,0];Q 1:G[p[0],p[0],p[0],p[0]];Q 2:G[p[0],p[1],p[0],p[1]];Q 3:G[p[0],p[1],p[2],p[1]];2A:G[p[0],p[1],p[2],p[3]]}}C 4I(a,o){E x=(11(o[o.d['N']]))?1H.2C(o[o.d['N']]-2T(a,o,'N')):0;1B(o.1A){Q'1n':G[0,x];Q'3a':G[x,0];Q'5g':2A:G[1H.2C(x/2),1H.4m(x/2)]}}C 6B(o){E a=[['N','7M','2y','1d','7N','3o','1n','3r','1S',0,1,2,3],['1d','7N','3o','N','7M','2y','3r','1n','5r',3,2,1,0]];E b=a[0].R,7O=(o.2b=='3a'||o.2b=='1n')?0:1;E c={};1j(E d=0;d<b;d++){c[a[0][d]]=a[7O][d]}G c}C 4F(x,o,a,b){E v=x;8(1o(a)){v=a.1g(b,v)}O 8(1p(a)){E p=a.3R('+'),m=a.3R('-');8(m.R>p.R){E c=I,6o=m[0],32=m[1]}O{E c=K,6o=p[0],32=p[1]}1B(6o){Q'9f':v=(x%2==1)?x-1:x;16;Q'9g':v=(x%2==0)?x-1:x;16;2A:v=x;16}32=4l(32,10);8(11(32)){8(c){32=-32}v+=32}}8(!11(v)||v<1){v=1}G v}C 2z(x,o,a,b){G 6p(4F(x,o,a,b),o.D.T)}C 6p(v,i){8(11(i.36)&&v<i.36){v=i.36}8(11(i.1X)&&v>i.1X){v=i.1X}8(v<1){v=1}G v}C 5l(s){8(!2X(s)){s=[[s]]}8(!2X(s[0])){s=[s]}1j(E j=0,l=s.R;j<l;j++){8(1p(s[j][0])){s[j][0]=$(s[j][0])}8(!1l(s[j][1])){s[j][1]=I}8(!1l(s[j][2])){s[j][2]=I}8(!11(s[j][3])){s[j][3]=0}}G s}C 6g(k){8(k=='3a'){G 39}8(k=='1n'){G 37}8(k=='4s'){G 38}8(k=='5W'){G 40}G-1}C 5M(n,a,c){8(n){E v=a.1Q(H('4q',c));$.1r.1v.23.6e(n,v)}}C 7u(n){E c=$.1r.1v.23.3G(n);G(c=='')?0:c}C 5q(a,b){E c={},56;1j(E p=0,l=b.R;p<l;p++){56=b[p];c[56]=a.X(56)}G c}C 6C(a,b,c,d){8(!1I(a.T)){a.T={}}8(!1I(a.3O)){a.3O={}}8(a.3n==0&&11(d)){a.3n=d}8(1I(a.L)){a.T.36=a.L.36;a.T.1X=a.L.1X;a.L=K}O 8(1p(a.L)){8(a.L=='1c'){a.T.1c=I}O{a.T.2c=a.L}a.L=K}O 8(1o(a.L)){a.T.2c=a.L;a.L=K}8(!1p(a.1t)){a.1t=(c.1t(':3t').R>0)?':L':'*'}8(!a[b.d['N']]){8(b.2o){17(I,'7P a '+b.d['N']+' 1j 3L D!');a[b.d['N']]=4o(c,b,'2y')}O{a[b.d['N']]=(6n(c,b,'2y'))?'1c':c[b.d['2y']](I)}}8(!a[b.d['1d']]){a[b.d['1d']]=(6n(c,b,'3o'))?'1c':c[b.d['3o']](I)}a.3O.N=a.N;a.3O.1d=a.1d;G a}C 6G(a,b){8(a.D[a.d['N']]=='1c'){a.D.T.1c=I}8(!a.D.T.1c){8(11(a[a.d['N']])){a.D.L=1H.4m(a[a.d['N']]/a.D[a.d['N']])}O{a.D.L=1H.4m(b/a.D[a.d['N']]);a[a.d['N']]=a.D.L*a.D[a.d['N']];8(!a.D.T.2c){a.1A=K}}8(a.D.L=='9h'||a.D.L<1){17(I,'2r a 5P 27 4e L D: 7P 45 \"1c\".');a.D.T.1c=I}}G a}C 6D(a,b,c){8(a=='M'){a=4o(c,b,'2y')}G a}C 6E(a,b,c){8(a=='M'){a=4o(c,b,'3o')}8(!a){a=b.D[b.d['1d']]}G a}C 5j(o,a){E p=4I(3J(a,o),o);o.1i[o.d[1]]=p[1];o.1i[o.d[3]]=p[0];G o}C 5h(o,a,b){E c=6p(1H.2C(o[o.d['N']]/o.D[o.d['N']]),o.D.T);8(c>a.R){c=a.R}E d=1H.4m(o[o.d['N']]/c);o.D.L=c;o.D[o.d['N']]=d;o[o.d['N']]=c*d;G o}C 3P(p){8(1p(p)){E i=(p.3S('9i')>-1)?I:K,r=(p.3S('3h')>-1)?I:K}O{E i=r=K}G[i,r]}C 61(a){G(11(a))?a:2x}C 6q(a){G(a===2x)}C 1E(a){G(6q(a)||2Z a=='7Q'||a===''||a==='7Q')}C 2X(a){G(a 2Y 9j)}C 2w(a){G(a 2Y 7R)}C 1I(a){G((a 2Y 9k||2Z a=='2g')&&!6q(a)&&!2w(a)&&!2X(a))}C 11(a){G((a 2Y 4d||2Z a=='27')&&!9l(a))}C 1p(a){G((a 2Y 9m||2Z a=='2N')&&!1E(a)&&!3q(a)&&!54(a))}C 1o(a){G(a 2Y 9n||2Z a=='C')}C 1l(a){G(a 2Y 9o||2Z a=='3e'||3q(a)||54(a))}C 3q(a){G(a===I||a==='I')}C 54(a){G(a===K||a==='K')}C 3W(x){G(1p(x)&&x.18(-1)=='%')}C 2q(){G 6f 7C().2q()}C 2K(o,n){17(I,o+' 2f 9p, 9q 1j 9r 9s 9t 9u. 9v '+n+' 9w.')}C 17(d,m){8(1I(d)){E s=' ('+d.4p+')';d=d.17}O{E s=''}8(!d){G K}8(1p(m)){m='1v'+s+': '+m}O{m=['1v'+s+':',m]}8(3m.6r&&3m.6r.7S){3m.6r.7S(m)}G K}$.1N($.2l,{'9x':C(t){E a=t*t;G t*(-a*t+4*a-6*t+4)},'9y':C(t){G t*(4*t*t-9*t+6)},'9z':C(t){E a=t*t;G t*(33*a*a-9A*a*t+9B*a-67*t+15)}})})(7R);", 62, 596, "|||||||opts|if||||||||||||||||||||||||||||||function|items|var|conf|return|cf_e|true|itms|false|visible|auto|width|else|total|case|length|trigger|visibleConf|scrl|prev|button|css|first|next||is_number|bind|tt0|children||break|debug|slice|anims|pagination|push|variable|height|progress|stopPropagation|call|mousewheel|padding|for|this|is_boolean|data|left|is_function|is_string|swipe|fn|wrp|filter|tmrs|carouFredSel|fade|_onafter|_moveitems|container|align|switch|_s_paddingold|_s_paddingcur|is_undefined|duration|play|Math|is_object|cover|_position|opacity|scroll|extend|eq|_a_wrapper|triggerHandler|usePadding|marginRight|circular|sz_resetMargin|fx|each|max|i_cur_l|old|i_old_l|uncover|unbind|cookie||isScrolling|isPaused|number|a_cfs|_cfs_origCssMargin|clbk|direction|adjust|isStopped|stopImmediatePropagation|is|object|queu|while|i_new|w_siz|easing|nr|avail_primary|responsive|synchronise|getTime|Not|bar|i_new_l|a_cur|remove|is_jquery|null|outerWidth|cf_getItemsAdjust|default|cf_c|ceil|pR|_s_paddingnew|preventDefault|a_itm|pauseOnHover|options|100|deprecated|timeoutDuration|startTime|string|removeClass|sc_startScroll|queue|last|i_skp|ms_getTotalSize|a_old|a_lef|a_dur|is_array|instanceof|typeof||key|adj||opts_orig|gn_getVisibleItemsNext|min||||right|addClass|pause|perc|boolean|cf_sortParams|scrolling|resume|onAfter|i_old|crossfade|slideTo|window|start|outerHeight|_cfs_triggerEvent|is_true|top|position|hidden|sc_clearTimers|pre|post|timePassed|Carousel|events|infinite|nv_enableNavi|i_siz|i_siz_vis|_a_paddingold|_a_paddingcur|get|onBefore|updatePageStatus|gi_getCurrentItems|gn_getItemIndex|the|anchorBuilder|event|sizesConf|bt_pauseOnHoverConfig|ns2|split|indexOf|go_getObject|serialNumber|maxDimension|is_percentage|gn_getVisibleItemsNextFilter|orgCSS|zIndex||none|sc_stopScroll|dur2|prefix|to|appendTo|sc_setScroll|sc_fireCallbacks||currentPage|end|before|Number|of|document|touchwipe|wN|onTouch|onResize|hide|parseInt|floor|show|ms_getTrueLargestSize|selector|currentPosition|destroy|up|primarySizePercentage|ms_getPercentage|org|onTimeoutStart|onTimeoutPause|onTimeoutEnd|sz_storeMargin|stopped|updater|minimum|configuration|gn_getVisibleItemsPrev|cf_getAdjust|onEnd|clone|cf_getAlignPadding|cf_mapWrapperSizes|ms_getSizes|a_wsz|a_new|not|a_cfs_vis|updateSizes|eval|sz_setSizes|pgs|deviation|nv_showNavi|mouseenter|mouseleave|pauseOnEvent|keys|wipe||throttle|di|go_getNaviObject|is_false|sz|prop|element||starting_position|_cfs_isCarousel|_cfs_init|go_getPrevNextObject|defaults|ms_getParentSize|ms_getMaxDimension|center|in_getResponsiveValues|bottom|in_getAlignPadding|go_complementPrevNextObject|cf_getSynchArr|onPauseStart|onPausePause|onPauseEnd|pauseDuration|in_mapCss|marginBottom|newPosition|_cfs_origCss|sz_storeSizes|sz_setResponsiveSizes|_cfs_unbind_events|stop|finish|interval|type|conditions|gn_getVisibleOrg|backward|sc_hideHiddenItems|a_lef_vis|sc_getDuration|_a_paddingnew|sc_showHiddenItems|sc_mapCallbackArguments|sc_afterScroll|sc_fireQueue|cf_setCookie|gn_getVisibleItemsNextTestCircular|slideToPage|valid|linkAnchors|value|_cfs_bind_buttons|click|_cfs_unbind_buttons|scrolled|down|onMouse|swP|swN||bt_mousesheelNumber|delay|pauseOnResize|debounce|onWindowResize|_windowHeight||nh|ns3|wrapper|parent|continue|classnames|set|new|cf_getKeyCode|gn_getItemsPrevFilter|gn_getItemsNextFilter|seco|nw|ms_getLargestSize|toLowerCase|ms_hasVariableSizes|sta|cf_getItemAdjustMinMax|is_null|console|caroufredsel|No|found|go_getItemsObject|go_getScrollObject|go_getAutoObject|go_getPaginationObject|go_getSwipeObject|go_getMousewheelObject|cf_getDimensions|in_complementItems|in_complementPrimarySize|in_complementSecondarySize|upDateOnWindowResize|in_complementVisibleItems|cf_getPadding|500|go_complementAutoObject|go_complementPaginationObject|go_complementSwipeObject|go_complementMousewheelObject|_cfs_build|textAlign|float|marginTop|marginLeft|absolute|_cfs_bind_events|paused|enough|needed|page|slide_|gn_getScrollItemsPrevFilter|Scrolling|gi_getOldItemsPrev|gi_getNewItemsPrev|directscroll|concat|gn_getScrollItemsNextFilter|forward|gi_getOldItemsNext|gi_getNewItemsNext|jumpToStart|after|append|removeItem|round|hash|index|selected|gn_getVisibleItemsPrevFilter|_cfs_origCssSizes|Item|keyup|keyCode|plugin|scN|cursor|The|option|mcN|configs|classname|cf_getCookie|random|itm|onCreate|namespace|pageAnchorBuilder|span|progressbarUpdater|Date|_cfs_isHidden|triggerOnTouchEnd|_cfs_tempCssMargin|newS|secp|ms_getPaddingBorderMargin|l1|l2|join|innerWidth|innerHeight|dx|Set|undefined|jQuery|log|caroufredsel_cookie_|relative|fixed|overflow|setInterval|setTimeout|or|Callback|returned|Page|resumed|currently|slide_prev|prependTo|slide_next|prevPage|nextPage|prepend|carousel|insertItem|Correct|insert|Appending|item|add|detach|currentVisible|body|find|Preventing|non|sliding|replaceWith|widths|heights|automatically|touchSwipe|min_move_x|min_move_y|preventDefaultEvents|wipeUp|wipeDown|wipeLeft|wipeRight|ontouchstart|in|swipeUp|swipeDown|swipeLeft|swipeRight|move|200|300|resize|wrap|class|unshift|location|swing|cfs|div|caroufredsel_wrapper|href|charAt|setTime|1000|expires|toGMTString|path|orgDuration|animate|complete|shift|clearTimeout|clearInterval|skipped|Hiding|navigation|disabled|2500|Width|outer|px|em|even|odd|Infinity|immediate|Array|Object|isNaN|String|Function|Boolean|DEPRECATED|support|it|will|be|removed|Use|instead|quadratic|cubic|elastic|106|126".split("|"), 0, {}));
$(document).ready(function () {
    $(".bright").jScrollPane({
        wheelSpeed: 120
    });
    //$(".container").jScrollPane({
    //    wheelSpeed: 120
    //});
    $(".up").jScrollPane({
        wheelSpeed: 120
    });
    $(".bleft").jScrollPane({
        wheelSpeed: 120
    });
    $(".slidewrap").carousel({
        slider: ".slider",
        slide: ".slide",
        slideHed: ".slidehed",
        nextSlide: ".carousel-next",
        prevSlide: ".carousel-prev",
        addPagination: false,
        addNav: false
    });
    $(".slidewrap1").carousel({
        slider: ".slider",
        slide: ".slide",
        slideHed: ".slidehed",
        nextSlide: ".nextpart",
        prevSlide: ".prevpart",
        addPagination: false,
        addNav: false
    });
    $(".slidewrap2").carousel({
        slider: ".slider2",
        slide: ".slide2",
        slideHed: ".slidehed2",
        nextSlide: ".nextpart2",
        prevSlide: ".prevpart2",
        addPagination: false,
        addNav: false
    });
    $(".slidewrap4").carousel({
        slider: ".slider",
        slide: ".slide",
        slideHed: ".slidehed",
        nextSlide: ".next",
        prevSlide: ".prev",
        addPagination: false,
        addNav: false
    });
    $(".slidewrap6").carousel({
        slider: ".slider",
        slide: ".slide",
        slideHed: ".slidehed",
        nextSlide: ".next",
        prevSlide: ".prev",
        addPagination: false,
        addNav: true
    });
    $(".slidewrap20").carousel({
        slider: ".slider",
        slide: ".slide",
        addPagination: true,
        addNav: false
    });
    $('.slidewrap09').carousel({
        slider: '.slider',
        slide: '.slide',
        nextSlide: '.next',
        prevSlide: '.prev',
        addPagination: false,
        addNav: false
    });
    $(".move").click(function (event) {
        event.preventDefault();
        var her = $(this);
        $key = her.attr('data-key');
        $('.move').each(function () {
            $(this).removeClass('current');
        });
        her.addClass('current');
        $('.bot .slide').trigger('carouselmove', {
            moveTo: -($key * 100)
        });
    });
    $(".button").click(function () {
        var e = $(this);
        $(this).parent().children(".description").slideToggle(function () {
            if (e.hasClass("active")) {
                e.removeClass("active")
            } else {
                e.addClass("active")
            }
        })
    });
    $(".fancybox").fancybox();
    $(".blogimg").click(function () {
        var e = $(this);
        $(".bright").removeClass("active").filter(function (t) {
            return $(this).attr("id") === e.attr("id")
        }).addClass("active");
        $(".bright").jScrollPane({
            wheelSpeed: 120
        })
    })
});
$(function () {
    $("#thumbs").carouFredSel({
        responsive: true,
        circular: false,
        infinite: false,
        auto: false,
        prev: "#prev",
        next: "#next",
        items: {
            visible: {
                min: 2,
                max: 6
            },
            width: 150,
            height: "66%"
        }
    })
});

$(document).ready(function() {
 
  $("#owl-demo").owlCarousel({
 
      autoPlay: 3000, //Set AutoPlay to 3 seconds
 
      items : 3,
        navigation : true,
        pagination :false
  });
    $("#owl-demo2").owlCarousel({
 
      autoPlay: 3000, //Set AutoPlay to 3 seconds
 
      items : 5,
        navigation : true,
        pagination :false
  });
    $("#owl-demo3").owlCarousel({
 
      autoPlay: 3000, //Set AutoPlay to 3 seconds
 
      singleItem : true,
        navigation : false,
        pagination :false
  });
});