// 色の指定をします
var color = { 0: { "燃やすゴミ、生ゴミ": "#8b0000", "廃プラ": "#004385", "資源ゴミ(全品目)": "#7F9E0A", "紙、ペット": "#555555" }, 1: { "燃やすゴミ、生ゴミ": "#555555", "廃プラ": "#555555", "資源ゴミ(全品目)": "#555555", "紙、ペット": "#555555" }, 2: { "燃やすゴミ、生ゴミ": "#f0f0f0", "廃プラ": "#f0f0f0", "資源ゴミ(全品目)": "#f0f0f0", "紙、ペット": "#f0f0f0" } };

var custom = { "燃やすゴミ、生ゴミ": "", "廃プラ": "", "資源ゴミ(全品目)": "", "紙、ペット": "" };

function SelectedColor() {
    if (setcol == 0) {
        document.getElementById("select_color").innerHTML = '<option value="0" selected>現在使用中: デフォルトカラー</option><option value="1">モノクロ1</option><option value="2">モノクロ2</option>';
    } else if (setcol == 1) {
        document.getElementById("select_color").innerHTML = '<option value="0">デフォルトカラー</option><option value="1" selected>現在使用中: モノクロ1</option><option value="2">モノクロ2</option>';
    } else if (setcol == 2){
        document.getElementById("changecss").href = 'css/custom_b.css';
        document.getElementById("select_color").innerHTML = '<option value="0">デフォルトカラー</option><option value="1">モノクロ1</option><option value="2" selected>現在使用中: モノクロ2</option>';
    };
}



function setSelectColor(col) {
    localStorage.setItem('select_color',col);
}


var setcol = localStorage.getItem('select_color');
if (setcol == null){
    setcol = 0;
    setSelectColor(setcol);
};

var bgcolor = color[setcol];