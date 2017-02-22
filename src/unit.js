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
    },
    convert26BSToDS: function (code) {
        var num = -1;
        var reg = /^[A-Z]+$/g;
        if (!reg.test(code)) {
            return num;
        }
        for (var i = code.length - 1, j = 1; i >= 0; i--, j *= 26) {
            num += (code[i].charCodeAt() - 64 ) * j;
        }
        return num;
    },
    convertDSTo26BS: function (num) {
        var code = '', m;
        var reg = /^[0-9]+$/g;
        if (!reg.test(num)) {
            return code;
        }
        num++;
        while (num > 0) {
            m = num % 26;
            if (m == 0) {
                m = 26;
            }
            code = String.fromCharCode(64 + parseInt(m)) + code;
            num = ( num - m ) / 26;
        }
        return code;
    },
    rulers: [
        {
            name: 'replace range',
            sort: 1,
            global: /[A-Z]*[0-9]*:[A-Z]*[0-9]*/g,
            row: /([0-9]+):([0-9]+)/,
            col: /([A-Z]+):([A-Z]+)/,
            range: /([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/,
            handle: function (exp, v, i) {
                var matches;
                if (matches = v.match(this.row)) {
                    exp[i] = '$row(' + matches[1] + ',' + matches[2] + ')';
                } else if (matches = v.match(this.col)) {
                    exp[i] = '$col(' + ExcelTable.unit.convert26BSToDS(matches[1]) + ',' + ExcelTable.unit.convert26BSToDS(matches[2]) + ')';
                } else if (matches = v.match(this.range)) {
                    exp[i] = '$range([' + matches[2] + ',' + ExcelTable.unit.convert26BSToDS(matches[1]) + '],[' + matches[4] + ',' + ExcelTable.unit.convert26BSToDS(matches[3]) + '])';
                }
            },
            render: function (words, v, i) {
                words[i - 1] = words[i - 1].trim();
                words[i + 1] = words[i + 1].trim();
                if (words[i - 1].lastIndexOf('(') == words[i - 1].length - 1) {
                    words[i - 1] += '[';
                }
                if (words[i + 1].indexOf(')') == 0) {
                    words[i + 1] = ']' + words[i + 1];
                }
            }
        }, {
            name: 'replace one unit',
            sort: 2,
            global: /[A-Z]+[0-9]+/g,
            unit: /([A-Z]+)([0-9]+)/,
            handle: function (exp, v, i) {
                var matches;
                if (matches = v.match(this.unit)) {
                    exp[i] = '$one(' + matches[2] + ',' + ExcelTable.unit.convert26BSToDS(matches[1]) + ')';
                }
            },
            render: function (words, v, i) {
            }
        }
    ],
    parser: function (txt, ruler) {
        var placeholder = '<flag/>',
            breaker = '<break/>';
        var words = txt.replace(ruler.global, breaker + placeholder + breaker).split(breaker);
        var exp = txt.match(ruler.global);
        if (exp) {
            exp.forEach(function (v, i) {
                ruler.handle(exp, v, i);
            });
            words.forEach(function (v, i) {
                if (v == placeholder) {
                    ruler.render(words, v, i);
                    words[i] = exp.shift();
                }
            });
        }
        txt = words.join('');
        return txt;
    },
    parsing: function (txt) {
        this.rulers.sort(function (a, b) {
            return a.sort == b.sort ? 0 : a.sort > b.sort ? 1 : -1;
        });
        this.rulers.forEach(function (ruler) {
            txt = this.parser(txt, ruler);
        }.bind(this));
        return txt;
    }
};
