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
    this.active = {
        row: 0,
        col: 0
    };
    this.range = {
        sRow: 0,
        eRow: 0,
        sCol: 0,
        eCol: 0
    };
    this.changeActive = function (row, col) {
        this.active.row = row;
        this.active.col = col;
        parent.search.children('.key').val(row + ',' + col).data('value',row + ',' + col);
        parent.search.children('.value').val(parent.result[row][col].value);
        return this;
    };
    this.changeRange = function (row, col) {
        var change = parent.changeLines;
        this.range.sCol = this.active.col;
        this.range.eCol = this.active.col;
        this.range.sRow = this.active.row;
        this.range.eRow = this.active.row;
        if (this.active.col > col) {
            this.range.sCol = col;
        } else {
            this.range.eCol = col;
        }
        if (this.active.row > row) {
            this.range.sRow = row;
        } else {
            this.range.eRow = row;
        }
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
        units.removeClass('active').removeClass('select');//.removeAttr('style');
        rows.slice(this.range.sRow, this.range.eRow + 1).addClass('active');
        cols.slice(this.range.sCol, this.range.eCol + 1).addClass('active');
        for (var i = this.range.sCol; i <= this.range.eCol; i++) {
            for (var j = this.range.sRow; j <= this.range.eRow; j++) {
                $(units[i + j * (cols.length)]).addClass('active');
            }
        }
        $(units[this.active.col + this.active.row * (cols.length)]).addClass('select').trigger('focus');
        ExcelTable.template.subTable.setWidth(this, cols, this.range.sCol, this.range.eCol);
        ExcelTable.template.subTable.setHeight(this, rows, this.range.sRow, this.range.eRow);
        ExcelTable.template.subTable.setPosition(this, units, this.range.sCol, this.range.sRow, cols.length);
        this.target.find('.dot').css({
            top: this.top + this.height - 2,
            left: this.left + this.width - 2
        });
        ExcelTable.template.subTable.outLine(this);
    };
    this.getActive = function () {
        var unit = $(parent.table.find('.excel-table-unit')[this.active.col + this.active.row * parent.columns]);
        if (!unit.find('input').length && !parent.table.find('.excel-table-unit:focus').length) {
            unit.trigger('focus');
        }
        parent.toolbar ? parent.toolbar.active = parent : '';
        return unit;
    };
};