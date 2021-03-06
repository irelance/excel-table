/**
 * Created by irelance on 2017/2/5.
 */
ExcelTable.Toolbar = function () {
    this.target = undefined;
    this.active = undefined;
    this.tables = [];
    this.items = [[]];
    this.init = function (options) {
        this.target = $(options.target);
        options.items.forEach(function (v) {
            if (ExcelTable.toolbar.items[v]) {
                this.items[this.items.length - 1].push(ExcelTable.toolbar.items[v]);
            } else if (v == '|') {
                this.items.push([]);
            }
        }.bind(this));
        this.render();
        this.bind();
    };
    this.render = function () {
        var html = '';
        this.items.forEach(function (block, i) {
            html += '<div class="toolbar-block"><ul>';
            block.forEach(function (v) {
                if (v.children) {
                    html += '<li><button class="' + v.className + '" title="' + v.label + '"><i class="' + v.icon + '"></i><i class="icon iconfont icon-down"></i></button><ul class="children">';
                    v.children.forEach(function (vv) {
                        html += '<li><button class="' + ExcelTable.toolbar.items[vv].className +
                            '"><i class="' + ExcelTable.toolbar.items[vv].icon + '"></i>' + ExcelTable.toolbar.items[vv].label + '</button></li>';
                    });
                    html += '</ul></li>';
                } else {
                    html += '<li><button class="' + v.className + '" title="' + v.label + '"><i class="' + v.icon + '"></i></button></li>';
                }
            });
            html += '</ul></div>';
        });
        this.target.html(html);
    };
    this.bind = function () {
        var toolbar = this;
        for (var i in ExcelTable.toolbar.items) {
            if (ExcelTable.toolbar.items[i].handle) {
                toolbar.target.on('click', '.' + i, ExcelTable.toolbar.items[i].handle.bind(toolbar));
            }
        }
    };
    this.addTable = function (table) {
        this.tables.push(table);
        this.active = table;
        table.toolbar = this;
        table.resize();
    };
};

ExcelTable.toolbar = {
    items: {
        'export': {
            label: 'export',
            className: 'export',
            icon: 'icon iconfont icon-export',
            children: ['export-raw', 'export-csv']
        },
        'export-raw': {
            label: 'export raw',
            className: 'export-raw',
            icon: 'icon iconfont icon-file-json',
            handle: function (e) {
                var txt = this.active.action.export();
                var blob = new Blob([JSON.stringify(txt)]);
                downloadURI(URL.createObjectURL(blob), (new Date()).getTime() + '.json');
            }
        },
        'export-csv': {
            label: 'export csv',
            className: 'export-csv',
            icon: 'icon iconfont icon-file-csv',
            handle: function (e) {
                var txt = this.active.action.private.getText(this.active.range);
                txt = txt.replace(/\t/g, '","');
                txt = txt.replace(/\n/g, '"\n"');
                txt = '"' + txt + '"';
                var blob = new Blob([txt]);
                downloadURI(URL.createObjectURL(blob), (new Date()).getTime() + '.csv');
            }
        },
        'import': {
            label: 'import',
            className: 'import',
            icon: 'icon iconfont icon-import',
            handle: function (e) {
                var input = $('<input type="file">'),
                    table = this.active;
                input.on('change', function () {
                    var reader = new FileReader(),
                        file = this.files[0];
                    if (file.type == "application/vnd.ms-excel" && file.name.match(/\.csv$/)) {
                        reader.readAsText(file);
                        reader.onload = function () {
                            table.action.import(table.action.private.csv2json(this.result)).render();
                        };
                    } else if (file.name.match(/\.json$/)) {
                        reader.readAsText(file);
                        reader.onload = function () {
                            table.action.import(JSON.parse(this.result)).render();
                        };
                    }
                });
                input.trigger('click');
            }
        },
        'undo': {
            label: 'undo',
            className: 'undo',
            icon: 'icon iconfont icon-undo',
            handle: function (e) {
                this.active.history.undo();
            }
        },
        'redo': {
            label: 'redo',
            className: 'redo',
            icon: 'icon iconfont icon-redo',
            handle: function (e) {
                this.active.history.redo();
            }
        },
        'cut': {
            label: 'cut',
            className: 'cut',
            icon: 'icon iconfont icon-cut',
            handle: function (e) {
                this.active.action.copy().action.delete().render();
            }
        },
        'copy': {
            label: 'copy',
            className: 'copy',
            icon: 'icon iconfont icon-copy',
            handle: function (e) {
                this.active.action.copy();
            }
        },
        'paste': {
            label: 'paste',
            className: 'paste',
            icon: 'icon iconfont icon-paste',
            handle: function (e) {
                // can not paste from system clipboard
                var table = this.active,
                    txt = table.target.find('.clipboard').val();
                table.action.paste(txt).render();
            }
        },
        'append-column': {
            label: 'append column',
            className: 'append-column',
            icon: 'icon iconfont icon-column-append',
            handle: function (e) {
                this.active.action.insertColumn('append').render();
            }
        },
        'append-row': {
            label: 'append row',
            className: 'append-row',
            icon: 'icon iconfont icon-row-append',
            handle: function (e) {
                this.active.action.insertRow('append').render();
            }
        },
        'sort-asc': {
            label: 'sort by asc',
            className: 'sort-asc',
            icon: 'icon iconfont icon-sort-by-asc',
            handle: function (e) {
                this.active.action.sort('asc').render();
            }
        },
        'sort-desc': {
            label: 'sort by desc',
            className: 'sort-desc',
            icon: 'icon iconfont icon-sort-by-desc',
            handle: function (e) {
                this.active.action.sort('desc').render();
            }
        },
        'auto-fill': {
            label: 'auto fill',
            className: 'auto-fill',
            icon: 'icon iconfont icon-fill',
            children: ['auto-fill-bottom', 'auto-fill-right', 'auto-fill-top', 'auto-fill-left']
        },
        'auto-fill-left': {
            label: 'auto fill to left',
            className: 'auto-fill-left',
            icon: 'icon iconfont icon-fill-left',
            handle: function (e) {
                this.active.action.autoFillLeft(this.active.selectLines.range.sCol).render();
            }
        },
        'auto-fill-right': {
            label: 'auto fill to right',
            className: 'auto-fill-right',
            icon: 'icon iconfont icon-fill-right',
            handle: function (e) {
                this.active.action.autoFillRight(this.active.range.eCol - this.active.selectLines.range.eCol).render();
            }
        },
        'auto-fill-top': {
            label: 'auto fill to top',
            className: 'auto-fill-top',
            icon: 'icon iconfont icon-fill-top',
            handle: function (e) {
                this.active.action.autoFillTop(this.active.selectLines.range.sRow).render();
            }
        },
        'auto-fill-bottom': {
            label: 'auto fill to bottom',
            className: 'auto-fill-bottom',
            icon: 'icon iconfont icon-fill-bottom',
            handle: function (e) {
                this.active.action.autoFillBottom(this.active.range.eRow - this.active.selectLines.range.eRow).render();
            }
        },
        'paste-transform': {
            label: 'paste & transform',
            className: 'paste-transform',
            icon: 'icon iconfont icon-transform',
            handle: function (e) {
                // can not paste from system clipboard
                var table = this.active,
                    rows = table.target.find('.clipboard').val().split("\n"),
                    units = [];
                rows.forEach(function (row, i) {
                    row = row.split("\t");
                    row.forEach(function (unit, j) {
                        if (!units[j]) {
                            units[j] = [];
                        }
                        units[j][i] = unit;
                    })
                });
                units.forEach(function (rows, i) {
                    units[i] = rows.join("\t");
                });
                units = units.join("\n");
                table.action.paste(units).render();
            }
        }
    }
};
