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

Rectangle = function (sRow, sCol, eRow, eCol) {
    this.type = 'rectangle';
    this.sRow = sRow ? sRow : 0;
    this.sCol = sCol ? sCol : 0;
    this.eRow = eRow ? eRow : sRow ? sRow : 0;
    this.eCol = eCol ? eCol : sCol ? sCol : 0;
    this.isIn = function (row, col) {
        return row >= this.sRow && row <= this.eRow && col >= this.sCol && col <= this.eCol;
    }
};