/**
 * Created by irelance on 2017/1/25.
 */

ExcelTable.Unit = function (row, column) {
    this.id = undefined;
    this.row = row;
    this.column = column;
    this.value = '';
    this.result = NaN;
    this.type = 'string';
};

ExcelTable.unit = {
    setValue: function (unit, value) {
        if (typeof value == 'number' || (value.match && value.match(/^(-?\d+)(\.\d+)?$/))) {
            value = parseFloat(value);
            unit.type = 'number';
        } else if (value[0] == '=' && value.length > 1) {
            unit.type = 'function';
        } else {
            unit.type = 'string';
        }
        unit.value = value;
    }
};
