/**
 * Created by Administrator on 2017/1/25.
 */

ExcelTable.Unit = function (row, column) {
    this.id = undefined;
    this.row = row;
    this.column = column;
    this.value = '';
    this.result = NaN;
    this.setData = function (obj) {
        obj.forEach(function (v) {
            this[v.key] = v.value;
        }.bind(this));
    };
    this.render = function () {
        return $(ExcelTable.template.unit(this.result));
    };
};