//検索機能を実装しています。
//頭文字と物品名に同一単語があるものだけを出力する簡単なものです。

var entity = new Array();

csvToArray("data/target.csv", function (tmp) {
    tmp.shift();
    for (var i in tmp) {
        entity.push(new TargetRowModel(tmp[i]));
    }
    $("#accordion2").show();
});


function searchTrash() {
    let word = document.getElementById('sea_txt').value;
    let change = document.getElementById('sea_result').innerHTML;
    document.getElementById('sea_result').innerHTML = "";
    if (word == '') {
        document.getElementById('sea_result').innerHTML = '<p style="color:red">検索したい文字を入力してください</p>';
        return;
    }

    for (var i in entity) {
        if (entity[i].furigana == word) {
            document.getElementById('sea_result').innerHTML += '<tr><th>' + entity[i].name + '</th><td>' + entity[i].sublabel + '</td></tr>'
            continue;
        }
        if (entity[i].name.indexOf(word) > -1) {
            console.log(entity[i]);
            document.getElementById('sea_result').innerHTML += '<tr><th>' + entity[i].name + '</th><td>' + entity[i].sublabel + '</td></tr>'
        }
    }
    if (document.getElementById('sea_result').innerHTML == "") {
        document.getElementById('sea_result').innerHTML = "該当なし<br>調べる単語を変更してください";
    }
}