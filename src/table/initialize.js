/**
 * Created by irelance on 2017/2/3.
 */

ExcelTable.table.initialize = function (options) {
    var table = this,
        unitInput = new ExcelTable.table.Input(table),
        excelTableColStatus = false,
        excelTableRowStatus = false;
    this.target = $(options.target);
    this.target.html(ExcelTable.template.table);
    this.table = this.target.children('.excel-table-content');
    this.search = this.target.children('.excel-table-search');
    this.selectLines.target = this.table.children('.excel-table-select-lines');
    this.changeLines.target = this.table.children('.excel-table-change-lines');
    this.action.import(options.data).render();
    this.selectLines.changeActive(0, 0);
    this.resize();

    this.search
        .on('change', '.value', function (e) {
            ExcelTable.unit.setValue(table.selectLines.getActiveModel(), $(this).val());
            table.render();
        })
        .on('keydown', '.value', function (e) {
            var self = $(this);
            switch (e.keyCode) {
                case 27:
                    self.val(table.selectLines.getActiveModel().value);
                    break;
            }
        })
        .on('change', '.key', function (e) {
            var self = $(this);
            var search = self.val().match(/([A-Z]+)([0-9]+)/);
            if (search) {
                var row = parseInt(search[2]),
                    col = parseInt(ExcelTable.unit.convert26BSToDS(search[1]));
                table.selectLines.changeActive(row, col).changeRange(row, col).render();
            } else {
                self.val(self.data('value'));
            }
        });
    this.table
        .on('input', 'input', function (e) {
            e.stopPropagation();
            ExcelTable.template.input($(this));
        })
        .on('keydown', 'input', function (e) {
            var self = $(this);
            var unit = self.parent(),
                row = unit.data('row'),
                col = unit.data('col');
            switch (e.keyCode) {
                case 27:
                    self.val(table.result[row][col].value);
                    self.trigger('blur');
                    break;
                case 13:
                    unitInput.checkStatus();
                    if (!unitInput.canSelect) {
                        self.trigger('blur');
                    }
                    break;
            }
            e.stopPropagation();
        })
        .on('change', 'input', function (e) {
            e.stopPropagation();
            unitInput.checkStatus();
            if (!unitInput.canSelect) {
                var unit = $(this).parent(),
                    row = unit.data('row'),
                    col = unit.data('col');
                ExcelTable.unit.setValue(table.result[row][col], $(this).val());
                table.render();
                table.selectLines.changeActive(table.selectLines.active.sRow, table.selectLines.active.sCol);
            }
        })
        .on('mousedown dblclick click paste', 'input', function (e) {
            e.stopPropagation();
        })
        .on('mousedown', '.excel-table-unit', function (e) {
            var unit = $(this),
                row = unit.data('row'),
                col = unit.data('col'),
                isSelected = unit.hasClass('select');
            if (e.button == 0 && e.altKey && isSelected) {
                table.selectLines.changeActive(row, col).render();
                return false;
            }
            if (e.button == 0 || (e.button == 2 && !isSelected)) {
                if (!table.changeLines.status) {
                    if (table.selectLines.status) {
                        $(this).trigger('mouseup');
                    } else {
                        if (e.button == 0) {
                            table.selectLines.status = true;
                        }
                        table.selectLines.changeActive(row, col).changeRange(row, col).render();
                    }
                }
            }
            unitInput.checkStatus();
            if (unitInput.canSelect) {
                unitInput.getSelectRange();
            } else {
                unitInput.target.trigger('blur');
            }
            return false;
        })
        .on('mousedown', '.dot', function (e) {
            if (e.button == 0) {
                table.changeLines.status = 'dot';
                table.changeLines.render();
            }
            return false;
        })
        .on('mousedown', '.w,.s,.a,.d', function (e) {
            if (e.button == 0) {
                table.changeLines.status = 'move';
                table.changeLines.render();
            }
            return false;
        })
        .on('mouseover', '.excel-table-unit', function (e) {
            var unit = $(this),
                row = unit.data('row'),
                col = unit.data('col');
            if (table.selectLines.status) {
                table.selectLines.changeRange(row, col).render();
                unitInput.checkStatus();
                if (unitInput.canSelect) {
                    unitInput.getSelectRange();
                }
            }
            switch (table.changeLines.status) {
                case 'dot':
                    table.changeLines.dot(row, col).render();
                    break;
                case 'move':
                    table.changeLines.move(row, col).render();
                    break;
            }
        })
        .on('mouseup', '.excel-table-unit', function (e) {
            var unit = $(this),
                row = unit.data('row'),
                col = unit.data('col');
            if (table.selectLines.status) {
                table.selectLines.status = false;
            }
            switch (table.changeLines.status) {
                case 'dot':
                    switch (table.changeLines.type) {//increase decrease remove
                        case 'increase':
                            switch (table.changeLines.direction) {
                                case 'horizontal':
                                    table.action.autoFillRight(table.changeLines.eRange.eCol - table.changeLines.sRange.eCol);
                                    break;
                                case 'vertical':
                                    table.action.autoFillBottom(table.changeLines.eRange.eRow - table.changeLines.sRange.eRow);
                                    break;
                            }
                            break;
                        case 'decrease':
                            switch (table.changeLines.direction) {
                                case 'horizontal':
                                    table.action.autoFillLeft(table.changeLines.sRange.sCol - table.changeLines.eRange.sCol);
                                    break;
                                case 'vertical':
                                    table.action.autoFillTop(table.changeLines.sRange.sRow - table.changeLines.eRange.sRow);
                                    break;
                            }
                            break;
                        case 'remove':
                            switch (table.changeLines.direction) {
                                case 'horizontal':
                                    table.action.private.deleteText({
                                        sRow: table.changeLines.eRange.sRow,
                                        sCol: table.changeLines.eRange.eCol + 1,
                                        eRow: table.changeLines.sRange.eRow,
                                        eCol: table.changeLines.sRange.eCol
                                    });
                                    break;
                                case 'vertical':
                                    table.action.private.deleteText({
                                        sRow: table.changeLines.eRange.eRow + 1,
                                        sCol: table.changeLines.eRange.sCol,
                                        eRow: table.changeLines.sRange.eRow,
                                        eCol: table.changeLines.sRange.eCol
                                    });
                                    break;
                            }
                            break;
                    }
                    table.changeLines.mergeRange().render();
                    table.changeLines.status = false;
                    break;
                case 'move':
                    table.action.move(table.changeLines.eRange.sRow, table.changeLines.eRange.sCol).changeLines.mergeRange().render();
                    table.changeLines.status = false;
                    break;
            }
            table.changeLines.target.hide();
        })
        .on('dblclick', '.excel-table-unit', function (e) {
            var unit = $(this),
                row = unit.data('row'),
                col = unit.data('col');
            unitInput.setValue(table.result[row][col].value);
            unit.html(unitInput.target);
            ExcelTable.template.input(unitInput.target);
            unitInput.target.trigger('select');
        })
        .on('blur', 'input', function (e) {
            unitInput.checkStatus();
            if (!unitInput.canSelect) {
                var unit = $(this).parent(),
                    row = unit.data('row'),
                    col = unit.data('col');
                unit.html(table.result[row][col].result.toString());
            }
            e.stopPropagation();
        })
        .on('keydown', '.excel-table-unit', function (e) {
            var unit = $(this),
                row = unit.data('row'),
                col = unit.data('col'),
                units = table.table.find('.excel-table-unit');
            if (e.keyCode >= 37 && e.keyCode <= 40) {//selecting
                e.preventDefault();
                switch (e.keyCode) {
                    case 38:
                        --row < 0 ? row = 0 : '';
                        break;
                    case 40:
                        ++row > table.range.eRow ? row = table.range.eRow : '';
                        break;
                    case 37:
                        --col < 0 ? col = 0 : '';
                        break;
                    case 39:
                        ++col > table.range.eCol ? col = table.range.eCol : '';
                        break;
                }
                if (e.shiftKey) {
                    table.selectLines.changeRange(row, col).render();
                    $(units[col + row * table.range.columns]).trigger('focus');
                } else {
                    table.selectLines.changeActive(row, col).changeRange(row, col).render();
                }
            } else if (//typing
            (!(e.altKey || e.metaKey || e.ctrlKey)) &&
            (
                e.keyCode == 8 ||
                e.keyCode == 32 ||
                (e.keyCode >= 48 && e.keyCode <= 57) ||
                (e.keyCode >= 65 && e.keyCode <= 90) ||
                (e.keyCode >= 96 && e.keyCode <= 111) ||
                (e.keyCode >= 186 && e.keyCode <= 192) ||
                (e.keyCode >= 219 && e.keyCode <= 222)
            )
            ) {
                unit.trigger('dblclick');
            } else if (e.keyCode == 9) {//tab
                if (table.selectLines.range.isContains((new Rectangle()).setRange(row, col + 1))) {
                    col += 1;
                } else if (table.selectLines.range.isContains((new Rectangle()).setRange(row + 1, table.selectLines.range.sCol))) {
                    row += 1;
                    col = table.selectLines.range.sCol;
                } else {
                    row = table.selectLines.range.sRow;
                    col = table.selectLines.range.sCol;
                }
                table.selectLines.changeActive(row, col).render();
                e.preventDefault();
            } else if (e.keyCode == 13) {//enter
                e.preventDefault();
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 67) {//copying
                table.action.copy();
            } else if (e.keyCode == 46) {//deleting
                table.action.delete().render();
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 65) {//select all
                table.target.find('.excel-table-dig').trigger('click');
                e.preventDefault();
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 88) {//cutting
                table.action.copy().action.delete().render();
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 86) {//pasting
            } else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.keyCode == 90) {//undo
                table.history.undo();
            } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode == 90) {//redo
                table.history.redo();
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {//save
                //todo save
            } else {//default
                console.log(e.keyCode);
            }
            e.stopPropagation();
        })
        .on('input', '.excel-table-unit', function (e) {
            e.stopPropagation();
            $(this).children('div').remove();//prevent contenteditable
        })
        .on('scroll', function (e) {
            var self = $(this);
            ExcelTable.template.tableHeader(self);
            var unit = table.selectLines.getActiveView();
            var input = unit.find('input');
            if (input.length) {
                ExcelTable.template.input(input);
            }
        })
        .on('mousedown', '.excel-table-col', function (e) {
            if (e.button == 0) {
                if (!excelTableColStatus) {
                    var col = $(this).data('col');
                    table.selectLines.changeActive(0, col).changeRange(table.range.eRow, col).render();
                    excelTableColStatus = true;
                } else {
                    excelTableColStatus = false;
                }
            }
        })
        .on('mouseover', '.excel-table-col', function (e) {
            if (excelTableColStatus) {
                var col = $(this).data('col');
                table.selectLines.changeRange(table.range.eRow, col).render();
            }
        })
        .on('mouseup', '.excel-table-col', function (e) {
            excelTableColStatus = false;
        })
        .on('contextmenu', '.excel-table-col', function (e) {
            var self = $(this);
            if (!self.hasClass('active')) {
                var col = self.data('col');
                table.selectLines.changeActive(0, col).changeRange(table.range.eRow, col).render();
            }
            e.preventDefault();
        })
        .on('mousedown', '.excel-table-row', function (e) {
            if (e.button == 0) {
                if (!excelTableRowStatus) {
                    var row = $(this).data('row');
                    table.selectLines.changeActive(row, 0).changeRange(row, table.range.eCol).render();
                    excelTableRowStatus = true;
                } else {
                    excelTableRowStatus = false;
                }
            }
        })
        .on('mouseover', '.excel-table-row', function (e) {
            if (excelTableRowStatus) {
                var row = $(this).data('row');
                table.selectLines.changeRange(row, table.range.eCol).render();
            }
        })
        .on('mouseup', '.excel-table-row', function (e) {
            excelTableRowStatus = false;
        })
        .on('contextmenu', '.excel-table-row', function (e) {
            var self = $(this);
            if (!self.hasClass('active')) {
                var row = self.data('row');
                table.selectLines.changeActive(row, 0).changeRange(row, table.range.eCol).render();
            }
            e.preventDefault();
        })
        .on('click', '.excel-table-dig', function (e) {
            table.selectLines.changeActive(0, 0).changeRange(table.range.eRow, table.range.eCol).render();
        })
        .on('contextmenu', '.excel-table-unit', function (e) {
            $(this).trigger('click');
            e.preventDefault();
            //e.stopPropagation();
        })
        .on('paste', '.excel-table-unit', function (e) {
            var txt = e.originalEvent.clipboardData.getData('Text');
            table.action.paste(txt).render();
            e.preventDefault();
            e.stopPropagation();
        })
        .on('click', function () {
            table.selectLines.getActiveView();
        })
        .on('click', '.column-resize-bar', function (e) {
            var self = $(this),
                column = self.parent(),
                col = column.data('col'),
                width = column.width();
            width = prompt('set width:', width);
            column.width(width);
            table.table.find('.excel-table-unit').each(function () {
                var self = $(this),
                    uCol = self.data('col');
                if (uCol == col) {
                    self.width(width);
                }
            });
            table.columns[col] = width;
            table.selectLines.render();
        });
    if (typeof ContextMenu == 'function') {
        var CM = new ContextMenu();
        CM.attach('.excel-table-col,.excel-table-row,.excel-table-unit', [
            {
                icon: 'icon iconfont icon-cut',
                text: "cut",
                action: function () {
                    table.action.copy().action.delete().render();
                }
            }, {
                icon: 'icon iconfont icon-copy',
                text: "copy",
                action: function () {
                    table.action.copy();
                }
            }, {
                icon: 'icon iconfont icon-paste',
                text: "paste",
                action: function () {
                    // can not paste from system clipboard
                    table.action.paste(table.target.find('.clipboard').val()).render();
                }
            }, {divider: true}, {
                icon: 'icon iconfont icon-column-insert',
                text: "insert",
                display: function () {
                    return CM.context.hasClass('excel-table-col');
                },
                action: function () {
                    table.action.insertColumn(
                        table.selectLines.active.sCol,
                        table.selectLines.range.columns
                    ).render();
                }
            }, {
                icon: 'icon iconfont icon-column-delete',
                text: "delete",
                display: function () {
                    return CM.context.hasClass('excel-table-col');
                },
                action: function () {
                    table.action.deleteColumn(
                        table.selectLines.range.sCol,
                        table.selectLines.range.eCol
                    ).render();
                }
            }, {
                icon: 'icon iconfont icon-row-insert',
                text: "insert",
                display: function () {
                    return CM.context.hasClass('excel-table-row');
                },
                action: function () {
                    table.action.insertRow(
                        table.selectLines.active.sRow,
                        table.selectLines.range.rows
                    ).render();
                }
            }, {
                icon: 'icon iconfont icon-row-delete',
                text: "delete",
                display: function () {
                    return CM.context.hasClass('excel-table-row');
                },
                action: function () {
                    table.action.deleteRow(
                        table.selectLines.range.sRow,
                        table.selectLines.range.eRow
                    ).render();
                }
            }, {
                text: "clear",
                action: function () {
                    table.action.delete().render();
                }
            }
        ]);
    }
};