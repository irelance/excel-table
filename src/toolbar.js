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
        this.items.forEach(function (block) {
            html += '<div class="toolbar-block">';
            block.forEach(function (v) {
                html += '<a class="' + v.className + '" title="' + v.className + '"></a>';
            });
            html += '</div>';
        });
        this.target.html(html);
    };
    this.bind = function () {
        for (var i in ExcelTable.toolbar.items) {
            this.target.on('click', '.' + i, ExcelTable.toolbar.items[i].handle.bind(this));
        }
    };
    this.addTable = function (table) {
        this.tables.push(table);
        this.active = table;
        table.toolbar = this;
    };
};

ExcelTable.toolbar = {
    items: {
        'export-raw': {
            className: 'export-raw',
            icon: 'fa fa-file-o',
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
            icon: 'fa fa-file-excel-o',
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
            icon: 'fa fa-folder-open-o',
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
        'copy': {
            className: 'copy',
            icon: 'fa fa-files-o',
            handle: function (e) {
                this.active.action.copy();
            }
        },
        'paste': {
            className: 'paste',
            icon: 'fa fa-clipboard',
            handle: function (e) {
                this.active.action.paste();
            }
        },
        'append-column': {
            className: 'append-column',
            icon: 'fa fa-columns',
            handle: function (e) {
                this.active.action.insertColumn('append').render();
            }
        },
        'append-row': {
            className: 'append-row',
            icon: '',
            handle: function (e) {
                this.active.action.insertRow('append').render();
            }
        }
    }
};
