/**
 * Created by irelance on 2017/2/5.
 */
ExcelTable.table.SelectLines = function (parent) {
    this.target = undefined;
    this.top = 0;
    this.left = 0;
    this.width = 0;
    this.height = 0;
    this.status = false;
    this.active = new Rectangle();
    this.range = new Rectangle();
    this.changeActive = function (row, col) {
        this.active.setRange(row, col);
        parent.search.children('.key').val(ExcelTable.unit.convertDSTo26BS(col) + row).data('value', row + ',' + col);
        parent.search.children('.value').val(parent.result[row][col].value);
        return this;
    };
    this.changeRange = function (row, col) {
        var change = parent.changeLines;
        this.range.setRangeByDiagonal([this.active.sRow, this.active.sCol], [row, col]);
        change.sRange = $.extend(true, change.sRange, this.range);
        change.eRange = $.extend(true, change.eRange, this.range);
        return this;
    };
    this.render = function () {
        var rows = parent.table.find('.excel-table-row'),
            cols = parent.table.find('.excel-table-col'),
            units = parent.table.find('.excel-table-unit');
        rows.removeClass('active');
        cols.removeClass('active');
        units.removeClass('active').removeClass('select');
        rows.slice(this.range.sRow, this.range.eRow + 1).addClass('active');
        cols.slice(this.range.sCol, this.range.eCol + 1).addClass('active');
        for (var i = this.range.sCol; i <= this.range.eCol; i++) {
            for (var j = this.range.sRow; j <= this.range.eRow; j++) {
                $(units[i + j * (cols.length)]).addClass('select');
            }
        }
        this.getActiveView().addClass('active');
        ExcelTable.template.subTable.setWidth(this, cols, this.range.sCol, this.range.eCol);
        ExcelTable.template.subTable.setHeight(this, rows, this.range.sRow, this.range.eRow);
        ExcelTable.template.subTable.setPosition(this, units, this.range.sCol, this.range.sRow, cols.length);
        this.target.find('.dot').css({
            top: this.top + this.height - 2,
            left: this.left + this.width - 2
        });
        ExcelTable.template.subTable.outLine(this);
    };
    this.getActiveView = function () {
        var units = parent.table.find('.excel-table-unit'),
            input = units.children('input'),
            unit = $(units[this.active.sCol + this.active.sRow * parent.range.columns]);
        if (!input.length) {
            unit.trigger('focus');
        }
        parent.toolbar ? parent.toolbar.active = parent : '';
        return unit;
    };
    this.getActiveModel = function () {
        return parent.result[this.active.sRow][this.active.sCol];
    }
};