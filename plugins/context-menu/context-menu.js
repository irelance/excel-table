/*
 * context-menu.js
 * Copyright Irelance
 * MIT License
 */

var ContextMenu = ContextMenu || function (opt) {
        this.eventList = [];
        this.target = $('<div class="context-menu"></div>');
        this.context = undefined;//to store the jQuery object which trigger this context menu
        this.storage = null;//a position allow action to store some value in
        this.options = {
            fadeSpeed: 100
        };
        this.init = function (opts) {
            $('body').append(this.target);
            this.options = $.extend({}, this.options, opts);
            $(document)
                .on('click', 'html', function () {
                    var contextmenu = this.target.children('.context-menu-context');
                    this.destroyEvents();
                    contextmenu.fadeOut(this.options.fadeSpeed, function () {
                        contextmenu.css({display: ''}).find('.drop-left').removeClass('drop-left');
                    });
                }.bind(this))
                .on('contextmenu', '.context-menu-context', function (e) {
                    e.preventDefault();
                })
                .on('mouseenter', '.context-menu-submenu', function () {
                    var $sub = $(this).find('.context-menu-context-sub:first'),
                        subWidth = $sub.width(),
                        subLeft = $sub.offset().left,
                        collision = (subWidth + subLeft) > window.innerWidth;
                    if (collision) {
                        $sub.addClass('drop-left');
                    }
                });

        };
        this.settings = function (opts) {
            this.options = $.extend({}, this.options, opts);
        };
        this.buildMenu = function (data, id, subMenu) {
            var subClass = (subMenu) ? ' context-menu-context-sub' : '',
                $menu = $('<ul class="context-menu-menu context-menu-context' + subClass + '" id="context-menu-' + id + '"></ul>');
            var i = 0, linkTarget = '';
            for (i; i < data.length; i++) {
                if (typeof data[i].divider !== 'undefined') {
                    $menu.append('<li class="divider"></li>');
                } else if (typeof data[i].header !== 'undefined') {
                    $menu.append('<li class="nav-header">' + data[i].header + '</li>');
                } else {
                    // [Attr] display
                    if (typeof data[i].display == 'undefined') {
                        data[i].display = function () {
                            return true;
                        }
                    }
                    if (!data[i].display()) {
                        continue;
                    }
                    // [Attr] href
                    if (typeof data[i].href == 'undefined') {
                        data[i].href = '#';
                    }
                    // [Attr] icon
                    if (typeof data[i].icon == 'undefined') {
                        data[i].icon = '';
                    }
                    // [Attr] target
                    if (typeof data[i].target !== 'undefined') {
                        linkTarget = ' target="' + data[i].target + '"';
                    }
                    // [Attr] subMenu
                    if (typeof data[i].subMenu !== 'undefined') {
                        $sub = ('<li class="context-menu-submenu"><a tabindex="-1" href="' + data[i].href + '"><i class="' + data[i].icon + '"></i>' + data[i].text + '</a></li>');
                    } else {
                        $sub = $('<li><a tabindex="-1" href="' + data[i].href + '"' + linkTarget + '><i class="' + data[i].icon + '"></i>' + data[i].text + '</a></li>');
                    }
                    // [Attr] disable
                    if (typeof data[i].disable == 'undefined') {
                        data[i].disable = function () {
                            return false;
                        }
                    }
                    if (data[i].disable()) {
                        $sub.addClass('disabled');
                        $sub.find('a').removeAttr('href').attr('onclick', '(function (e) {e.stopPropagation();})(event)');
                    } else {
                        // [Attr] action
                        if (typeof data[i].action !== 'undefined') {
                            var actiond = new Date(),
                                actionID = 'event-' + actiond.getTime() * Math.floor(Math.random() * 100000),
                                eventAction = data[i].action;
                            this.eventList.push(actionID);
                            $sub.find('a').attr('id', actionID);
                            $(document).on('click', '#' + actionID, eventAction);
                        }
                    }
                    $menu.append($sub);
                    if (typeof data[i].subMenu != 'undefined') {
                        var subMenuData = this.buildMenu(data[i].subMenu, id, true);
                        $menu.find('li:last').append(subMenuData);
                    }
                }
            }
            return $menu;
        };

        this.attach = function (selector, data) {
            var d = new Date(),
                id = d.getTime(),
                self = this;
            $(document).on('contextmenu', selector, function (e) {
                self.context = $(this);
                var $menu = self.buildMenu(data, id);
                self.target.html($menu);
                e.preventDefault();
                e.stopPropagation();
                $('.context-menu-context:not(.context-menu-context-sub)').hide();
                $dd = $('#context-menu-' + id);
                $dd.css({
                    top: e.pageY,
                    left: e.pageX
                }).fadeIn(self.options.fadeSpeed);
            });
        };
        this.destroyEvents = function () {
            this.eventList.forEach(function (v) {
                $(document).off('click', '#' + v);
            });
            this.eventList = [];
        };
        this.destroy = function (selector) {
            $(document).off('contextmenu', selector);
            this.destroyEvents();
            this.target.html('');
        };
        this.init(opt);
    };
