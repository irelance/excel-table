/**
 * Created by Administrator on 2017/2/10.
 */
ExcelTable.input = {
    target: $('input'),
    setValue: function (value) {
        this.target.val(value);
    },
    getValue: function () {
        return this.target.val();
    },
    storage: [],
    canSelect: function () {
        var value = this.getValue();
        return value.indexOf('=') == 0 &&
            this.target[0].selectionStart == this.target[0].selectionEnd &&
            (
                value[this.target[0].selectionEnd - 1] == '('||
                value[this.target[0].selectionEnd - 1] == ','||
                value[this.target[0].selectionEnd - 1] == '='
            );
    }
};