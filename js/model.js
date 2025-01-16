//csvファイルを展開する際に使用するモデルです。
//csvToArrayはsetting.jsファイル内にあります。

var TrashModel = function (_lable, _cell, remarks) {
    this.remarks = remarks;
    this.dayLabel;
    this.mostRecent;
    this.dayList;
    this.mflag = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    var monthSplitFlag = _cell.search(/:/) >= 0
    if (monthSplitFlag) {
        var flag = _cell.split(":");
        this.dayCell = flag[0].split(" ");
        var mm = flag[1].split(" ");
    } else if (_cell.length == 2 && _cell.substr(0, 1) == "*") {
        this.dayCell = _cell.split(" ");
        var mm = new Array();
    } else {
        this.dayCell = _cell.split(" ");
        var mm = new Array("4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3");
    }
    for (var m in mm) {
        this.mflag[mm[m] - 1] = 1;
    }
    this.label = _lable;
    this.description;
    this.regularFlg = 1;      // 定期回収フラグ（デフォルトはオン:1）

    var result_text = "";
    var today = new Date();

    for (var j in this.dayCell) {
        if (this.dayCell[j].length == 1) {
            result_text += "毎週" + this.dayCell[j] + "曜日 ";
        } else if (this.dayCell[j].length == 2 && this.dayCell[j].substr(0, 1) != "*") {
            result_text += "第" + this.dayCell[j].charAt(1) + this.dayCell[j].charAt(0) + "曜日 ";
        } else if (this.dayCell[j].length == 2 && this.dayCell[j].substr(0, 1) == "*") {
        } else if (this.dayCell[j].length == 10 && this.dayCell[j].substr(0, 1) == "隔") {
            /**** MOD: PICK biweek, Ex:隔月20140401 ****/
            /****ADD****/
            result_text += "隔週" + this.dayCell[j].charAt(1) + "曜 ";
            this.regularFlg = 2;      // 隔週フラグ
            /****ADD****/
        } else {
            // 不定期回収の場合（YYYYMMDD指定）
            result_text = "不定期 ";
            this.regularFlg = 0;  // 定期回収フラグオフ
        }
    }
    if (monthSplitFlag) {
        var monthList = "";
        for (var m in this.mflag) {
            if (this.mflag[m]) {
                if (monthList.length > 0) {
                    monthList += ","
                }
                //mを整数化
                monthList += ((m - 0) + 1)
            }
        };
        monthList += "月 "
        result_text = monthList + result_text
    }
    this.dayLabel = result_text;


    this.getDateLabel = function () {
        if (this.mostRecent === undefined) {
            return this.getRemark() + "不明";
        }
        var result_text = this.mostRecent.getFullYear() + "/" + (1 + this.mostRecent.getMonth()) + "/" + this.mostRecent.getDate();
        return this.getRemark() + this.dayLabel + " " + result_text;
    }

    var day_enum = ["日", "月", "火", "水", "木", "金", "土"];

    function getDayIndex(str) {
        for (var i = 0; i < day_enum.length; i++) {
            if (day_enum[i] == str) {
                return i;
            }
        };
        return -1;
    }
    /**
     * このごみ収集日が特殊な条件を持っている場合備考を返します。収集日データに"*n" が入っている場合に利用されます
     */
    this.getRemark = function getRemark() {
        var ret = "";
        this.dayCell.forEach(function (day) {
            if (day.substr(0, 1) == "*") {
                remarks.forEach(function (remark) {
                    if (remark.id == day.substr(1, 1)) {
                        ret += remark.text + "<br/>";
                    }
                });
            };
        });
        return ret;
    }
    /**
    このゴミの年間のゴミの日を計算します。
    センターが休止期間がある場合は、その期間１週間ずらすという実装を行っております。
  */
    this.calcMostRect = function (areaObj) {
        var day_mix = this.dayCell;
        var result_text = "";
        var day_list = new Array();

        // 定期回収の場合
        if (this.regularFlg == 1) {

            var today = new Date();

            // 12月 +3月 を表現
            for (var i = 0; i < MaxMonth; i++) {

                var curMonth = today.getMonth() + i;
                var curYear = today.getFullYear() + Math.floor(curMonth / 12);
                var month = (curMonth % 12) + 1;

                // 収集が無い月はスキップ
                if (this.mflag[month - 1] == 0) {
                    continue;
                }
                for (var j in day_mix) {
                    //休止期間だったら、今後一週間ずらす。
                    var isShift = false;

                    //week=0が第1週目です。
                    for (var week = 0; week < 5; week++) {
                        //4月1日を起点として第n曜日などを計算する。
                        var date = new Date(curYear, month - 1, 1);
                        var d = new Date(date);
                        //コンストラクタでやろうとするとうまく行かなかった。。
                        //
                        //4月1日を基準にして曜日の差分で時間を戻し、最大５週までの増加させて毎週を表現
                        d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
                            ((7 + getDayIndex(day_mix[j].charAt(0)) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
                        );
                        //年末年始休暇のスキップ対応
                        if (SkipSuspend) {
                            if (areaObj.isBlankDay(d)) {
                                continue;
                            }
                        }
                        //年末年始のずらしの対応
                        //休止期間なら、今後の日程を１週間ずらす
                        if (areaObj.isBlankDay(d)) {
                            if (WeekShift) {
                                isShift = true;
                            } else {
                                continue;
                            }
                        }
                        ////
                        if (isShift) {
                            d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
                        }
                        //同じ月の時のみ処理したい
                        if (d.getMonth() != (month - 1) % 12) {
                            continue;
                        }
                        //特定の週のみ処理する
                        if (day_mix[j].length > 1) {
                            if ((week != day_mix[j].charAt(1) - 1) || ("*" == day_mix[j].charAt(0))) {
                                continue;
                            }
                        }

                        day_list.push(d);
                    }
                }
            }
            /****ASS****/
        } else if (this.regularFlg == 2) {
            // 隔週回収の場合は、basedateに指定初回日付をセット
            for (var j in day_mix) {
                var year = parseInt(day_mix[j].substr(2, 4));
                var month = parseInt(day_mix[j].substr(6, 2)) - 1;
                var day = parseInt(day_mix[j].substr(8, 2));
                var basedate = new Date(year, month, day);

                //week=0が第1週目です。
                for (var week = 0; week < 27; week++) {
                    // basedate を起点に、最も近い偶数週目を計算する。
                    var d = new Date(date);
                    // basedate を基準に、最大53週まで増加させて隔週を表現
                    d.setTime(basedate.getTime() + week * 14 * 24 * 60 * 60 * 1000);
                    //年末年始休暇のスキップ対応
                    if (SkipSuspend) {
                        if (areaObj.isBlankDay(d)) {
                            continue;
                        }
                    }
                    day_list.push(d);
                }
            }
            /***ADD*****/
        } else {
            // 不定期回収の場合は、そのまま指定された日付をセットする
            for (var j in day_mix) {
                var year = parseInt(day_mix[j].substr(0, 4));
                var month = parseInt(day_mix[j].substr(4, 2)) - 1;
                var day = parseInt(day_mix[j].substr(6, 2));
                var d = new Date(year, month, day);
                if (d.toString() !== "Invalid Date") {
                    day_list.push(d);
                }
            }
        }
        //曜日によっては日付順ではないので最終的にソートする。
        //ソートしなくてもなんとなりそうな気もしますが、とりあえずソート
        day_list.sort(function (a, b) {
            var at = a.getTime();
            var bt = b.getTime();
            if (at < bt) return -1;
            if (at > bt) return 1;
            return 0;
        })
        //直近の日付を更新
        var now = new Date();
        for (var i in day_list) {
            if (this.mostRecent == null && now.getTime() < day_list[i].getTime() + 24 * 60 * 60 * 1000) {
                this.mostRecent = day_list[i];
                break;
            }
        };

        this.dayList = day_list;
    }
    /**
     計算したゴミの日一覧をリスト形式として取得します。
    */
    this.getDayList = function () {
        var day_text = "<ul>";
        for (var i in this.dayList) {
            var d = this.dayList[i];
            day_text += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";
        };
        day_text += "</ul>";
        return day_text;
    }
}

var AreaModel = function () {
    this.label;
    this.centerName;
    this.center;
    this.trash = new Array();
    /**
    各ゴミのカテゴリに対して、最も直近の日付を計算します。
    */
    this.calcMostRect = function () {
        for (var i = 0; i < this.trash.length; i++) {
            this.trash[i].calcMostRect(this);
        }
    }
    /**
      休止期間（主に年末年始）かどうかを判定します。
    */
    this.isBlankDay = function (currentDate) {
        if (!this.center) {
            return false;
        }
        var period = [this.center.startDate, this.center.endDate];

        if (period[0].getTime() <= currentDate.getTime() &&
            currentDate.getTime() <= period[1].getTime()) {
            return true;
        }
        return false;
    }

    /**
    ゴミ処理センターを登録します。
    名前が一致するかどうかで判定を行っております。
  */
    this.setCenter = function (center_data) {
        for (var i in center_data) {
            if (this.centerName == center_data[i].name) {
                this.center = center_data[i];
            }
        }
    }

    /**
    ゴミのカテゴリのソートを行います。
    */
    this.sortTrash = function () {
        this.trash.sort(function (a, b) {
            if (a.mostRecent === undefined) return 1;
            if (b.mostRecent === undefined) return -1;
            var amr = a.mostRecent;
            var bmr = b.mostRecent;
            if (!amr && !bmr) {
                return 0;
            } else if (amr && !bmr) {
                return -1;
            } else if (!amr && bmr) {
                return 1;
            }
            var at = amr.getTime();
            var bt = bmr.getTime();
            if (at < bt) return -1;
            if (at > bt) return 1;
            return 0;
        });
    }
}



/**
* ゴミのカテゴリを管理するクラスです。
* description.csvのモデルです。
* デフォルトの5374.jpとの差分点
* 1.色の変更機能
*/

var DescriptionModel = function (data) {
    this.targets = new Array();
    this.label = data[0];
    this.sublabel = new Array(data[1]);
    this.description = data[2];//not used
    this.styles = data[3];
    this.background = bgcolor[data[0]];
}
/**
 * ゴミのカテゴリの中のゴミの具体的なリストを管理するクラスです。
 * target.csvのモデルです。
 */
var TargetRowModel = function (data) {
    this.sublabel = data[0];
    this.name = data[1];
    this.notice = data[2];
    this.furigana = data[3];
}

/**
 * ゴミ収集日に関する備考を管理するクラスです。
 * remarks.csvのモデルです。
 */
var RemarkModel = function (data) {
    this.id = data[0];
    this.text = data[1];
}

var CenterModel = function (row) {
    function getDay(center, index) {
        var tmp = center[index].split("/");
        return new Date(tmp[0], tmp[1] - 1, tmp[2]);
    }

    this.name = row[0];
    this.startDate = getDay(row, 1);
    this.endDate = getDay(row, 2);
}