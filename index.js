/**
 * Created by Administrator on 2017/1/25.
 */

(function () {
    var table = new ExcelTable.Table();
    table.init({
        target: '#table',
        data: {
            rows: 5,
            columns: 4,
            units: [
                {row: 0, column: 0, value: 6},
                {row: 0, column: 1, value: 4},
                {row: 0, column: 2, value: '=SUM(0:0)'},
                {row: 1, column: 1, value: 'fdd'},
                {row: 1, column: 2, value: 5},
                //{row: 3, column: 2, value: '=SUM($([0,0],[0,1]))'},
                //{row: 3, column: 2, value: '='},
                {
                    row: 2,
                    column: 2,
                    value: '=function(){return 10;}'
                },
                {row: 3, column: 0, value: '=SUM(4:4)'},
                {row: 4, column: 0, value: 6},
                {row: 4, column: 1, value: 4},
            ]
        }
    });
    var toolbar = new ExcelTable.Toolbar();
    toolbar.init({
        target: '#table .excel-table-toolbar',
        items: ['import', 'export', '|',
            'undo', 'redo', '|',
            'cut', 'copy', 'paste', '|',
            'append-column', 'append-row', '|',
            'sort-asc', 'sort-desc']
    });
    toolbar.addTable(table);
    t = table;
    b = toolbar;
})();