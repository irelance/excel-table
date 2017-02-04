/**
 * Created by irelance on 2017/2/3.
 */

ExcelTable.Table.initialize = function (options) {
    var table = this;
    this.target = $(options.target);
    this.target.html(ExcelTable.template.table);
    this.table = this.target.children('.excel-table-content');
    this.selectLines.target = this.table.children('.excel-table-select-lines');
    this.changeLines.target = this.table.children('.excel-table-change-lines');
    this.action.import(options.data).render();
    this.history.change();

    this.table
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
            table.history.change();
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
            input.width(unit.width());
            unit.html(input);
            unit.children().trigger('select');
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
                        ++row > table.rows ? row = table.rows : '';
                        break;
                    case 37:
                        --col < 0 ? col = 0 : '';
                        break;
                    case 39:
                        ++col > table.columns ? col = table.columns : '';
                        break;
                }
                if (e.shiftKey) {
                    table.selectLines.changeRange(row, col).render();
                    $(units[col + row * (table.columns + 1)]).trigger('focus');
                } else {
                    //todo enable the action
                    table.selectLines.col = col;
                    table.selectLines.row = row;
                    $(units[col + row * (table.columns + 1)]).trigger('blur');
                    $(units[table.selectLines.col + table.selectLines.row * (table.columns + 1)]).trigger('mousedown').trigger('mouseup');
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
                table.history.change();
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 65) {//select all
                table.target.find('.excel-table-dig').trigger('click');
                e.preventDefault();
            } else if ((e.metaKey || e.ctrlKey) && e.keyCode == 88) {//cutting
                table.action.copy().action.delete().render();
                table.history.change();
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
            $(this).find('.excel-table-col').css('top', this.scrollTop);
            $(this).find('.excel-table-row').css('left', this.scrollLeft);
            $(this).find('.excel-table-dig').css({
                'top': this.scrollTop,
                'left': this.scrollLeft
            });
            table.selectLines.getActive();
        })
        .on('click', '.excel-table-col', function (e) {
            var col = $(this).data('col');
            table.selectLines.changeActive(0, col).changeRange(table.rows, col).render();
        })
        .on('contextmenu', '.excel-table-col', function (e) {
            $(this).trigger('click');
            e.preventDefault();
            //e.stopPropagation();
        })
        .on('click', '.excel-table-row', function (e) {
            var row = $(this).data('row');
            table.selectLines.changeActive(row, 0).changeRange(row, table.columns).render();
        })
        .on('contextmenu', '.excel-table-row', function (e) {
            $(this).trigger('click');
            e.preventDefault();
            //e.stopPropagation();
        })
        .on('click', '.excel-table-dig', function (e) {
            table.selectLines.changeActive(0, 0).changeRange(table.rows, table.columns).render();
        })
        .on('contextmenu', '.excel-table-unit', function (e) {
            $(this).trigger('click');
            e.preventDefault();
            //e.stopPropagation();
        })
        .on('paste', '.excel-table-unit', function (e) {
            var txt = e.originalEvent.clipboardData.getData('Text');
            table.action.paste(txt).render();
            table.history.change();
            e.preventDefault();
            e.stopPropagation();
        })
        .on('click', function () {
            table.selectLines.getActive();
        })
};