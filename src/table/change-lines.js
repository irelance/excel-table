/**
 * Created by irelance on 2017/2/5.
 */
ExcelTable.table.ChangeLines = function (parent) {
    this.target = undefined;
    this.top = 0;
    this.left = 0;
    this.width = 0;
    this.height = 0;
    this.status = false;//move dot false
    this.sRange = new Rectangle();
    this.eRange = new Rectangle();
    this.direction = 'horizontal';//horizontal vertical
    this.type = 'increase';//increase decrease remove
    this.move = function (row, col) {
        this.eRange.sCol = col;
        if (this.eRange.sCol < 0) {
            this.eRange.sCol = 0;
        }
        this.eRange.eCol = this.eRange.sCol - this.sRange.sCol + this.sRange.eCol;
        if (this.eRange.eCol > parent.range.eCol) {
            this.eRange.eCol = parent.range.eCol;
            this.eRange.sCol = this.eRange.eCol + this.sRange.sCol - this.sRange.eCol;
        }
        this.eRange.sRow = row;
        if (this.eRange.sRow < 0) {
            this.eRange.sRow = 0;
        }
        this.eRange.eRow = this.eRange.sRow - this.sRange.sRow + this.sRange.eRow;
        if (this.eRange.eRow > parent.range.eRow) {
            this.eRange.eRow = parent.range.eRow;
            this.eRange.sRow = this.eRange.eRow + this.sRange.sRow - this.sRange.eRow;
        }
        return this;
    };
    this.render = function (row, col) {
        var rows = parent.table.find('.excel-table-row'),
            cols = parent.table.find('.excel-table-col'),
            units = parent.table.find('.excel-table-unit');
        ExcelTable.template.subTable.setWidth(this, cols, this.eRange.sCol, this.eRange.eCol);
        ExcelTable.template.subTable.setHeight(this, rows, this.eRange.sRow, this.eRange.eRow);
        ExcelTable.template.subTable.setPosition(this, units, this.eRange.sCol, this.eRange.sRow, cols.length);
        ExcelTable.template.subTable.outLine(this);
        return this;
    };
    this.afterAction = function () {
        var select = parent.selectLines;
        select.range = $.extend(true, select.range, this.eRange);
        this.sRange = $.extend(true, this.sRange, this.eRange);
        select.active.setRange(select.range.sRow,select.range.sCol);
        return parent;
    };
    this.dot = function (row, col) {
        var tCol = col - this.sRange.eCol;
        var tRow = row - this.sRange.eRow;
        if (tCol * tRow >= 0) {
            if (Math.abs(tCol) > Math.abs(tRow)) {
                this.direction = 'horizontal';
            } else {
                this.direction = 'vertical';
            }
        } else if (tCol > 0) {
            this.direction = 'horizontal';
        } else {
            this.direction = 'vertical';
        }
        this.eRange = $.extend(true, this.eRange, this.sRange);
        if (this.direction == 'horizontal') {
            if (this.sRange.eCol <= col) {
                this.type = 'increase';
                this.eRange.eCol = col;
            } else if (this.sRange.sCol > col) {
                this.type = 'decrease';
                this.eRange.sCol = col;
            } else {
                this.type = 'remove';
                this.eRange.eCol = col;
            }
        } else {
            if (this.sRange.eRow <= row) {
                this.type = 'increase';
                this.eRange.eRow = row;
            } else if (this.sRange.sRow > row) {
                this.type = 'decrease';
                this.eRange.sRow = row;
            } else {
                this.type = 'remove';
                this.eRange.eRow = row;
            }
        }
        return this;
    };
};