/**
 * Created by Administrator on 2017/1/25.
 */
ExcelTable.table = {};
ExcelTable.Table = function () {
    this.target = undefined;
    this.table = undefined;
    this.selectLines = new ExcelTable.table.SelectLines(this);
    this.changeLines = new ExcelTable.table.ChangeLines(this);
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
                    unit.result = this.calculate(unit);
                } catch (error) {
                    console.log(error);
                    unit.result = NaN;
                }
                result += ExcelTable.template.unit(unit);
            }.bind(this));
            result += '</tr>';
        }.bind(this));
        result += '</tbody>';
        var header = '<thead><tr><th class="excel-table-dig"></th>';
        for (var i = 0; i < this.columns; i++) {
            header += '<th class="excel-table-col" data-col="' + i + '">' + i + '</th>';
        }
        header += '</tr></thead>';
        result = '<table>' + header + result + '</table>';
        this.table.find('table').remove();
        this.table.append(result);
        this.selectLines.render();
    };
    this.times = 0;
    this.calculate = function (unit) {
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
        if (unit.type == 'function') {
            var result;
            try {
                eval('result' + unit.value);
            } catch (error) {
                console.log(error);
                result = NaN;
            }
            return result;
        } else {
            return unit.value;
        }
    };
    this.init = ExcelTable.table.initialize.bind(this);
    this.action = new ExcelTable.table.Action(this);
    this.history = new ExcelTable.table.History(this);
};