/**
 * Created by irelance on 2017/2/10.
 */
ExcelTable.table.Input = function (parent) {
    this.target = $('<input>');
    this.setValue = function (value) {
        this.target.val(value);
    };
    this.getValue = function () {
        return this.target.val();
    };
    this.storage = [];
    this.canSelect = false;
    this.replaceLength = 0;
    this.start = 0;
    this.end = 0;
    this.value = '';
    this.reset = function () {
        this.canSelect = false;
        this.replaceLength = 0;
        this.start = this.target[0].selectionStart;
        this.end = this.target[0].selectionEnd;
        this.value = this.getValue();
    };
    this.checkStatus = function () {
        this.reset();
        if (this.value.indexOf('=') == 0) {
            if (this.value[this.start - 1] == '(' ||
                this.value[this.start - 1] == ',' ||
                this.value[this.start - 1] == '=') {
                this.canSelect = true;
                return true;
            }
            var last = Math.max(
                    this.value.lastIndexOf('(', this.start),
                    this.value.lastIndexOf(',', this.start),
                    this.value.lastIndexOf('=', this.start)
                    ) + 1,
                length = this.start - last;
            if (this.value.substr(last, length).match(/^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/)) {
                this.canSelect = true;
                this.replaceLength = length;
            }
        }
    };
    this.getSelectRange = function () {
        var range = parent.selectLines.range,
            insert = ExcelTable.unit.convertDSTo26BS(range.sCol) + range.sRow +
                ':' + ExcelTable.unit.convertDSTo26BS(range.eCol) + range.eRow;
        this.value = this.value.split('');
        this.value.splice(this.start - this.replaceLength, this.end, insert);
        this.value = this.value.join('');
        this.setValue(this.value);
        this.target.trigger('focus');
        this.target[0].selectionStart = this.start + insert.length;
        this.target[0].selectionEnd = this.start + insert.length;
    };
};