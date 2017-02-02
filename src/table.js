/**
 * Created by Administrator on 2017/1/25.
 */

ExcelTable.Table = function () {
    this.target = undefined;
    this.table = undefined;
    this.selectLines = {
        target: undefined,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        status: false,
        row: 0,
        col: 0,
        render: function (row, col) {
            var self = this.selectLines,
                change = this.changeLines,
                rows = this.table.find('.excel-table-row'),
                cols = this.table.find('.excel-table-col'),
                units = this.table.find('.excel-table-unit');
            rows.removeClass('active');
            cols.removeClass('active');
            units.removeClass('active').removeAttr('style');
            change.col.start = self.col;
            change.col.end = self.col;
            change.row.start = self.row;
            change.row.end = self.row;
            if (self.col > col) {
                change.col.start = col;
            } else {
                change.col.end = col;
            }
            if (self.row > row) {
                change.row.start = row;
            } else {
                change.row.end = row;
            }
            self.height = 0;
            self.width = 0;
            for (var i = change.col.start; i <= change.col.end; i++) {
                $(cols[i]).addClass('active');
                for (var j = change.row.start; j <= change.row.end; j++) {
                    $(rows[j]).addClass('active');
                    $(units[i + j * (cols.length)]).addClass('active');
                    if (i == change.col.start) {
                        self.height += $(units[i + j * (cols.length)]).height() + 2;
                    }
                    if (j == change.row.start) {
                        self.width += $(units[i + j * (cols.length)]).width() + 2;
                    }
                }
            }
            $(units[self.col + self.row * (cols.length)]).removeClass('active');
            ExcelTable.template.subTable.setPosition(self, units, change.col.start, change.row.start, cols.length);
            self.target.find('.dot').css({
                top: self.top + self.height - 2,
                left: self.left + self.width - 2
            });
            ExcelTable.template.subTable.outLine(self);
        }.bind(this)
    };
    this.changeLines = {
        target: undefined,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        status: false,//move dot false
        row: {
            start: 0,
            end: 0
        },
        col: {
            start: 0,
            end: 0
        },
        direction: 'middle',//horizontal vertical middle
        type: 'increase',//increase decrease remove
        renderMove: function (row, col) {
            var self = this.changeLines,
                rows = this.table.find('.excel-table-row'),
                cols = this.table.find('.excel-table-col'),
                units = this.table.find('.excel-table-unit');
            var sCol = col;
            if (sCol < 0) {
                sCol = 0;
            }
            var eCol = sCol - self.col.start + self.col.end;
            if (eCol > this.columns) {
                eCol = this.columns;
                sCol = eCol + self.col.start - self.col.end;
            }
            var sRow = row;
            if (sRow < 0) {
                sRow = 0;
            }
            var eRow = sRow - self.row.start + self.row.end;
            if (eRow > this.rows) {
                eRow = this.rows;
                sRow = eRow + self.row.start - self.row.end;
            }
            ExcelTable.template.subTable.setWidth(self, cols, sCol, eCol);
            ExcelTable.template.subTable.setHeight(self, rows, sRow, eRow);
            ExcelTable.template.subTable.setPosition(self, units, sCol, sRow, cols.length);
            ExcelTable.template.subTable.outLine(self);
        }.bind(this),
        renderDot: function (row, col) {
            var self = this.changeLines,
                rows = this.table.find('.excel-table-row'),
                cols = this.table.find('.excel-table-col'),
                units = this.table.find('.excel-table-unit'),
                position;
            var tCol = col - self.col.end;
            var tRow = row - self.row.end;
            if (tCol * tRow >= 0) {
                if (Math.abs(tCol) > Math.abs(tRow)) {
                    self.direction = 'horizontal';
                } else {
                    self.direction = 'vertical';
                }
            } else if (tCol > 0) {
                self.direction = 'horizontal';
            } else {
                self.direction = 'vertical';
            }
            self.top = -2 - 8;
            self.left = -2 - 8;
            position = elementAbsoluteStation(units[self.col.start + self.row.start * (this.columns + 1)]);
            if (self.direction == 'horizontal') {
                if (self.col.end <= col) {
                    self.type = 'increase';
                    ExcelTable.template.subTable.setWidth(self, cols, self.col.start, col);
                } else if (self.col.start > col) {
                    self.type = 'decrease';
                    ExcelTable.template.subTable.setWidth(self, cols, col, self.col.end);
                    position = elementAbsoluteStation(units[col + self.row.start * (this.columns + 1)]);
                } else {
                    self.type = 'remove';
                    ExcelTable.template.subTable.setWidth(self, cols, self.col.start, col);
                }
                ExcelTable.template.subTable.setHeight(self, rows, self.row.start, self.row.end);
            } else {
                if (self.row.end <= row) {
                    self.type = 'increase';
                    ExcelTable.template.subTable.setHeight(self, rows, self.row.start, row);
                } else if (self.row.start > row) {
                    self.type = 'decrease';
                    ExcelTable.template.subTable.setHeight(self, rows, row, self.row.end);
                    position = elementAbsoluteStation(units[self.col.start + row * (this.columns + 1)]);
                } else {
                    self.type = 'remove';
                    ExcelTable.template.subTable.setHeight(self, rows, self.row.start, row);
                }
                ExcelTable.template.subTable.setWidth(self, cols, self.col.start, self.col.end);
            }
            self.top += position.top;
            self.left += position.left;
            ExcelTable.template.subTable.outLine(self);
        }.bind(this)
    };
    this.rows = 0;
    this.columns = 0;
    this.units = [];
    this.result = [];
    this.sort = function () {
    };
    this.dimOne2Two = function () {
        this.result = [];
        this.units.forEach(function (v) {
            if (!this.result[v.row]) {
                this.result[v.row] = [];
            }
            this.result[v.row][v.column] = v;
        }.bind(this));
    };
    this.createUnit = function (row, column) {
        var unit = new ExcelTable.Unit(row, column);
        unit.id = this.units.length;
        this.units.push(unit);
    };
    this.insertRow = function (num) {
        var i = 0, j = 0;
        if (!num || num > this.rows) {
            num = this.rows + 1;
        }
        if (num < 0) {
            num = 0;
        }
        for (i = 0; i < this.columns; i++) {
            this.createUnit(num, i);
        }
        for (i = num; i < this.rows; i++) {
            for (j = 0; j < this.columns; j++) {
                this.units[this.result[i][j]].row++;
            }
        }
        this.rows++;
        this.render();
    };
    this.insertColumn = function (num) {
        var i = 0, j = 0;
        if (!num || num > this.columns) {
            num = this.columns + 1;
        }
        if (num < 0) {
            num = 0;
        }
        for (i = 0; i < this.rows; i++) {
            this.createUnit(num, i);
        }
        for (i = num; i < this.columns; i++) {
            for (j = 0; j < this.rows; j++) {
                this.units[this.result[i][j]].columns++;
            }
        }
        this.columns++;
        this.render();
    };
    this.render = function () {
        this.dimOne2Two();
        var result = '<tbody>';
        this.result.forEach(function (row, i) {
            result += '<tr><th class="excel-table-row" data-row="' + i + '">' + i + '</th>';
            row.forEach(function (unit, j) {
                this.times = 0;
                try {
                    unit.result = this.calculate(unit.value);
                } catch (err) {
                    console.log('execute to many times');
                    unit.result = NaN;
                }
                result += '<td><div class="excel-table-unit" data-row="' + unit.row +
                    '" data-col="' + unit.column + '" tabindex="1">' + unit.result +
                    '</div></td>';
            }.bind(this));
            result += '</tr>';
        }.bind(this));
        result += '</tbody>';
        var header = '<thead><tr><th class="excel-table-dig"></th>';
        for (var i = 0; i <= this.columns; i++) {
            header += '<th class="excel-table-col" data-col="' + i + '">' + i + '</th>';
        }
        header += '</tr></thead>';
        result = '<table>' + header + result + '</table>';
        this.table.find('table').remove();
        this.table.append(result);
        this.selectLines.render(this.changeLines.row.end, this.changeLines.col.end);
    };
    this.times = 0;
    this.calculate = function (value) {
        this.times++;
        if (this.times > this.columns * this.rows * 3) {
            throw 'execute to many times';
        }
        var $ = function (row, column) {
            var type = typeof row + '-' + typeof column;
            switch (type) {
                case 'number-number':
                    return $one(row, column);
                case 'number-object':
                    return $row(row, column);
                case 'object-number':
                    return $col(column, row);
                case 'object-object':
                    return $range(row, column);
                default:
                    return NaN;
            }
        }.bind(this);
        var $one = ExcelTable.calculator.functions.finds.one.bind(this);
        var $row = ExcelTable.calculator.functions.finds.row.bind(this);
        var $col = ExcelTable.calculator.functions.finds.column.bind(this);
        var $range = ExcelTable.calculator.functions.finds.range.bind(this);
        for (var i in ExcelTable.calculator.functions.public) {
            eval('var ' + i.toUpperCase() + '=ExcelTable.calculator.functions.public.' + i);
        }
        var result = value;
        if (value[0] == '=' && value.length > 1) {
            try {
                eval('result' + value);
            } catch (error) {
                result = NaN;
            }
        }
        return result;
    };
    this.init = function (options) {
        var table = this;
        this.target = $(options.target);
        this.target.html(
            '<div class="excel-table-content">' +
            '<div class="excel-table-select-lines">' +
            '<div class="w"></div><div class="s"></div><div class="a"></div><div class="d"></div>' +
            '<div class="dot"></div>' +
            '</div>' +
            '<div class="excel-table-change-lines">' +
            '<div class="w"></div><div class="s"></div><div class="a"></div><div class="d"></div>' +
            '</div>' +
            '</div>'
        );
        this.table = this.target.children('.excel-table-content');
        this.selectLines.target = this.table.children('.excel-table-select-lines');
        this.changeLines.target = this.table.children('.excel-table-change-lines');
        this.rows = options.rows ? options.rows : 0;
        this.columns = options.columns ? options.columns : 0;
        if (this.rows && this.columns) {
            for (var i = 0; i <= this.rows; i++) {
                for (var j = 0; j <= this.columns; j++) {
                    this.createUnit(i, j);
                }
            }
            this.dimOne2Two();
            if (options.data) {
                options.data.forEach(function (v) {
                    this.result[v.row][v.column].value = v.value;
                }.bind(this));
            }
        }
        this.render();

        this.table
            .on('keydown', 'input', function (e) {
                var self = $(this);
                var unit = self.parent(),
                    row = unit.data('row'),
                    col = unit.data('col');
                switch (e.keyCode) {
                    case 27:
                        self.val(table.result[row][col].value);
                    case 13:
                        var triggerEvent = jQuery.Event('mousedown');
                        triggerEvent.button = 0;
                        unit.trigger(triggerEvent).trigger('mouseup');
                        break;
                }
                e.stopPropagation();
            })
            .on('change', 'input', function (e) {
                var unit = $(this).parent(),
                    row = unit.data('row'),
                    col = unit.data('col');
                table.result[row][col].value = $(this).val();
                table.render();
                $(table.table.find('.excel-table-unit')[table.selectLines.col + table.selectLines.row * (table.columns + 1)])
                    .trigger('mousedown').trigger('mouseup');
                e.stopPropagation();
            })
            .on('mousedown dblclick', 'input', function (e) {
                e.stopPropagation();
            })
            .on('mousedown', '.excel-table-unit', function (e) {
                if (e.button == 0) {
                    if (!table.changeLines.status) {
                        if (table.selectLines.status) {
                            $(this).trigger('mouseup');
                        } else {
                            var unit = $(this),
                                row = unit.data('row'),
                                col = unit.data('col'),
                                rows = table.table.find('.excel-table-row'),
                                cols = table.table.find('.excel-table-col'),
                                units = table.table.find('.excel-table-unit');
                            rows.removeClass('active');
                            cols.removeClass('active');
                            units.removeClass('active').removeAttr('style');
                            $(rows[row]).addClass('active');
                            $(cols[col]).addClass('active');
                            table.selectLines.status = true;
                            table.selectLines.row = row;
                            table.selectLines.col = col;
                            table.selectLines.render(row, col);
                            units.find('input').trigger('blur');
                        }
                    }
                } else if (e.button == 2) {

                }
                return false;
            })
            .on('mousedown', '.dot', function (e) {
                if (e.button == 0) {
                    table.changeLines.status = 'dot';
                    table.changeLines.renderDot(table.changeLines.row.end, table.changeLines.col.end);
                }
                return false;
            })
            .on('mousedown', '.w,.s,.a,.d', function (e) {
                if (e.button == 0) {
                    table.changeLines.status = 'move';
                    table.changeLines.renderMove(table.changeLines.row.start, table.changeLines.col.start);
                }
                return false;
            })
            .on('mouseover', '.excel-table-unit', function (e) {
                var unit = $(this),
                    row = unit.data('row'),
                    col = unit.data('col');
                if (table.selectLines.status) {
                    table.selectLines.render(row, col);
                }
                switch (table.changeLines.status) {
                    case 'dot':
                        table.changeLines.renderDot(row, col);
                        break;
                    case 'move':
                        table.changeLines.renderMove(row, col);
                        break;
                }
            })
            .on('mouseup', '.excel-table-unit', function (e) {
                if (table.selectLines.status) {
                    var units = table.table.find('.excel-table-unit');
                    table.selectLines.status = false;
                    $(units[table.selectLines.col + table.selectLines.row * (table.columns + 1)]).trigger('focus');
                }
                if (table.changeLines.status) {
                    table.changeLines.status = false;
                }
                table.changeLines.target.hide();
            })
            .on('dblclick', '.excel-table-unit', function (e) {
                var unit = $(this),
                    row = unit.data('row'),
                    col = unit.data('col');
                var input = $('<input value="' + table.result[row][col].value + '"/>');
                input.width(unit.width());
                unit.html(input);
                unit.children().trigger('select');
            })
            .on('blur', 'input', function (e) {
                var unit = $(this).parent(),
                    row = unit.data('row'),
                    col = unit.data('col');
                unit.html(table.result[row][col].result);
                e.stopPropagation();
            })
            .on('keydown', '.excel-table-unit', function (e) {
                var unit = $(this),
                    row = unit.data('row'),
                    col = unit.data('col'),
                    units = table.table.find('.excel-table-unit');
                if (e.keyCode >= 37 && e.keyCode <= 40) {
                    switch (e.keyCode) {
                        case 38:
                            --row < 0 ? row = 0 : '';
                            break;
                        case 40:
                            ++row > table.rows ? row = table.rows : '';
                            break;
                        case 37:
                            --col < 0 ? col = 0 : '';
                            break;
                        case 39:
                            ++col > table.columns ? col = table.columns : '';
                            break;
                    }
                    if (e.shiftKey) {
                        table.selectLines.render(row, col);
                        $(units[col + row * (table.columns + 1)]).trigger('focus');
                    } else {
                        table.selectLines.col = col;
                        table.selectLines.row = row;
                        $(units[table.selectLines.col + table.selectLines.row * (table.columns + 1)]).trigger('mousedown').trigger('mouseup');
                    }
                } else if (
                    (!(e.altKey || e.metaKey || e.ctrlKey)) &&
                    (
                        e.keyCode == 8 ||
                        e.keyCode == 32 ||
                        (e.keyCode >= 48 && e.keyCode <= 57) ||
                        (e.keyCode >= 65 && e.keyCode <= 90) ||
                        (e.keyCode >= 96 && e.keyCode <= 111) ||
                        (e.keyCode >= 186 && e.keyCode <= 192) ||
                        (e.keyCode >= 219 && e.keyCode <= 222)
                    )
                ) {
                    unit.trigger('dblclick');
                    //unit.find('input').trigger('keydown', e);
                } else {
                    console.log(e.keyCode);
                }
                e.stopPropagation();
            })
            .on('scroll', function (e) {
                $(this).find('.excel-table-col').css('top', this.scrollTop);
                $(this).find('.excel-table-row').css('left', this.scrollLeft);
                $(this).find('.excel-table-dig').css({
                    'top': this.scrollTop,
                    'left': this.scrollLeft
                });
            })
            .on('click', '.excel-table-col', function (e) {
                var col = $(this).data('col');
                table.selectLines.col = col;
                table.selectLines.row = 0;
                table.selectLines.render(table.rows, col);
            })
            .on('contextmenu', '.excel-table-col', function (e) {
                $(this).trigger('click');
                e.preventDefault();
                //e.stopPropagation();
            })
            .on('click', '.excel-table-row', function (e) {
                var row = $(this).data('row');
                table.selectLines.col = 0;
                table.selectLines.row = row;
                table.selectLines.render(row, table.columns);
            })
            .on('contextmenu', '.excel-table-row', function (e) {
                $(this).trigger('click');
                e.preventDefault();
                //e.stopPropagation();
            })
            .on('click', '.excel-table-dig', function (e) {
                table.selectLines.col = 0;
                table.selectLines.row = 0;
                table.selectLines.render(table.rows, table.columns);
            })
            .on('contextmenu', '.excel-table-unit', function (e) {
                $(this).trigger('click');
                e.preventDefault();
                //e.stopPropagation();
            })
    };
};