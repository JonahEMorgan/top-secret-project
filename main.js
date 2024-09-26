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

var range = (a, b) => [...Array(b).keys()].slice(a);

var prime = n => range(2, n).reduce((b, v) => n % v != 0 && b,true);

var primes = range(2, 98).filter(prime);

var hash = string => [...[...string].entries()].reduce((s, [i, v]) => s + v.charCodeAt() * primes[i % primes.length],0);

var storage = callback => range(0, localStorage.length).forEach(n => callback(localStorage.key(n)));

document.addEventListener("alpine:init",() => Alpine.store("current", JSON.parse(config)));

var counter = (property, label) => ({
    init(){
        this.$el.classList.add("grid");
        this.$el.innerHTML =
            `<button @click="if($store.current.${property} > 0) $store.current.${property}--">-</button>
                 <div align="center">
                     <h4>${label}</h4>
                     <h1 x-text="$store.current.${property}"></h1>
                 </div>
             <button @click="$store.current.${property}++">+</button>
        `;
    }
});

var endScreen = () => ({
    image: null,
    matchLabel: "XXXX_XXXX",
    url: null,
    filename: null,
    continueScouting: false,
    display(){
        if(this.$store.current.matchInfo.name == null) {
            alert("Please enter name!");
            return;
        }
        if(this.$store.current.matchInfo.matchNum == null) {
            alert("Please enter match number!");
            return;
        }
        if(this.$store.current.matchInfo.teamNum == null) {
            alert("Please enter team number!");
            return;
        }
        this.matchLabel = [
            matchTypes[this.$store.current.matchInfo.matchType],
            this.$store.current.matchInfo.matchNum
        ].join("_");
        var name = [
            this.$store.current.matchInfo.alliance,
            this.$store.current.matchInfo.startingPosition,
            matchTypes[this.$store.current.matchInfo.matchType],
            this.$store.current.matchInfo.isReplay ? "replay" : "",
            "ScoutingData",
            this.$store.current.matchInfo.matchNum
        ].join("");
        var data = [
            this.$store.current.matchInfo.name,
            this.$store.current.matchInfo.matchType,
            this.$store.current.matchInfo.matchNum,
           +this.$store.current.matchInfo.isReplay,
            this.$store.current.matchInfo.alliance,
            this.$store.current.matchInfo.teamNum,
            this.$store.current.matchInfo.startingPosition,

            this.$store.current.autoInfo.speakerCounter,
            this.$store.current.autoInfo.speakerMissCounter,
            this.$store.current.autoInfo.ampCounter,
            this.$store.current.autoInfo.ampMissCounter,
            this.$store.current.autoInfo.centerlineNotesCounter,
            this.$store.current.autoInfo.toggleLeft,

            this.$store.current.teleopInfo.speakerCounter,
            this.$store.current.teleopInfo.speakerMissCounter,
            this.$store.current.teleopInfo.ampCounter,
            this.$store.current.teleopInfo.ampMissCounter,
            this.$store.current.teleopInfo.notesPassedCounter,
            this.$store.current.teleopInfo.foulCounter,
            this.$store.current.teleopInfo.techCounter,

            this.$store.current.endInfo.trapAttempted,
            this.$store.current.endInfo.trapResult,
            this.$store.current.endInfo.climbAttempted,
            this.$store.current.endInfo.climbResult,
            this.$store.current.endInfo.park,
            this.$store.current.endInfo.harmony,
            this.$store.current.endInfo.breakdown,
            this.$store.current.endInfo.defensePlayed,
            this.$store.current.endInfo.defenseFaced,
            this.$store.current.endInfo.comments,

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
        var store = JSON.parse(config);
        if(this.continueScouting){
            this.continueScouting = false;
            store.matchInfo.name = this.$store.current.matchInfo.name;
        }
        this.$store.current = store;
    }
});

var dataScreen = () => ({
    url: null,
    images: [],
    display(){
        this.images = [];
        storage(key => {
            var data = localStorage.getItem(key);
            var code = qrcode(0,"H");
            code.addData(data);
            code.make();
            this.images.push({
                html: code.createSvgTag(8),
                label: "Match " + data.split("\t")[2],
            });
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
