// DO NOT CHANGE THIS
let PROFILE = null;

/*Class definition*/
class Room{
    constructor(id,category,cg_remain_num,game_name){
        this.pool = new Pool(category,cg_remain_num);
        this.id = id;
        this.category = Array.from(category);
        this.cg_remain_num = Array.from(cg_remain_num);
        this.game_name = game_name;
    }
    reset(){
        this.pool = new Pool(this.category,this.cg_remain_num);
    }
    cg_insert(new_cg,new_re_num){
        this.category.push(new_cg);
        this.cg_remain_num.push(new_re_num);
    }
    cg_replace(category,cg_remain_num){
        this.category = category;
        this.cg_remain_num = cg_remain_num;
        this.reset();
    }
}

class Pool{
    constructor(category, cg_remain_num){
        this.category = Array.from(category);
        this.cg_remain_num = Array.from(cg_remain_num);
        this.num = Pool.total_pool_num(cg_remain_num);
        this.map = new Map();
    }
    static total_pool_num(cg_remain_num){
        var num = 0;
        for(var i = 0 ; i < cg_remain_num.length ; i++){
            num += cg_remain_num[i];
        }
        return num;
    }
}

class Player{
    constructor(username){
        this.identity = undefined;
        this.room_id = undefined;
        this.main_pool = undefined;
        this.username = username;
    }
    is_room_exists(){
        if(this.room_id == undefined)
            return false;
        else
            return true;
    }
    set_host(room_id){
        this.identity = "host";
        this.room_id = room_id;
    }
    set_player(room_id){
        this.identity = "player";
        this.room_id = room_id;
    }
}
/*global variable*/
var room_arr = new Map();
var player_arr = new Map();
var player_name_arr = [];
var current_id = 0;
var category = ["Wolfman","Villager","Prophet"];
var cg_remain_num = [1,3,1];
var category2 = ["Arthur","Percival","Assassin","Loyal Servant"];
var cg_remain_num2 = [1,1,2,2];
var category3 = [];
var cg_remain_num3 = [];

window.onload = function () {
    const useNodeJS = true;   // if you are not using a node server, set this value to false
    const defaultLiffId = "";   // change the default LIFF value if you are not using a node server

    // DO NOT CHANGE THIS
    let myLiffId = "";

    // if node is used, fetch the environment variable and pass it to the LIFF method
    // otherwise, pass defaultLiffId
    if (useNodeJS) {
        fetch('/send-id')
            .then(function (reqResponse) {
                return reqResponse.json();
            })
            .then(function (jsonResponse) {
                myLiffId = jsonResponse.id;
                initializeLiffOrDie(myLiffId);
            })
            .catch(function (error) {
                console.error(error)
            });
    } else {
        myLiffId = defaultLiffId;
        initializeLiffOrDie(myLiffId);
    }
};

/**
* Check if myLiffId is null. If null do not initiate liff.
* @param {string} myLiffId The LIFF ID of the selected element
*/
function initializeLiffOrDie(myLiffId) {
    if (myLiffId) {
        initializeLiff(myLiffId);
    } else {
        console.error('please set your liff Id in application!')
    }
}

/**
* Initialize LIFF
* @param {string} myLiffId The LIFF ID of the selected element
*/
function initializeLiff(myLiffId) {
    liff
        .init({
            liffId: myLiffId
        })
        .then(() => {
            // start to use LIFF's api
            initializeApp();
        })
        .catch((err) => {
            console.log(err)
        });
}

/**
 * Initialize the app by calling functions handling individual app components
 */
function initializeApp() {
    displayLiffData();
    registerButtonHandlers();
    // check if the user is logged in/out, and disable inappropriate button
    if (liff.isLoggedIn()) {
        displayIsInClientInfo();
        document.getElementById('liffLoginButton').disabled = true;
    } else {
        document.getElementById('liffLogoutButton').disabled = true;
        document.getElementById('shareMeTargetPicker').disabled = true;
    }
}

/**
* Display data generated by invoking LIFF methods
*/
function displayLiffData() {
    liff.getProfile()
        .then((result) => {
            PROFILE = result;
            loginInit();
            // document.getElementById('profileName').textContent = 'Hi, ' + result.displayName;
        })
    // document.getElementById('isInClient').textContent = liff.isInClient();
    // document.getElementById('isLoggedIn').textContent = liff.isLoggedIn();
}

/**
* Toggle the login/logout buttons based on the isInClient status, and display a message accordingly
*/
function displayIsInClientInfo() {
    if (liff.isInClient()) {
        document.getElementById('liffLoginButton').classList.toggle('hidden');
        document.getElementById('liffLogoutButton').classList.toggle('hidden');
        document.getElementById('isInClient').textContent = 'You are opening the app in the in-app browser of LINE.';
    } else {
        document.getElementById('shareMeTargetPicker').classList.toggle('hidden');
    }
}

function loginInit(){
    userid = PROFILE.userId;
    user = new Player(userid);
    username = "Host";
    player_arr[username] = user;
    player_name_arr.push(username);
};

/**
* Register event handlers for the buttons displayed in the app
*/
function registerButtonHandlers() {
    document.getElementById('shareMeTargetPicker').addEventListener('click', function () {
        if (liff.isApiAvailable('shareTargetPicker')) {
            liff.shareTargetPicker([{
                'type': 'text',
                'text': 'Hello, I am ' + PROFILE.displayName
            }, {
                'type': 'image',
                'originalContentUrl': PROFILE.pictureUrl,
                'previewImageUrl': PROFILE.pictureUrl
            }]).then(function (res) {
                if (res) alert('Message sent!');
            }).catch(function (res) {
                console.error(res);
            });
        }
    });

    // login call, only when external browser is used
    document.getElementById('liffLoginButton').addEventListener('click', function () {
        if (!liff.isLoggedIn()) {
            liff.login();           
        }
    });

    // logout call only when external browse
    document.getElementById('liffLogoutButton').addEventListener('click', function () {
        if (liff.isLoggedIn()) {
            liff.logout();
            window.location.reload();
        }
    });
    /*return random int */
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    function WhoAmI(username){
        user = player_arr[username];
        return user;
    }
    function get_cur_room_id(){
        username = player_name_arr[0];
        user = player_arr[username];
        return user.room_id;
    }
    /*update room id context*/
    document.getElementById('RoomId').addEventListener('keyup', function (event) {	
        document.getElementById('RoomId').textContent = event.target.value;	
    });
    /*update user name context*/
    document.getElementById('UserId').addEventListener('keyup', function (event) {	
        document.getElementById('UserId').textContent = event.target.value;	
    });
    /*update CustomCategory name context*/
    document.getElementById('CustomCategory').addEventListener('keyup', function (event) {	
        document.getElementById('CustomCategory').textContent = event.target.value;	
    });

    /*Show player name */
    function showName(player_arr){
        temp = "Players In Room : ";
        output = temp.concat(player_arr);
        cls_e = document.getElementById('PlayerName');
        cls_e.innerHTML = output;
        return;
    };

    /*add new player */
    document.getElementById('AddBtn').addEventListener('click', function (event) {	
        const username = document.getElementById('UserId').textContent || ' ';
        if(username == ' '){
            alert("Please input username!");
            return;
        }
        var user = new Player(username);
        room = room_arr[current_id-1];
        if(room != undefined){
            user.main_pool = room.pool;
        }
        user.set_player(current_id-1);
        player_arr[username] = user;
        player_name_arr.push(username);

        showName(player_name_arr);
    });

    /*drawing room number */
    function drawRoomnum(username){
        var user = WhoAmI(username);
        var roomNum = String(user.room_id);
        var room = room_arr[user.room_id];
        temp = "Room ID : ";
        roomNum = temp.concat(roomNum);
        roomNum = roomNum.concat(" ",room.game_name);
        cls_e = document.getElementById('UserRoomNum');
        cls_e.innerHTML = roomNum;
        return;
    };
    /*user enter play room */
    function attend_room(id){
        for(var i = 0; i < player_name_arr.length ; i++){
            var user = WhoAmI(player_name_arr[i]);
            room = room_arr[id];
            console.log(room);
            if (room == undefined){
                alert("Please Add the Room !");
                return;
            }
            if(room.pool.num <= 0 && user.identity != "host"){
                alert("The room is full!");
                return;
            }
            if(i == 0)
                user.set_host(id);
            else
                user.set_player(id);
            user.main_pool = room.pool;
        }
    }
    /*drawing a player class */
    function drawclass(user){
        var playerclass = user.main_pool.map[user.username];
        while(playerclass == undefined && user.main_pool.num > 0){
            i = getRandomInt(user.main_pool.category.length)
            if(user.main_pool.cg_remain_num[i] != 0){
                user.main_pool.cg_remain_num[i] -= 1;
                user.main_pool.num -= 1;
                playerclass = user.main_pool.category[i];
                user.main_pool.map[user.username] = playerclass;
            }
        }
        return playerclass;
    }
    /*drawing all player class and print*/
    function drawAllclass(){
        cls_e = document.getElementById('UserClass');
        str = "";
        for(var i = 0; i < player_name_arr.length ; i++){
            var user = WhoAmI(player_name_arr[i]);
            var playerclass = drawclass(user);
            var temp = player_name_arr[i].concat(" : ");
            temp = temp.concat(playerclass);
            temp = temp.concat("</br>");
            str = str.concat(temp);
        }
        cls_e.innerHTML = str;
    }
    /*print all undefined */
    function printAllud(){
        cls_e = document.getElementById('UserClass');
        str = "";
        for(var i = 0; i < player_name_arr.length ; i++){
            var user = WhoAmI(player_name_arr[i]);
            var playerclass = "Undefined";
            var temp = player_name_arr[i].concat(" : ");
            temp = temp.concat(playerclass);
            temp = temp.concat("</br>");
            str = str.concat(temp);
        }
        cls_e.innerHTML = str;
    }
    /*print customize category */
    function printCustomCategory(){
        cls_e = document.getElementById('Category');
        str = "";
        for(var i = 0; i < category3.length ; i++){
            var temp = category3[i].concat(" : ");
            temp = temp.concat(String(cg_remain_num3[i]));
            temp = temp.concat("</br>");
            str = str.concat(temp);
        }
        cls_e.innerHTML = str;
    }
    /*user enter play room event trigger*/
    document.getElementById('AttendBtn').addEventListener('click', function (event) {
        const id = document.getElementById('RoomId').textContent || ' ';
        if (id == ' '){
            alert("Please input room ID!");
            return;
        }
        attend_room(id);
        drawAllclass();
        // print roomNum
        drawRoomnum(player_name_arr[0]);
    });
    /*create new room */
    document.getElementById('NewRoom').addEventListener('click', function (event) {
        var user = WhoAmI(player_name_arr[0]);
        var new_room = new Room(current_id,category,cg_remain_num,"Werewolf");
        room_arr[current_id] = new_room;
        room = room_arr[current_id];
        user.main_pool = room.pool;
        user.set_host(current_id);
        current_id += 1;
        drawRoomnum(player_name_arr[0]);
    });
    document.getElementById('NewRoom2').addEventListener('click', function (event) {
        var user = WhoAmI(player_name_arr[0]);
        var new_room = new Room(current_id,category2,cg_remain_num2,"Avalon");
        room_arr[current_id] = new_room;
        room = room_arr[current_id];
        user.main_pool = room.pool;
        user.set_host(current_id);
        current_id += 1;
        drawRoomnum(player_name_arr[0]);
    });
    document.getElementById('NewRoom3').addEventListener('click', function (event) {
        if(category3.length == 0){
            alert("You don't add any element of game!")
            return;
        }
        var user = WhoAmI(player_name_arr[0]);
        var new_room = new Room(current_id,category3,cg_remain_num3,"Custom");
        room_arr[current_id] = new_room;
        room = room_arr[current_id];
        user.main_pool = room.pool;
        user.set_host(current_id);
        current_id += 1;
        drawRoomnum(player_name_arr[0]);
    });
    /*reset game */
    document.getElementById('ResetBtn').addEventListener('click', function (event){
        var room_id = get_cur_room_id();
        var room = room_arr[room_id];
        room.reset(); 
        printAllud();
    });
    /*drawing player class event trigger */
    document.getElementById('drawCard').addEventListener('click', function (event) {
        attend_room(get_cur_room_id());
        drawAllclass();
    });
    /*customize game */
    document.getElementById('AddCategoryBtn').addEventListener('click', function (event) {
        var elem_cg = document.getElementById('CustomCategory');
        var elem_cg_n = document.getElementById('customCategoryNum');
        if(elem_cg_n.value == "" || elem_cg.textContent == ""){
            alert("Data Missing!");
            return;
        }
        category3.push(elem_cg.textContent);
        cg_remain_num3.push(parseInt(elem_cg_n.value));
        printCustomCategory();
    });
    /*clear customize game */
    document.getElementById('ClearCategoryBtn').addEventListener('click', function (event) {
        category3.length = 0;
        cg_remain_num3.length = 0;
        printCustomCategory();
    });

    /* Get */
    document.getElementById('shareMeme').addEventListener('click', function (event) {
        if (!liff.isLoggedIn()) alert('please login in LINE');

        // const imageUrl = document.getElementById('memeImage').src;
        // const topText = document.getElementById('memeTopCaption').textContent || ' ';
        // const bottomText = document.getElementById('memeBottomCaption').textContent || ' ';
        const url = window.location.href;
        liff.shareTargetPicker([{
            'type': 'flex',
            'altText': " ",
            'contents': {
              "type": "bubble",
              "hero": {
                "type": "image",
                "url": "https://cdn1-manfashion.techbang.com/system/excerpt_images/8442/mobile_inpage/04934a6594a13f437a01f8cb88f37d75.jpg?1562911218",
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover",
                "action": {
                  "type": "uri",
                  "uri": "http://linecorp.com/"
                }
              },
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "狼人殺",
                    "weight": "bold",
                    "size": "xl"
                  },
                  {
                    "type": "text",
                    "text": "刺激度",
                    "margin": "md"
                  },
                  {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "icon",
                        "size": "sm",
                        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                      },
                      {
                        "type": "icon",
                        "size": "sm",
                        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                      },
                      {
                        "type": "icon",
                        "size": "sm",
                        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                      },
                      {
                        "type": "icon",
                        "size": "sm",
                        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                      },
                      {
                        "type": "icon",
                        "size": "sm",
                        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png"
                      },
                      {
                        "type": "text",
                        "text": "4.0",
                        "size": "sm",
                        "color": "#999999",
                        "margin": "md",
                        "flex": 0
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "lg",
                    "spacing": "sm",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "baseline",
                        "spacing": "sm",
                        "contents": [
                          {
                            "type": "text",
                            "text": "預估遊戲時間",
                            "color": "#aaaaaa",
                            "size": "sm",
                            "flex": 1
                          },
                          {
                            "type": "text",
                            "text": "45分鐘",
                            "wrap": true,
                            "color": "#666666",
                            "size": "sm",
                            "flex": 1
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "baseline",
                        "spacing": "sm",
                        "contents": [
                          {
                            "type": "text",
                            "text": "你這場的角色",
                            "color": "#aaaaaa",
                            "size": "sm",
                            "flex": 1
                          },
                          {
                            "type": "text",
                            "text": "狼人",
                            "wrap": true,
                            "color": "#666666",
                            "size": "sm",
                            "flex": 1
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                      "type": "uri",
                      "label": "GAME END",
                      "uri": "https://linecorp.com"
                    }
                  },
                  {
                    "type": "spacer",
                    "size": "sm"
                  }
                ],
                "flex": 0
              }
            }
          }]).then(function (res) {
            if (res) alert('Message sent!');
        }).catch(function (res) {
            console.error(res);
        });
    });
}
function dis_bug_mes(){
    console.log("player array\n",player_arr);
    console.log("room array\n",room_arr);
    console.log("player name array\n",player_name_arr)
    console.log("current",current_id);
}
window.setInterval(dis_bug_mes,5000);

/**
* Toggle specified element
* @param {string} elementId The ID of the selected element
*/
function toggleElement(elementId) {
    const elem = document.getElementById(elementId);
    if (elem.offsetWidth > 0 && elem.offsetHeight > 0) {
        elem.style.display = 'none';
    } else {
        elem.style.display = 'block';
    }
}