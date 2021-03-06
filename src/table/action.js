/**
 * Created by irelance on 2017/2/3.
 */
ExcelTable.table.Action = function (parent) {
    this.private = {
        getText: function (rectangle) {
            var txt = '';
            for (var j = rectangle.sRow; j <= rectangle.eRow; j++) {
                for (var i = rectangle.sCol; i <= rectangle.eCol; i++) {
                    txt += parent.result[j][i].value;
                    if (i == rectangle.eCol && j != rectangle.eRow) {
                        txt += "\n";
                    } else if (i != rectangle.eCol) {
                        txt += "\t";
                    }
                }
            }
            return txt;
        },
        deleteText: function (rectangle) {
            for (var j = rectangle.sRow; j <= rectangle.eRow; j++) {
                for (var i = rectangle.sCol; i <= rectangle.eCol; i++) {
                    ExcelTable.unit.setValue(parent.result[j][i], '');
                }
            }
        },
        getCRLF: function (txt) {
            var CRLFs = ["\r\n", "\n\r", "\n", "\r"];
            var CRLF = false;
            for (var i in CRLFs) {
                if (txt.indexOf(CRLFs[i]) != -1) {
                    CRLF = CRLFs[i];
                    break;
                }
            }
            return CRLF;
        },
        pasteText: function (sRow, sCol, txt) {
            var CRLF = this.getCRLF(txt);
            var rows = txt.split(CRLF),
                cols = [];
            var extraRows = sRow + rows.length - parent.range.rows;
            if (extraRows > 0) {
                parent.action.insertRow('append', extraRows);
                parent.dimOne2Two();
            }
            rows.forEach(function (v, i) {
                cols = v.split("\t");
                var extraCols = sCol + cols.length - parent.range.columns;
                if (extraCols > 0) {
                    parent.action.insertColumn('append', extraCols);
                    parent.dimOne2Two();
                }
                cols.forEach(function (v, j) {
                    if (parent.result[sRow + i] && parent.result[sRow + i][sCol + j]) {
                        ExcelTable.unit.setValue(parent.result[sRow + i][sCol + j], v);
                    }
                });
            });
        },
        csv2json: function (txt) {
            var CRLF = this.getCRLF(txt),
                rows = txt.split(CRLF),
                match = /^"(.*)"$/,
                data = {
                    rows: 0,
                    columns: 0,
                    units: []
                };
            rows.forEach(function (cols, i) {
                cols = cols.split(',');
                cols.forEach(function (unit, j) {
                    unit = unit.replace(match, '$1');
                    data.units.push({row: i, column: j, value: unit});
                    data.columns = j + 1;
                    data.rows = i + 1;
                })
            });
            return data;
        }
    };
    this.copy = function () {
        var txt = this.private.getText(parent.selectLines.range);
        var clipboard = parent.target.find('.clipboard');
        clipboard.val(txt).trigger('select');
        document.execCommand('Copy');
        return parent;
    };
    this.delete = function () {
        this.private.deleteText(parent.selectLines.range);
        return parent;
    };
    this.paste = function (txt) {
        this.private.pasteText(parent.selectLines.active.sRow, parent.selectLines.active.sCol, txt);
        parent.selectLines.changeActive(parent.selectLines.active.sRow, parent.selectLines.active.sCol);
        return parent;
    };
    this.import = function (mixed) {
        switch (typeof mixed) {
            case 'string':
                break;
            case 'object':
                if (typeof mixed.columns == 'number') {
                    mixed.columns = (new Array(mixed.columns)).join(',').split(',').map(function () {
                        return 72;//width 72px
                    });
                }
                if (typeof mixed.rows == 'number') {
                    mixed.rows = (new Array(mixed.rows)).join(',').split(',').map(function () {
                        return 21;//height 21px
                    });
                }
                parent.range.setRangeByDistance([0, 0], mixed.columns.length ? mixed.columns.length : 1, mixed.rows.length ? mixed.rows.length : 1);
                parent.units = [];
                for (var i = 0; i < parent.range.rows; i++) {
                    for (var j = 0; j < parent.range.columns; j++) {
                        parent.createUnit(i, j);
                    }
                }
                parent.dimOne2Two();
                if (mixed.units) {
                    mixed.units.forEach(function (v) {
                        ExcelTable.unit.setValue(parent.result[v.row][v.column], v.value);
                    });
                }
                break;
        }
        parent.columns = mixed.columns;
        parent.rows = mixed.rows;
        return parent;
    };
    this.export = function () {
        var data = {
            rows: parent.rows,
            columns: parent.columns,
            units: []
        };
        parent.result.forEach(function (row, i) {
            row.forEach(function (unit, j) {
                if (unit.value == 0 || unit.value) {
                    data.units.push({row: unit.row, column: unit.column, value: unit.value});
                }
            });
        });
        return data;
    };
    this.move = function (row, col) {
        var txt = this.private.getText(parent.selectLines.range);
        this.private.deleteText(parent.selectLines.range);
        this.private.pasteText(row, col, txt);
        return parent;
    };
    this.sort = function (type) {
        switch (type) {
            case 'asc':
                type = 1;
                break;
            case 'desc':
                type = -1;
                break;
            default:
                return false;
        }
        var sCol = parent.selectLines.range.sCol,
            eCol = parent.selectLines.range.eCol;
        if (parent.selectLines.range.sCol == parent.selectLines.active.sCol && parent.selectLines.range.eCol == parent.selectLines.active.sCol) {
            sCol = 0;
            eCol = parent.range.eCol;
        }
        var list = [];
        for (var i = parent.selectLines.range.sRow; i <= parent.selectLines.range.eRow; i++) {
            list.push(parent.result[i][parent.selectLines.active.sCol]);
        }
        list.sort(function (a, b) {
            if (a.result == '' && b.result != '') {
                return 1;
            } else if (a.result != '' && b.result == '') {
                return -1;
            }
            if (typeof a.result != 'number' && typeof b.result == 'number') {
                return type;
            } else if (typeof a.result == 'number' && typeof b.result != 'number') {
                return -type
            }
            return a.result == b.result ? 0 : a.result > b.result ? type : -type;
        });
        list.forEach(function (v, i) {
            parent.result[v.row].forEach(function (unit) {
                if (unit.column >= sCol && unit.column <= eCol) {
                    unit.row = i;
                }
            });
        });
        return parent;
    };
    this.deleteRow = function (start, end) {
        if (start > end) {
            [start, end] = [end, start];
        }
        if (start < 0) {
            start = 0;
        }
        if (end > parent.range.eRow) {
            end = parent.range.eRow;
        }
        var number = end - start + 1;
        for (i = end + 1; i <= parent.range.eRow; i++) {
            for (j = 0; j < parent.range.columns; j++) {
                parent.result[i][j].row -= number;
            }
        }
        parent.result.splice(start, number);
        parent.dimTwo2One();
        parent.range.eRow -= number;
        parent.range.rows -= number;
        if (!parent.units.length) {
            this.insertRow(0);
        }
        return parent;
    };
    this.insertRow = function (active, number) {
        var i, j;
        if (active < 0 && active >= -parent.range.rows) {
            active += parent.range.rows;
        } else if (active >= 0 && active <= parent.range.rows) {
        } else if (active == 'append') {
            active = parent.range.rows;
        } else {
            return false;
        }
        if (!number) {
            number = 1;
        }
        for (i = active; i < parent.range.rows; i++) {
            for (j = 0; j < parent.range.columns; j++) {
                parent.result[i][j].row += number;
            }
        }
        for (i = 0; i < parent.range.columns; i++) {
            for (j = active; j < active + number; j++) {
                parent.createUnit(j, i);
            }
        }
        parent.range.eRow += number;
        parent.range.rows += number;
        return parent;
    };
    this.deleteColumn = function (start, end) {
        if (start > end) {
            [start, end] = [end, start];
        }
        if (start < 0) {
            start = 0;
        }
        if (end > parent.range.eCol) {
            end = parent.range.eCol;
        }
        var number = end - start + 1;
        for (i = 0; i <= parent.range.eRow; i++) {
            for (j = end + 1; j < parent.range.columns; j++) {
                parent.result[i][j].column -= number;
            }
        }
        parent.result.forEach(function (row) {
            row.splice(start, number);
        });
        parent.dimTwo2One();
        parent.range.eCol -= number;
        parent.range.columns -= number;
        if (!parent.units.length) {
            this.insertColumn(0);
        }
        return parent;
    };
    this.insertColumn = function (active, number) {
        var i, j;
        if (active < 0 && active >= -parent.range.columns) {
            active += parent.range.columns;
        } else if (active >= 0 && active <= parent.range.columns) {
        } else if (active == 'append') {
            active = parent.range.columns;
        } else {
            return false;
        }
        if (!number) {
            number = 1;
        }
        for (i = active; i < parent.range.columns; i++) {
            for (j = 0; j < parent.range.rows; j++) {
                parent.result[j][i].column += number;
            }
        }
        for (i = 0; i < parent.range.rows; i++) {
            for (j = active; j < active + number; j++) {
                parent.createUnit(i, j);
            }
        }
        parent.range.eCol += number;
        parent.range.columns += number;
        return parent;
    };
    this.autoFillRight = function (length) {
        var err, number, first, last, i, j, end, selectRange = parent.selectLines.range;
        for (j = selectRange.sRow; j <= selectRange.eRow; j++) {
            number = 0;
            first = 0;
            last = 0;
            for (i = selectRange.sCol; i <= selectRange.eCol; i++) {
                if (parent.result[j][i].type == 'number') {
                    last = parent.result[j][i].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = selectRange.eCol + 1, end = selectRange.eCol + length; i <= end; i++) {
                var unit = parent.result[j][i - selectRange.columns];
                switch (unit.type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[j][i], unit.value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[j][i], unit.value + err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[j][i], unit.value);
                        break;
                }
            }
        }
        return parent;
    };
    this.autoFillBottom = function (length) {
        var err, number, first, last, i, j, end, selectRange = parent.selectLines.range;
        for (j = selectRange.sCol; j <= selectRange.eCol; j++) {
            number = 0;
            first = 0;
            last = 0;
            for (i = selectRange.sRow; i <= selectRange.eRow; i++) {
                if (parent.result[i][j].type == 'number') {
                    last = parent.result[i][j].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = selectRange.eRow + 1, end = selectRange.eRow + length; i <= end; i++) {
                var unit = parent.result[i - selectRange.rows][j];
                switch (unit.type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[i][j], unit.value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[i][j], unit.value + err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[i][j], unit.value);
                        break;
                }
            }
        }
        return parent;
    };
    this.autoFillLeft = function (length) {
        var err, number, first, last, i, j, end, selectRange = parent.selectLines.range;
        for (j = selectRange.sRow; j <= selectRange.eRow; j++) {
            number = 0;
            first = 0;
            last = 0;
            for (i = selectRange.sCol; i <= selectRange.eCol; i++) {
                if (parent.result[j][i].type == 'number') {
                    last = parent.result[j][i].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = selectRange.sCol - 1, end = selectRange.sCol - length; i >= end; i--) {
                var unit = parent.result[j][i + selectRange.columns];
                switch (unit.type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[j][i], unit.value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[j][i], unit.value - err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[j][i], unit.value);
                        break;
                }
            }
        }
        return parent;
    };
    this.autoFillTop = function (length) {
        var err, number, first, last, i, j, end, selectRange = parent.selectLines.range;
        for (j = selectRange.sCol; j <= selectRange.eCol; j++) {
            number = 0;
            first = 0;
            last = 0;
            for (i = selectRange.sRow; i <= selectRange.eRow; i++) {
                if (parent.result[i][j].type == 'number') {
                    last = parent.result[i][j].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = selectRange.sRow - 1, end = selectRange.sRow - length; i >= end; i--) {
                var unit = parent.result[i + selectRange.rows][j];
                switch (unit.type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[i][j], unit.value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[i][j], unit.value - err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[i][j], unit.value);
                        break;
                }
            }
        }
        return parent;
    };
};