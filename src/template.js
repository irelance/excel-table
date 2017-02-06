/**
 * Created by irelance on 2017/1/25.
 */

ExcelTable.template = {
    table: '<div class="excel-table-toolbar"></div>' +
    '<div class="excel-table-search"><input class="key"><div class="break"><i class="icon iconfont icon-function">&nbsp;</i></div><input class="value"></div>' +
    '<div class="excel-table-content">' +
    '<div class="excel-table-select-lines">' +
    '<div class="w"></div><div class="s"></div><div class="a"></div><div class="d"></div>' +
    '<div class="dot"></div>' +
    '</div>' +
    '<div class="excel-table-change-lines">' +
    '<div class="w"></div><div class="s"></div><div class="a"></div><div class="d"></div>' +
    '</div>' +
    '</div>' +
    '<textarea class="clipboard"></textarea>',
    unit: function (unit) {
        return '<td><div class="excel-table-unit" data-row="' + unit.row +
            '" data-col="' + unit.column + '" tabindex="1" contenteditable="true">' + unit.result +
            '</div></td>';
    },
    input: function (input) {
        var unit = input.parent(),
            table = unit.closest('.excel-table-content'),
            minWidth = unit.width()-4,
            textWidth = input.val().length * 12,
            position = elementAbsoluteStation(unit[0]),
            maxWidth = table.width() - position.left - 22 + table[0].scrollLeft;
        if (textWidth < minWidth) {
            textWidth = minWidth;
        } else if (textWidth > maxWidth) {
            textWidth = maxWidth;
        }
        input.width(textWidth);
        input.height(unit.height()-6);
    },
    subTable: {
        setPosition: function (subTable, units, sCol, sRow, columnLength) {
            var position = elementAbsoluteStation(units[sCol + sRow * (columnLength)]);
            subTable.top = position.top - 2;
            subTable.left = position.left - 2;
        },
        setWidth: function (subTable, cols, sCol, eCol) {
            subTable.width = 0;
            cols.each(function (i) {
                if (i >= sCol && i <= eCol) {
                    subTable.width += $(this).width() + 2;
                }
            });
        },
        setHeight: function (subTable, rows, sRow, eRow) {
            subTable.height = 0;
            rows.each(function (i) {
                if (i >= sRow && i <= eRow) {
                    subTable.height += $(this).height() + 2;
                }
            });
        },
        outLine: function (subTable) {
            subTable.target.find('.w').css({
                width: subTable.width,
                top: subTable.top,
                left: subTable.left
            });
            subTable.target.find('.s').css({
                width: subTable.width,
                top: subTable.top + subTable.height,
                left: subTable.left
            });
            subTable.target.find('.a').css({
                height: subTable.height,
                top: subTable.top,
                left: subTable.left
            });
            subTable.target.find('.d').css({
                height: subTable.height,
                top: subTable.top,
                left: subTable.left + subTable.width
            });
            subTable.target.show();
        }
    }
};