/**
 * Created by irelance on 2017/1/28.
 */

ExcelTable.calculator = {
    functions: {
        finds: {
            one: function (row, column) {
                if (this.origin.row == row && this.origin.column == column) {
                    return NaN;
                }
                if (isNaN(this.result[row][column].result)) {
                    return this.calculate(this.result[row][column]);
                }
                return this.result[row][column].result;
            },
            row: function (row, range) {
                var result = [];
                if (!range) {
                    range = [];
                }
                if (!range[0]) {
                    range[0] = 0;
                }
                if (range[1] == undefined) {
                    range[1] = this.range.eCol;
                }
                if (this.origin.row == row && this.origin.column >= range[0] && this.origin.column <= range[1]) {
                    return NaN;
                }
                for (var i = range[0]; i <= range[1]; i++) {
                    result.push(this.calculate(this.result[row][i]));
                }
                return result;
            },
            column: function (column, range) {
                var result = [];
                if (!range) {
                    range = [];
                }
                if (!range[0]) {
                    range[0] = 0;
                }
                if (range[1] == undefined) {
                    range[1] = this.range.eRow;
                }
                if (this.origin.column == column && this.origin.row >= range[0] && this.origin.row <= range[1]) {
                    return NaN;
                }
                for (var j = range[0]; j <= range[1]; j++) {
                    result.push(this.calculate(this.result[j][column]));
                }
                return result;
            },
            range: function (start, end) {
                var result = [], i, j;
                if (!start[0]) {
                    start[0] = 0;
                }
                if (!start[1]) {
                    start[1] = 0;
                }
                if (end[0] == undefined) {
                    end[0] = this.range.eRow;
                }
                if (end[1] == undefined) {
                    end[1] = this.range.eCol;
                }
                if (start[0] > end[0]) {
                    [start[0], end[0]] = [end[0], start[0]];
                }
                if (start[1] > end[1]) {
                    [start[1], end[1]] = [end[1], start[1]];
                }
                if (this.origin.column >= start[1] &&
                    this.origin.column <= end[1] &&
                    this.origin.row >= start[0] &&
                    this.origin.row <= end[0]) {
                    return NaN;
                }
                for (j = start[1]; j <= end[1]; j++) {
                    for (i = start[0]; i <= end[0]; i++) {
                        result.push(this.calculate(this.result[i][j]));
                    }
                }
                return result;
            }
        },
        private: {
            package: function (value) {
                var result = [];
                if (typeof value == 'object') {
                    for (var i in value) {
                        result = result.concat(this.package(value[i]));
                    }
                } else {
                    result.push(value);
                }
                return result;
            }
        },
        public: {
            sum: function (arr) {
                arr = ExcelTable.calculator.functions.private.package(arr);
                var result = 0;
                arr.forEach(function (v) {
                    v = parseFloat(v);
                    result += v;
                });
                return result;
            }
        }
    }
};