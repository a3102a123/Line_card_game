// DO NOT CHANGE THIS
let PROFILE = null;

/*Class definition*/
class Room{
    constructor(id,category,cg_remain_num){
        this.pool = new Pool(category,cg_remain_num);
        this.id = id;
        this.category = category;
        this.cg_remain_num = cg_remain_num;
    }
    reset(){
        this.pool = new Pool(category,cg_remain_num);
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
        this.category = category;
        this.cg_remain_num = cg_remain_num;
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
    constructor(userid){
        this.identity = undefined;
        this.room_id = undefined;
        this.main_pool = undefined;
        this.userid = userid;
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
var current_id = 0;
var category = ["wolfman","Villager","Prophet"];
var cg_remain_num = [1,3,1];

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
        console.error('please set your liff Id in application!');
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
            console.log(err);
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
            document.getElementById('profileName').textContent = 'Hi, ' + result.displayName;
            loginInit();
        })
    document.getElementById('isInClient').textContent = liff.isInClient();
    document.getElementById('isLoggedIn').textContent = liff.isLoggedIn();
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
    player_arr[userid] = user;
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
    function WhoAmI(){
        userid = PROFILE.userId;
        user = player_arr[userid];
        return user;
    }
    /*update room id context*/
    document.getElementById('RoomId').addEventListener('keyup', function (event) {	
        document.getElementById('RoomId').textContent = event.target.value;	
    });
    /*user enter play room */
    document.getElementById('AttendBtn').addEventListener('click', function (event) {
        const id = document.getElementById('RoomId').textContent || ' ';
        if (id == ' '){
            alert("Please input room ID!");
            return;
        }
        var room = room_arr[id];
        if (room == undefined){
            alert("The room doesn't exist!");
            return;
        }
        if(room.pool.num <= 0){
            alert("The room is full!");
            return;
        }
        user = WhoAmI();
        if(user.room_id != undefined){
            alert("You already have a play room!");
            return;
        }
        user.set_player(id);
        user.main_pool = room.pool;
    });
    /*create new room */
    document.getElementById('NewRoom').addEventListener('click', function (event) {
        var user = WhoAmI();
        var new_room = new Room(current_id,category,cg_remain_num);
        if(user.room_id != undefined){
            alert("You already have a play room!");
            return;
        }
        room_arr[current_id] = new_room;
        room = room_arr[current_id];
        user.main_pool = room.pool;
        user.set_host(current_id);
        current_id += 1;
    });
    /*drawing player class */
    document.getElementById('drawCard').addEventListener('click', function (event) {
        var user = WhoAmI();
        var playerclass = user.main_pool.map[user.userid];
        while(playerclass == undefined && user.main_pool.num >= 0){
            i = getRandomInt(user.main_pool.category.length)
            if(user.main_pool.cg_remain_num[i] != 0){
                user.main_pool.cg_remain_num[i] -= 1;
                user.main_pool.num -= 1;
                playerclass = user.main_pool.category[i];
                user.main_pool.map[userid] = playerclass;
            }
        }
        cls_e = document.getElementById('UserClass');
        cls_e.innerHTML = playerclass;
    });

    document.getElementById('shareMeme').addEventListener('click', function (event) {
        if (!liff.isLoggedIn()) alert('please login in LINE');

        liff.shareTargetPicker([{
            'type': 'flex',
            'altText': topText + ' ' + bottomText,
            'contents': {
                "type": "bubble",
                "hero": {
                  "type": "image",
                  "url": imageUrl,
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
                      "text": topText,
                      "weight": "bold",
                      "size": "xl"
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
                        "label": "WEBSITE",
                        "uri": "https://lineworkshoptu.herokuapp.com/#"
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
    console.log("current",current_id);
}
window.setInterval(dis_bug_mes,2000);

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