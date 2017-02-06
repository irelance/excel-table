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
            html += '<div class="toolbar-block';
            if (i == 0) {
                html += ' first';
            }
            html += '">';
            block.forEach(function (v) {
                html += '<button class="' + v.className + '" title="' + v.className + '"><i class="' + v.icon + '"></i></button>';
            });
            html += '</div>';
        });
        this.target.html(html);
    };
    this.bind = function () {
        var toolbar = this;
        for (var i in ExcelTable.toolbar.items) {
            toolbar.target.on('click', '.' + i, ExcelTable.toolbar.items[i].handle.bind(toolbar));
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
        'export-raw': {
            className: 'export-raw',
            icon: 'icon iconfont icon-export',
            handle: function (e) {
                var txt = this.active.action.export();
                var blob = new Blob([JSON.stringify(txt)]);
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("click", false, false);
                e.target.download = (new Date()).getTime() + '.json';
                e.target.href = URL.createObjectURL(blob);
                e.target.dispatchEvent(evt);
            }
        },
        'export-csv': {
            className: 'export-csv',
            icon: 'icon iconfont icon-file-csv',
            handle: function (e) {
                var txt = this.active.action.private.getText(0, 0, this.active.rows - 1, this.active.columns - 1);
                txt = txt.replace(/\t/g, '","');
                txt = txt.replace(/\n/g, '"\n"');
                txt = '"' + txt + '"';
                var blob = new Blob([txt]);
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("click", false, false);
                e.target.download = (new Date()).getTime() + '.csv';
                e.target.href = URL.createObjectURL(blob);
                e.target.dispatchEvent(evt);
            }
        },
        'import-raw': {
            className: 'import-raw',
            icon: 'icon iconfont icon-import',
            handle: function (e) {
                var input = $('<input type="file">'),
                    table = this.active;
                input.on('change', function () {
                    var reader = new FileReader();
                    reader.readAsText(this.files[0]);
                    reader.onload = function () {
                        table.action.import(JSON.parse(this.result)).render();
                    };
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
                var table = this.active,
                    txt = table.target.find('.clipboard').val();
                table.action.private.pasteText(table.selectLines.active.row, table.selectLines.active.col, txt);
                table.render();
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
        }
    }
};
