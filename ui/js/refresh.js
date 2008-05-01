paused = false;
var startTime = new Date();

var reloadCallback = function(){
    return window.setInterval(function(){
        if(! paused){
            location.reload();
        }
    }, 5000);
};

var reloadId = reloadCallback();

var updateTimer = function(){
    var el = document.getElementById("refreshtimer");
    var timeLeft = 5 - (new Date() - startTime)/1000;
    if(timeLeft < 0) timeLeft = 0;
    el.innerHTML = (timeLeft).toFixed(0);
};

window.setInterval(function(){
    if(! paused) updateTimer();
}, 1000);

var pauseTimer = function(){
    paused = true;
    clearInterval(reloadId);
    document.getElementById("refreshing").style.display = "none";
    document.getElementById("paused").style.display = "inline";
};

var resumeTimer = function(){
    paused = false;
    reloadId = reloadCallback();
    startTime = new Date();
    updateTimer();
    document.getElementById("refreshing").style.display = "inline";
    document.getElementById("paused").style.display = "none";
};
