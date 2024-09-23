var config = `{
    "tab": 1,
    "matchInfo": {
        "name": null,
        "matchType": 0,
        "matchNum": null,
        "isReplay": false,
        "alliance": "R",
        "startingPosition": 1,
        "teamNum": null
    },
    "autoInfo": {
        "speakerCounter": 0,
        "speakerMissCounter": 0,
        "ampCounter": 0,
        "ampMissCounter": 0,
        "centerlineNotesCounter": 0,
        "toggleLeft": 0
    },
    "teleopInfo": {
        "speakerCounter": 0,
        "speakerMissCounter": 0,
        "ampCounter": 0,
        "ampMissCounter": 0,
        "notesPassedCounter": 0,
        "foulCounter": 0,
        "techCounter": 0
    },
    "endInfo": {
        "trapAttempted": 0,
        "trapResult": 0,
        "climbAttempted": 0,
        "climbResult": 0,
        "harmony": 0,
        "park": 0,
        "breakdown": 0,
        "comments": "",
        "defenseFaced": 0,
        "defensePlayed": 0
    }
}`;

var matchTypes = ["PRAC","QUAL","PLAY"];

var store = () => Alpine.store("current", JSON.parse(config));

var range = (a, b) => [...Array(b).keys()].slice(a);

var prime = n => range(2, n).reduce((b, v) => n % v != 0 && b,true);

var primes = range(2, 98).filter(prime);

var hash = string => [...[...string].entries()].reduce((s, [i, v]) => s + v.charCodeAt() * primes[i % primes.length],0);

var storage = callback => range(0,localStorage.length).forEach(n => callback(localStorage.key(n)));

document.addEventListener("alpine:init",store);

var endScreen = () => ({
    image: null,
    matchLabel: "XXXX_XXXX",
    url: null,
    filename: null,
    continueScouting: false,
    display(){
        var current = Alpine.store("current");
        if(current.matchInfo.name == null) {
            alert("Please enter name!");
            return;
        }
        if(current.matchInfo.matchNum == null) {
            alert("Please enter match number!");
            return;
        }
        if(current.matchInfo.teamNum == null) {
            alert("Please enter team number!");
            return;
        }
        this.matchLabel = [
            matchTypes[current.matchInfo.matchType],
            current.matchInfo.matchNum
        ].join("_");
        var name = [
            current.matchInfo.alliance,
            current.matchInfo.startingPosition,
            matchTypes[current.matchInfo.matchType],
            current.matchInfo.isReplay ? "replay" : "",
            "ScoutingData",
            current.matchInfo.matchNum
        ].join("");
        var data = [
            current.matchInfo.name,
            current.matchInfo.matchType,
            current.matchInfo.matchNum,
           +current.matchInfo.isReplay,
            current.matchInfo.alliance,
            current.matchInfo.teamNum,
            current.matchInfo.startingPosition,

            current.autoInfo.speakerCounter,
            current.autoInfo.speakerMissCounter,
            current.autoInfo.ampCounter,
            current.autoInfo.ampMissCounter,
            current.autoInfo.centerlineNotesCounter,
            current.autoInfo.toggleLeft,

            current.teleopInfo.speakerCounter,
            current.teleopInfo.speakerMissCounter,
            current.teleopInfo.ampCounter,
            current.teleopInfo.ampMissCounter,
            current.teleopInfo.notesPassedCounter,
            current.teleopInfo.foulCounter,
            current.teleopInfo.techCounter,

            current.endInfo.trapAttempted,
            current.endInfo.trapResult,
            current.endInfo.climbAttempted,
            current.endInfo.climbResult,
            current.endInfo.park,
            current.endInfo.harmony,
            current.endInfo.breakdown,
            current.endInfo.defensePlayed,
            current.endInfo.defenseFaced,
            current.endInfo.comments,

            Date.now()
        ].join("\t");
        var code = qrcode(0,"H");
        code.addData(data);
        code.make();
        this.image = code.createSvgTag(10);
        this.url = "data:text/plain;base64,"+btoa(data);
        this.filename = name + ".txt";
        localStorage.setItem(name, data);
    },
    restart(){
        var name = Alpine.store("current").matchInfo.name;
        store();
        if(this.continueScouting){
            this.continueScouting = false;
            Alpine.store("current").matchInfo.name = name;
        }
    }
});

var dataScreen = () => ({
    url: null,
    images: null,
    display(){
        this.images = "";
        storage(key => {
            var data = localStorage.getItem(key);
            var code = qrcode(0,"H");
            code.addData(data);
            code.make();
            this.images +=
                `<div>
                     ${code.createSvgTag(8)}
                     <h1>Match ${data.split("\t")[2]}</h1>
                 </div>`;
        });
    },
    download(){
        var text = [];
        storage(key => text.push(localStorage.getItem(key)));
        this.url = "data:text/plain;base64,"+btoa(text.join("\n"));
    },
    clear(){
        var password = prompt("𝗪𝗶𝗽𝗲 𝗦𝗰𝗼𝘂𝘁𝗶𝗻𝗴 𝗗𝗮𝘁𝗮\nYou are about to wipe device's scouting data. Are you sure you want to clear scouting data?");
        if(hash(password) == 1919){
            storage(key => localStorage.removeItem(key));
        }
        this.display();
    }
});
