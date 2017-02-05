/**
 * Created by irelance on 2017/2/3.
 */
ExcelTable.table.Action = function (parent) {
    this.private = {
        getText: function (sRow, sCol, eRow, eCol) {
            var txt = '';
            for (var j = sRow; j <= eRow; j++) {
                for (var i = sCol; i <= eCol; i++) {
                    txt += parent.result[j][i].value;
                    if (i == eCol && j != eRow) {
                        txt += "\n";
                    } else if (i != eCol) {
                        txt += "\t";
                    }
                }
            }
            return txt;
        },
        deleteText: function (sRow, sCol, eRow, eCol) {
            for (var j = sRow; j <= eRow; j++) {
                for (var i = sCol; i <= eCol; i++) {
                    ExcelTable.unit.setValue(parent.result[j][i], '');
                }
            }
        },
        pasteText: function (sRow, sCol, txt) {
            var CRLFs = ["\r\n", "\n\r", "\n", "\r"];
            var CRLF = false;
            for (var i in CRLFs) {
                if (txt.indexOf(CRLFs[i]) != -1) {
                    CRLF = CRLFs[i];
                    break;
                }
            }
            var rows = txt.split(CRLF),
                cols = [];
            rows.forEach(function (v, i) {
                cols = v.split("\t");
                cols.forEach(function (v, j) {
                    if (parent.result[sRow + i] && parent.result[sRow + i][sCol + j]) {
                        ExcelTable.unit.setValue(parent.result[sRow + i][sCol + j], v);
                    }
                });
            });
        }
    };
    this.copy = function () {
        var txt = this.private.getText(
            parent.selectLines.range.sRow,
            parent.selectLines.range.sCol,
            parent.selectLines.range.eRow,
            parent.selectLines.range.eCol
        );
        var clipboard = parent.target.find('.clipboard');
        clipboard.val(txt).show().trigger('select');
        document.execCommand('Copy');
        clipboard.hide();
        return parent;
    };
    this.delete = function () {
        this.private.deleteText(
            parent.selectLines.range.sRow,
            parent.selectLines.range.sCol,
            parent.selectLines.range.eRow,
            parent.selectLines.range.eCol
        );
        return parent;
    };
    this.paste = function (txt) {
        this.private.pasteText(parent.selectLines.active.row, parent.selectLines.active.col, txt);
        return parent;
    };
    this.import = function (mixed) {
        switch (typeof mixed) {
            case 'string':
                break;
            case 'object':
                parent.rows = mixed.rows ? mixed.rows : 0;
                parent.columns = mixed.columns ? mixed.columns : 0;
                parent.units = [];
                for (var i = 0; i < parent.rows; i++) {
                    for (var j = 0; j < parent.columns; j++) {
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
                if (unit.value) {
                    data.units.push({row: unit.row, column: unit.column, value: unit.value});
                }
            });
        });
        return data;
    };
    this.move = function (row, col) {
        var txt = this.private.getText(
            parent.selectLines.range.sRow,
            parent.selectLines.range.sCol,
            parent.selectLines.range.eRow,
            parent.selectLines.range.eCol
        );
        this.private.deleteText(
            parent.selectLines.range.sRow,
            parent.selectLines.range.sCol,
            parent.selectLines.range.eRow,
            parent.selectLines.range.eCol
        );
        this.private.pasteText(row, col, txt);
        return parent;
    };
    this.sort = function () {
    };
    this.insertRow = function (active, number) {
        var i, j;
        if (active < 0 && active >= -parent.rows) {
            active += parent.rows;
        } else if (active >= 0 && active <= parent.rows) {
        } else if (active == 'append') {
            active = parent.rows;
        } else {
            return false;
        }
        if (!number) {
            number = 1;
        }
        for (i = active; i < parent.rows; i++) {
            for (j = 0; j < parent.rows; j++) {
                parent.result[j][i].row += number;
            }
        }
        for (i = 0; i < parent.columns; i++) {
            for (j = active; j < active + number; j++) {
                parent.createUnit(j, i);
            }
        }
        parent.rows += number;
        return parent;
    };
    this.insertColumn = function (active, number) {
        var i, j;
        if (active < 0 && active >= -parent.columns) {
            active += parent.columns;
        } else if (active >= 0 && active <= parent.columns) {
        } else if (active == 'append') {
            active = parent.columns;
        } else {
            return false;
        }
        if (!number) {
            number = 1;
        }
        for (i = active; i < parent.columns; i++) {
            for (j = 0; j < parent.rows; j++) {
                parent.result[j][i].column += number;
            }
        }
        for (i = 0; i < parent.rows; i++) {
            for (j = active; j < active + number; j++) {
                parent.createUnit(i, j);
            }
        }
        parent.columns += number;
        return parent;
    };
    this.increaseHorizontal = function () {
        var iHorizontal = function (row, sRange, eRange) {
            var length = 0,
                number = 0,
                first = 0,
                last = 0,
                i, err;
            for (i = sRange.sCol; i <= sRange.eCol; i++) {
                if (parent.result[row][i].type == 'number') {
                    last = parent.result[row][i].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
                length++;
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = sRange.eCol + 1; i <= eRange.eCol; i++) {
                switch (parent.result[row][i - length].type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[row][i], parent.result[row][i - length].value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[row][i], parent.result[row][i - length].value + err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[row][i], parent.result[row][i - length].value);
                        break;
                }
            }
        };
        for (var j = parent.changeLines.eRange.sRow; j <= parent.changeLines.eRange.eRow; j++) {
            iHorizontal(j, parent.changeLines.sRange, parent.changeLines.eRange);
        }
    };
    this.increaseVertical = function () {
        var iVertical = function (col, sRange, eRange) {
            var length = 0,
                number = 0,
                first = 0,
                last = 0,
                i, err;
            for (i = sRange.sRow; i <= sRange.eRow; i++) {
                if (parent.result[i][col].type == 'number') {
                    last = parent.result[i][col].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
                length++;
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = sRange.eRow + 1; i <= eRange.eRow; i++) {
                switch (parent.result[i - length][col].type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[i][col], parent.result[i - length][col].value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[i][col], parent.result[i - length][col].value + err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[i][col], parent.result[i - length][col].value);
                        break;
                }
            }
        };
        for (var j = parent.changeLines.eRange.sCol; j <= parent.changeLines.eRange.eCol; j++) {
            iVertical(j, parent.changeLines.sRange, parent.changeLines.eRange);
        }
    };
    this.decreaseHorizontal = function () {
        var dHorizontal = function (row, sRange, eRange) {
            var length = 0,
                number = 0,
                first = 0,
                last = 0,
                i, err;
            for (i = sRange.sCol; i <= sRange.eCol; i++) {
                if (parent.result[row][i].type == 'number') {
                    last = parent.result[row][i].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
                length++;
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = eRange.sCol; i < sRange.sCol; i++) {
                switch (parent.result[row][i + length].type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[row][i], parent.result[row][i + length].value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[row][i], parent.result[row][i + length].value - err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[row][i], parent.result[row][i + length].value);
                        break;
                }
            }
        };
        for (var j = parent.changeLines.eRange.sRow; j <= parent.changeLines.eRange.eRow; j++) {
            dHorizontal(j, parent.changeLines.sRange, parent.changeLines.eRange);
        }
    };
    this.decreaseVertical = function () {
        var dVertical = function (col, sRange, eRange) {
            var length = 0,
                number = 0,
                first = 0,
                last = 0,
                i, err;
            for (i = sRange.sRow; i <= sRange.eRow; i++) {
                if (parent.result[i][col].type == 'number') {
                    last = parent.result[i][col].result;
                    if (!number) {
                        first = last;
                    }
                    number++;
                }
                length++;
            }
            err = (last - first) / (number - 1) * number;
            err = err ? err : 0;
            for (i = eRange.sRow; i < sRange.sRow; i++) {
                switch (parent.result[i + length][col].type) {
                    case 'function':
                        ExcelTable.unit.setValue(parent.result[i][col], parent.result[i + length][col].value);
                        break;
                    case 'number':
                        ExcelTable.unit.setValue(parent.result[i][col], parent.result[i + length][col].value - err);
                        break;
                    default:
                        ExcelTable.unit.setValue(parent.result[i][col], parent.result[i + length][col].value);
                        break;
                }
            }
        };
        for (var j = parent.changeLines.eRange.sCol; j <= parent.changeLines.eRange.eCol; j++) {
            dVertical(j, parent.changeLines.sRange, parent.changeLines.eRange);
        }
    };
};