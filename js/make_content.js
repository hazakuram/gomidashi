//アコーディオンを生成します。
//csv展開時のモデルはmodel.jsファイル内にあります。

$(function () {
    /*   windowHeight = $(window).height(); */
    var center_data = new Array();
    var descriptions = new Array();
    var areaModels = new Array();
    var remarks = new Array();
    /*   var descriptions = new Array(); */


    function getSelectedAreaName() {
        return localStorage.getItem("selected_area_name");
    }

    function setSelectedAreaName(name) {
        localStorage.setItem("selected_area_name", name);
    }

    function updateAreaList() {
        SelectedColor();
        csvToArray("data/area_days.csv", function (tmp) {
            var area_days_label = tmp.shift();
            var bf_label = "";
            for (var i in tmp) {

                var row = tmp[i];
                var area = new AreaModel();
                area.label = row[0];
                bf_label = area.label;
                area.centerName = row[1];

                areaModels.push(area);
                //２列目以降の処理
                for (var r = 2; r < 2 + MaxDescription; r++) {
                    if (area_days_label[r]) {
                        var trash = new TrashModel(area_days_label[r], row[r], remarks);
                        area.trash.push(trash);
                    }
                }
            }


            csvToArray("data/center.csv", function (tmp) {
                //ゴミ処理センターのデータを解析します。
                //表示上は現れませんが、
                //金沢などの各処理センターの休止期間分は一週間ずらすという法則性のため
                //例えば第一金曜日のときは、一周ずらしその月だけ第二金曜日にする
                tmp.shift();
                for (var i in tmp) {
                    var row = tmp[i];

                    var center = new CenterModel(row);
                    center_data.push(center);
                }
                //ゴミ処理センターを対応する各地域に割り当てます。
                for (var i in areaModels) {
                    var area = areaModels[i];
                    area.setCenter(center_data);
                };
                //エリアとゴミ処理センターを対応後に、表示のリストを生成する。
                //ListメニューのHTML作成
                var selected_name = getSelectedAreaName();
                var area_select_form = $("#select_area");
                var select_html = "";
                select_html += '<option value="-1">地域を選択してください</option>';
                for (var row_index in areaModels) {
                    var area_name = areaModels[row_index].label;
                    var selected = (selected_name == area_name) ? 'selected="selected"' : "";

                    select_html += '<option value="' + row_index + '" ' + selected + " >" + area_name + "</option>";
                }

                //デバッグ用
                if (typeof dump == "function") {
                    dump(areaModels);
                }
                //HTMLへの適応
                area_select_form.html(select_html);
                area_select_form.change();
            });
        });
    }


    function createMenuList(after_action) {
        // 備考データを読み込む
        csvToArray("data/remarks.csv", function (data) {
            data.shift();
            for (var i in data) {
                remarks.push(new RemarkModel(data[i]));
            }
        });
        csvToArray("data/description.csv", function (data) {
            data.shift();
            var desc2 = 0;
            for (var desc1 in data) {//カテゴリ分け
                if (desc1 == 0) { //最初のパターン
                    descriptions.push(new DescriptionModel(data[desc1]));
                    continue;
                }
                if (data[desc1][0] != data[desc1 - 1][0]) { //labelが変わったとき
                    descriptions.push(new DescriptionModel(data[desc1]));
                    desc2++;
                    continue;
                }

                descriptions[desc2].sublabel.push(data[desc1][1]); //上記以外の時
            }



            csvToArray("data/target.csv", function (data) {

                data.shift();
                for (var i in data) {
                    var row = new TargetRowModel(data[i]);
                    for (var j = 0; j < descriptions.length; j++) {
                        //一致してるものに追加する。
                        for (var k = 0; k < descriptions[j].sublabel.length; k++) {
                            if (descriptions[j].sublabel[k] == row.sublabel) {

                                descriptions[j].targets.push(row);
                                break;
                            }
                        }
                    };

                }
                after_action();
                $("#accordion2").show();
            });
        });

    }

    



    function updateData(row_index) {

        var areaModel = areaModels[row_index];
        var today = new Date();
        //直近の一番近い日付を計算します。
        areaModel.calcMostRect();
        //トラッシュの近い順にソートします。
        areaModel.sortTrash();
        var accordion_height = $(window).height() / descriptions.length;
        if (descriptions.length > 4) {
            accordion_height = accordion_height / 4.1;
            if (accordion_height > 140) { accordion_height = accordion_height / descriptions.length; };
            if (accordion_height < 130) { accordion_height = 130; };
        }
        var styleHTML = "";
        var accordionHTML = "";



        //アコーディオンの分類から対応の計算を行います。
        for (var i in areaModel.trash) {
            var trash = areaModel.trash[i];

            for (var d_no in descriptions) {
                if (descriptions[d_no].label != trash.label) {
                    continue;
                }
                var target_tag = "";
                for (var c_no in descriptions[d_no].sublabel) {
                    var description = descriptions[d_no];

                    
                    
                    var furigana = "";
                    var sublabel = "";
                    var targets = description.targets;

 
                    target_tag += '<div class="accordion-group" id="accordion' + i +'-'+ c_no + '">';
                    target_tag += '<div class="accordion-heading-u">';
                    target_tag += '<a class="accordion-toggle" style="height:' + accordion_height / 2 + 'px" data-toggle="collapse" data-parent="accordion' + d_no + '" href="#collapse' + i +'-'+ c_no + '">';
                    target_tag += '<p class="text-center-2">' + description.sublabel[c_no] + '</p>';
                    target_tag += '</a></div>';
                    target_tag += '<div id="collapse' + i +'-'+ c_no + '" class="accordion_body collapse">';
                    target_tag += '<div class="accordion-inner">';

                    for (var j in targets) {
                        if(targets[j].sublabel != description.sublabel[c_no]){
                            continue;
                        }
                        var target = targets[j];
                        if (furigana != target.furigana) {
                            if (furigana != "") {
                                target_tag += "</ul>";
                            }

                            furigana = target.furigana;

                            target_tag += '<h3 class="initials">' + furigana + "</h3>";
                            target_tag += "<ul>";
                        }

                        target_tag += '<li style="list-style:none;"><div class="trName">' + target.name + "</div>";
                        target_tag += '<div class="note">' + target.notice + "</div></li><br>";
                    }

                    target_tag += "</ul></div></div></div>";
                }
            


                var dateLabel = trash.getDateLabel();
                //あと何日かを計算する処理です。
                var leftDayText = "";
                if (trash.mostRecent === undefined) {
                    leftDayText == "不明";
                } else {
                    var leftDay = Math.ceil((trash.mostRecent.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                    if (leftDay == 0) {
                        leftDayText = "今日";
                    } else if (leftDay == 1) {
                        leftDayText = "明日";
                    } else if (leftDay == 2) {
                        leftDayText = "明後日"
                    } else {
                        leftDayText = leftDay + "日後";
                    }
                }

                styleHTML += '#accordion-group' + d_no + '{background-color:  ' + description.background + ';} ';

                accordionHTML +=
                    '<div class="accordion-group" id="accordion-group' + d_no + '">' +
                    '<div class="accordion-heading">' +
                    '<a class="accordion-toggle" style="height:' + accordion_height + 'px" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '">' +
                    '<div class="left-day">' + leftDayText + '</div>' +
                    '<div class="accordion-table" >';

                accordionHTML += '<p class="text-center">' + trash.label + "</p>";


                accordionHTML += "</div>" +
                    '<h5><p class="text-left date">' + dateLabel + "</p></h5>" +
                    "</a>" +
                    "</div>" +
                    '<div id="collapse' + i + '" class="accordion-body collapse">' + target_tag +
                    '<div class="targetDays"></div></div>' +
                    "</div>" +
                    "</div>";
            }
            
        }


        $("#accordion-style").html('<!-- ' + styleHTML + ' -->');

        var accordion_elm = $("#accordion");
        accordion_elm.html(accordionHTML);

        $('html,body').animate({ scrollTop: 0 }, 'fast');

        //アコーディオンのラベル部分をクリックしたら
        $(".accordion-body").on("shown.bs.collapse", function () {
            var body = $('body');
            var accordion_offset = $($(this).parent().get(0)).offset().top;
            body.animate({
                scrollTop: accordion_offset
            }, 50);
        });


        

        //アコーディオンの非表示部分をクリックしたら <=不使用
        /*$(".accordion-body").on("hidden.bs.collapse", function () {
            if ($(".in").length == 0) {
                $("html, body").scrollTop(0);
            }
        });*/
    }
    function onChangeSelect(row_index) {
        if (row_index == -1) {
            $("#accordion").html("");
            setSelectedAreaName("");
            return;
        }
        setSelectedAreaName(areaModels[row_index].label);

        if ($("#accordion").children().length === 0 && descriptions.length === 0) {

            createMenuList(function () {
                updateData(row_index);
            });
        } else {
            updateData(row_index);
        }
    }


    //リストが選択されたら
    $("#select_area").change(function (data) {
        var row_index = $(data.target).val();
        onChangeSelect(row_index);
    });


    $("#select_color").change(function () {
        setSelectColor(document.getElementById('select_color').value);
        location.reload();
    });

    $("#accordion-col").on("shown.bs.collapse",function(){
        window.scrollBy({top:40,left:0,behavior:"smooth"});
    });

    updateAreaList();
});