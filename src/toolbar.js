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
                    html += '<li><button class="' + v.className + '" title="' + v.className + '"><i class="' + v.icon + '"></i><i class="icon iconfont icon-down"></i></button><ul class="children">';
                    v.children.forEach(function (vv) {
                        html += '<li><button class="' + ExcelTable.toolbar.items[vv].className +
                            '"><i class="' + ExcelTable.toolbar.items[vv].icon + '"></i>' + ExcelTable.toolbar.items[vv].className + '</button></li>';
                    });
                    html += '</ul></li>';
                } else {
                    html += '<li><button class="' + v.className + '" title="' + v.className + '"><i class="' + v.icon + '"></i></button></li>';
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
            className: 'export',
            icon: 'icon iconfont icon-export',
            children: ['export-raw', 'export-csv']
        },
        'export-raw': {
            className: 'export-raw',
            icon: 'icon iconfont icon-file-json',
            handle: function (e) {
                var txt = this.active.action.export();
                var blob = new Blob([JSON.stringify(txt)]);
                downloadURI(URL.createObjectURL(blob), (new Date()).getTime() + '.json');
            }
        },
        'export-csv': {
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
            className: 'undo',
            icon: 'icon iconfont icon-undo',
            handle: function (e) {
                this.active.history.undo();
            }
        },
        'redo': {
            className: 'redo',
            icon: 'icon iconfont icon-redo',
            handle: function (e) {
                this.active.history.redo();
            }
        },
        'cut': {
            className: 'cut',
            icon: 'icon iconfont icon-cut',
            handle: function (e) {
                this.active.action.copy().action.delete().render();
            }
        },
        'copy': {
            className: 'copy',
            icon: 'icon iconfont icon-copy',
            handle: function (e) {
                this.active.action.copy();
            }
        },
        'paste': {
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
            className: 'append-column',
            icon: 'icon iconfont icon-column-append',
            handle: function (e) {
                this.active.action.insertColumn('append').render();
            }
        },
        'append-row': {
            className: 'append-row',
            icon: 'icon iconfont icon-row-append',
            handle: function (e) {
                this.active.action.insertRow('append').render();
            }
        },
        'sort-asc': {
            className: 'sort-asc',
            icon: 'icon iconfont icon-sort-by-asc',
            handle: function (e) {
                this.active.action.sort('asc').render();
            }
        },
        'sort-desc': {
            className: 'sort-desc',
            icon: 'icon iconfont icon-sort-by-desc',
            handle: function (e) {
                this.active.action.sort('desc').render();
            }
        }
    }
};
