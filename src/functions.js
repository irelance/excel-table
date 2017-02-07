/**
 * Created by irelance on 2017/2/7.
 */

getDefaultStyle = function (elem, attribute) {
    return elem.currentStyle ? elem.currentStyle[attribute] : document.defaultView.getComputedStyle(elem, false)[attribute];
};
elementAbsoluteStation = function (elem, station) {
    if (!station) {
        station = {left: 0, top: 0};
    }
    if (elem.offsetParent != null && getDefaultStyle(elem.offsetParent, 'position') != 'relative') {
        station = elementAbsoluteStation(elem.offsetParent, station);
    }
    station.left += elem.offsetLeft;
    station.top += elem.offsetTop;
    return station;
};
downloadURI = function (uri, name) {
    var aLink = document.createElement('a');
    aLink.download = name;
    aLink.href = uri;
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
};

Rectangle = function () {
    this.type = 'rectangle';
    this.sRow = 0;
    this.sCol = 0;
    this.eRow = 0;
    this.eCol = 0;
    this.rows = 1;
    this.columns = 1;
    this.isContains = function (rectangle) {
        return rectangle.sRow >= this.sRow && rectangle.eRow <= this.eRow &&
            rectangle.sCol >= this.sCol && rectangle.eCol <= this.eCol;
    };
    this.setRange = function (sRow, sCol, eRow, eCol) {
        this.sRow = sRow ? sRow : 0;
        this.sCol = sCol ? sCol : 0;
        this.eRow = eRow ? eRow : sRow ? sRow : 0;
        this.eCol = eCol ? eCol : sCol ? sCol : 0;
        this.rows = this.eRow - this.sRow + 1;
        this.columns = this.eCol - this.sCol + 1;
        return this;
    };
    this.setRangeByDiagonal = function (point1, point2) {
        if (point1[0] > point2[0]) {
            [point1[0], point2[0]] = [point2[0], point1[0]];
        }
        if (point1[1] > point2[1]) {
            [point1[1], point2[1]] = [point2[1], point1[1]];
        }
        this.setRange(point1[0], point1[1], point2[0], point2[1]);
        return this;
    };
    this.setRangeByDistance = function (point, columns, rows) {
        this.setRangeByDiagonal(point, [point[0] + rows - 1, point[1] + columns - 1]);
        return this;
    };
    this.setRangeByRange = function (rowRange, columnRange) {
        this.setRangeByDiagonal([rowRange[0], columnRange[0]], [rowRange[1], columnRange[1]]);
        return this;
    };
};