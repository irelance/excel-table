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
            row: function (start, end) {
                var result = [];
                if (start > end) {
                    [start, end] = [end, start];
                }
                if (end > this.range.eRow) {
                    end = this.range.eRow;
                }
                if (this.origin.row >= start && this.origin.row <= end) {
                    return NaN;
                }
                for (var i = start; i <= end; i++) {
                    for (var j = 0; j < this.range.columns; j++) {
                        result.push(this.calculate(this.result[i][j]));
                    }
                }
                return result;
            },
            column: function (start, end) {
                var result = [];
                if (start > end) {
                    [start, end] = [end, start];
                }
                if (end > this.range.eCol) {
                    end = this.range.eCol;
                }
                if (this.origin.column >= start && this.origin.column <= end) {
                    return NaN;
                }
                for (var i = start; i <= end; i++) {
                    for (var j = 0; j < this.range.rows; j++) {
                        result.push(this.calculate(this.result[j][i]));
                    }
                }
                return result;
            },
            range: function (start, end) {
                var result = [], i, j;
                if (start[0] > end[0]) {
                    [start[0], end[0]] = [end[0], start[0]];
                }
                if (start[1] > end[1]) {
                    [start[1], end[1]] = [end[1], start[1]];
                }
                if (end[0] > this.range.eRow) {
                    end[0] = this.range.eRow;
                }
                if (end[1] > this.range.eCol) {
                    end[1] = this.range.eCol;
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
            sum: 'function (arr) {\
                arr = ExcelTable.calculator.functions.private.package(arr);\
                var result = 0;\
                arr.forEach(function (v) {\
                    if (typeof v != "number") {\
                        v = parseFloat(v);\
                        if (isNaN(v)) {\
                            v = 0;\
                        }\
                    }\
                    result += v;\
                });\
                return result;\
            }',
            count: 'function (arr) {\
                arr = ExcelTable.calculator.functions.private.package(arr);\
                var result = 0;\
                arr.forEach(function (v) {\
                    v = parseFloat(v);\
                    if (!isNaN(v)) {\
                        result++;\
                    }\
                });\
                return result;\
            }',
            avg: 'function (arr) {\
                return SUM(arr) / COUNT(arr);\
            }'
        }
    }
};