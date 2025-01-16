/*
 * 5374 setting
 *
*/

var SVGLabel = false; // SVGイメージを使用するときは、true。用意できない場合はfalse。

var MaxDescription = 9; // ごみの最大種類、９を超えない場合は変更の必要はありません。

var MaxMonth = 3;

var WeekShift = true; // 休止期間なら週をずらすときは、true。金沢の仕様は、true。

var SkipSuspend = true; // 休止期間を除去するときは、true。奈良の仕様は、true。



function csvToArray(filename, cb) {
    $.get(filename, function (csvdata) {
        //CSVのパース作業
        //CRの解析ミスがあった箇所を修正しました。
        //以前のコードだとCRが残ったままになります。
        // var csvdata = csvdata.replace("\r/gm", ""),
        csvdata = csvdata.replace(/\r/gm, "");
        var line = csvdata.split("\n"),
            ret = [];
        for (var i in line) {
            //空行はスルーする。
            if (line[i].length == 0) continue;

            var row = line[i].split(",");
            ret.push(row);
        }
        cb(ret);
    });
}
