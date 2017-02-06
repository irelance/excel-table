/**
 * Created by irelance on 2017/2/3.
 */
ExcelTable.table.History = function (parent) {
    this.canRecord = true;
    this.list = [];
    this.active = 0;
    this.undo = function () {
        if (this.active >= this.list.length - 1) {
            return false;
        }
        this.active += 1;
        this.canRecord = false;
        parent.action.import(this.list[this.active]).render();
        this.canRecord = true;
    };
    this.redo = function () {
        if (this.active <= 0) {
            return false;
        }
        this.active -= 1;
        this.canRecord = false;
        parent.action.import(this.list[this.active]).render();
        this.canRecord = true;
    };
    this.change = function () {
        this.list.splice(0, this.active);
        this.list.unshift(parent.action.export());
        this.active = 0;
        if (this.list.length > 50) {
            this.list.splice(50, this.list.length);
        }
    };
};