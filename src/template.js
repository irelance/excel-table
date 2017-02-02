/**
 * Created by Administrator on 2017/1/25.
 */

ExcelTable.template = {
    unit: function (value) {
        return '<tr><input type="text" value="' + value + '"></tr>';
    },
    subTable: {
        setPosition: function (subTable, units, sCol, sRow, columnLength) {
            var position = elementAbsoluteStation(units[sCol + sRow * (columnLength)]);
            subTable.top = position.top - 2 - 8;
            subTable.left = position.left - 2 - 8;
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