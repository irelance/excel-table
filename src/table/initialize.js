/**
 * Created by irelance on 2017/2/3.
 */

ExcelTable.table.initialize = function (options) {
    var table = this;
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
            ExcelTable.unit.setValue(table.result[table.selectLines.active.row][table.selectLines.active.col], $(this).val());
            table.render();
        })
        .on('keydown', '.value', function (e) {
            var self = $(this);
            switch (e.keyCode) {
                case 27:
                    self.val(table.result[table.selectLines.active.row][table.selectLines.active.col].value);
                    break;
            }
        })
        .on('change', '.key', function (e) {
            var self = $(this);
            var search = self.val().split(',');
            var int = /^[0-9]+$/;
            if (search.length == 2 && search[0].match(int) && search[1].match(int)) {
                var row = parseInt(search[0]),
                    col = parseInt(search[1]);
                table.selectLines.changeActive(row, col).changeRange(row, col).render();
            } else {
                self.val(self.data('value'));
            }
        });
    this.table
        .on('input', 'input', function (e) {
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
                    var triggerEvent = jQuery.Event('mousedown');
                    triggerEvent.button = 0;
                    unit.trigger(triggerEvent).trigger('mouseup');
                    break;
            }
            e.stopPropagation();
        })
        .on('change', 'input', function (e) {
            var unit = $(this).parent(),
                row = unit.data('row'),
                col = unit.data('col');
            ExcelTable.unit.setValue(table.result[row][col], $(this).val());
            table.render();
            e.stopPropagation();
        })
        .on('mousedown dblclick click', 'input', function (e) {
            e.stopPropagation();
        })
        .on('mousedown', '.excel-table-unit', function (e) {
            var unit = $(this);
            if (e.button == 0 || (e.button == 2 && !unit.hasClass('active'))) {
                if (!table.changeLines.status) {
                    if (table.selectLines.status) {
                        $(this).trigger('mouseup');
                    } else {
                        var row = unit.data('row'),
                            col = unit.data('col'),
                            rows = table.table.find('.excel-table-row'),
                            cols = table.table.find('.excel-table-col'),
                            units = table.table.find('.excel-table-unit');
                        rows.removeClass('active');
                        cols.removeClass('active');
                        units.removeClass('active').removeAttr('style');
                        $(rows[row]).addClass('active');
                        $(cols[col]).addClass('active');
                        table.selectLines.status = true;
                        table.selectLines.changeActive(row, col).changeRange(row, col).render();
                        units.find('input').trigger('blur');
                    }
                }
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
                                    table.action.increaseHorizontal();
                                    break;
                                case 'vertical':
                                    table.action.increaseVertical();
                                    break;
                            }
                            break;
                        case 'decrease':
                            switch (table.changeLines.direction) {
                                case 'horizontal':
                                    table.action.decreaseHorizontal();
                                    break;
                                case 'vertical':
                                    table.action.decreaseVertical();
                                    break;
                            }
                            break;
                        case 'remove':
                            switch (table.changeLines.direction) {
                                case 'horizontal':
                                    table.action.private.deleteText(
                                        table.changeLines.eRange.sRow,
                                        table.changeLines.eRange.eCol + 1,
                                        table.changeLines.sRange.eRow,
                                        table.changeLines.sRange.eCol
                                    );
                                    break;
                                case 'vertical':
                                    table.action.private.deleteText(
                                        table.changeLines.eRange.eRow + 1,
                                        table.changeLines.eRange.sCol,
                                        table.changeLines.sRange.eRow,
                                        table.changeLines.sRange.eCol
                                    );
                                    break;
                            }
                            break;
                    }
                    table.changeLines.afterAction().render();
                    table.changeLines.status = false;
                    break;
                case 'move':
                    table.action.move(row, col).changeLines.afterAction().render();
                    table.changeLines.status = false;
                    break;
            }
            table.changeLines.target.hide();
        })
        .on('dblclick', '.excel-table-unit', function (e) {
            var unit = $(this),
                row = unit.data('row'),
                col = unit.data('col');
            var input = $('<input value="' + table.result[row][col].value + '"/>');
            unit.html(input);
            ExcelTable.template.input(input);
            input.trigger('select');
        })
        .on('blur', 'input', function (e) {
            var unit = $(this).parent(),
                row = unit.data('row'),
                col = unit.data('col');
            unit.html(table.result[row][col].result.toString());
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
                        ++row >= table.rows ? row = table.rows - 1 : '';
                        break;
                    case 37:
                        --col < 0 ? col = 0 : '';
                        break;
                    case 39:
                        ++col >= table.columns ? col = table.columns - 1 : '';
                        break;
                }
                if (e.shiftKey) {
                    table.selectLines.changeRange(row, col).render();
                    $(units[col + row * table.columns]).trigger('focus');
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
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 79) {//import
                //todo open import view
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {//save
                //todo save
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 69) {//export
                //todo export
            } else {//default
                console.log(e.keyCode);
            }
            e.stopPropagation();
        })
        .on('scroll', function (e) {
            var self = $(this);
            self.find('.excel-table-col').css('top', this.scrollTop);
            self.find('.excel-table-row').css('left', this.scrollLeft);
            self.find('.excel-table-dig').css({
                'top': this.scrollTop,
                'left': this.scrollLeft
            });
            var unit = table.selectLines.getActive();
            var input = unit.find('input');
            if (input.length) {
                ExcelTable.template.input(input);
            }
        })
        .on('click', '.excel-table-col', function (e) {
            var col = $(this).data('col');
            table.selectLines.changeActive(0, col).changeRange(table.rows - 1, col).render();
        })
        .on('contextmenu', '.excel-table-col', function (e) {
            $(this).trigger('click');
            e.preventDefault();
            //e.stopPropagation();
        })
        .on('click', '.excel-table-row', function (e) {
            var row = $(this).data('row');
            table.selectLines.changeActive(row, 0).changeRange(row, table.columns - 1).render();
        })
        .on('contextmenu', '.excel-table-row', function (e) {
            $(this).trigger('click');
            e.preventDefault();
            //e.stopPropagation();
        })
        .on('click', '.excel-table-dig', function (e) {
            table.selectLines.changeActive(0, 0).changeRange(table.rows - 1, table.columns - 1).render();
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
            table.selectLines.getActive();
        })
};