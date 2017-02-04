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
        active: {
            row: 0,
            col: 0
        },
        range: {
            sRow: 0,
            eRow: 0,
            sCol: 0,
            eCol: 0
        },
        changeActive: function (row, col) {
            this.active.row = row;
            this.active.col = col;
            return this;
        },
        changeRange: function (row, col) {
            var self = this.selectLines,
                change = this.changeLines;
            self.range.sCol = self.active.col;
            self.range.eCol = self.active.col;
            self.range.sRow = self.active.row;
            self.range.eRow = self.active.row;
            if (self.active.col > col) {
                self.range.sCol = col;
            } else {
                self.range.eCol = col;
            }
            if (self.active.row > row) {
                self.range.sRow = row;
            } else {
                self.range.eRow = row;
            }
            change.sRange = $.extend(true, change.sRange, self.range);
            change.eRange = $.extend(true, change.eRange, self.range);
            return self;
        }.bind(this),
        render: function () {
            var self = this.selectLines,
                rows = this.table.find('.excel-table-row'),
                cols = this.table.find('.excel-table-col'),
                units = this.table.find('.excel-table-unit');
            rows.removeClass('active');
            cols.removeClass('active');
            units.removeClass('active').removeClass('select');//.removeAttr('style');
            rows.slice(self.range.sRow, self.range.eRow + 1).addClass('active');
            cols.slice(self.range.sCol, self.range.eCol + 1).addClass('active');
            for (var i = self.range.sCol; i <= self.range.eCol; i++) {
                for (var j = self.range.sRow; j <= self.range.eRow; j++) {
                    $(units[i + j * (cols.length)]).addClass('active');
                }
            }
            $(units[self.active.col + self.active.row * (cols.length)]).addClass('select').trigger('focus');
            ExcelTable.template.subTable.setWidth(self, cols, self.range.sCol, self.range.eCol);
            ExcelTable.template.subTable.setHeight(self, rows, self.range.sRow, self.range.eRow);
            ExcelTable.template.subTable.setPosition(self, units, self.range.sCol, self.range.sRow, cols.length);
            self.target.find('.dot').css({
                top: self.top + self.height - 2,
                left: self.left + self.width - 2
            });
            ExcelTable.template.subTable.outLine(self);
        }.bind(this),
        getActive: function () {
            var self = this.selectLines,
                unit = $(this.table.find('.excel-table-unit')[self.active.col + self.active.row * (this.columns + 1)]);
            unit.trigger('focus');
            return unit;
        }.bind(this)
    };
    this.changeLines = {
        target: undefined,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        status: false,//move dot false
        sRange: {
            sRow: 0,
            eRow: 0,
            sCol: 0,
            eCol: 0
        },
        eRange: {
            sRow: 0,
            eRow: 0,
            sCol: 0,
            eCol: 0
        },
        direction: 'horizontal',//horizontal vertical
        type: 'increase',//increase decrease remove
        move: function (row, col) {
            var self = this.changeLines;
            self.eRange.sCol = col;
            if (self.eRange.sCol < 0) {
                self.eRange.sCol = 0;
            }
            self.eRange.eCol = self.eRange.sCol - self.sRange.sCol + self.sRange.eCol;
            if (self.eRange.eCol > this.columns) {
                self.eRange.eCol = this.columns;
                self.eRange.sCol = self.eRange.eCol + self.sRange.sCol - self.sRange.eCol;
            }
            self.eRange.sRow = row;
            if (self.eRange.sRow < 0) {
                self.eRange.sRow = 0;
            }
            self.eRange.eRow = self.eRange.sRow - self.sRange.sRow + self.sRange.eRow;
            if (self.eRange.eRow > this.rows) {
                self.eRange.eRow = this.rows;
                self.eRange.sRow = self.eRange.eRow + self.sRange.sRow - self.sRange.eRow;
            }
            return self;
        }.bind(this),
        render: function (row, col) {
            var self = this.changeLines,
                rows = this.table.find('.excel-table-row'),
                cols = this.table.find('.excel-table-col'),
                units = this.table.find('.excel-table-unit');
            ExcelTable.template.subTable.setWidth(self, cols, self.eRange.sCol, self.eRange.eCol);
            ExcelTable.template.subTable.setHeight(self, rows, self.eRange.sRow, self.eRange.eRow);
            ExcelTable.template.subTable.setPosition(self, units, self.eRange.sCol, self.eRange.sRow, cols.length);
            ExcelTable.template.subTable.outLine(self);
            return self;
        }.bind(this),
        afterAction: function () {
            var self = this.changeLines,
                select = this.selectLines;
            select.range = $.extend(true, select.range, self.eRange);
            self.sRange = $.extend(true, self.sRange, self.eRange);
            select.active.row = select.range.sRow;
            select.active.col = select.range.sCol;
            return this;
        }.bind(this),
        dot: function (row, col) {
            var self = this.changeLines;
            var tCol = col - self.sRange.eCol;
            var tRow = row - self.sRange.eRow;
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
            self.eRange = $.extend(true, self.eRange, self.sRange);
            if (self.direction == 'horizontal') {
                if (self.sRange.eCol <= col) {
                    self.type = 'increase';
                    self.eRange.eCol = col;
                } else if (self.sRange.sCol > col) {
                    self.type = 'decrease';
                    self.eRange.sCol = col;
                } else {
                    self.type = 'remove';
                    self.eRange.eCol = col;
                }
            } else {
                if (self.sRange.eRow <= row) {
                    self.type = 'increase';
                    self.eRange.eRow = row;
                } else if (self.sRange.sRow > row) {
                    self.type = 'decrease';
                    self.eRange.sRow = row;
                } else {
                    self.type = 'remove';
                    self.eRange.eRow = row;
                }
            }
            return self;
        }.bind(this)
    };
    this.rows = 0;
    this.columns = 0;
    this.units = [];
    this.result = [];
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
                    console.log(err);
                    unit.result = NaN;
                }
                result += '<td><div class="excel-table-unit" data-row="' + unit.row +
                    '" data-col="' + unit.column + '" tabindex="1" contenteditable="true">' + unit.result +
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
        this.selectLines.render();
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
        if (ExcelTable.calculator.isExpression(value)) {
            try {
                eval('result' + value);
            } catch (error) {
                result = NaN;
            }
        }
        return result;
    };
    this.init = ExcelTable.Table.initialize;
    this.action = new ExcelTable.Table.Action(this);
    this.history = new ExcelTable.Table.History(this);
};