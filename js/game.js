'use strict';
const gNumberColors = ['#0000FF', '#DAA520', '#9400D3', '#B22222', '#8FBC8F', '#8B0000', '#228B22', '#0000FF']

const MINE = '&#x1f4a3;';
const FLAG = '&#127988;';
const WINNER = '&#128526;'
const LOSER = '😱';

var gSafeClicksLeft;
var gBoard = [];
var gLevel = { size: 8, mines: 12 };
for (var i = 4; i <= 12; i += 4) {
    if(!localStorage.getItem(`bestTimeLevel${i}`)){
        localStorage.setItem(`bestTimeLevel${i}`, Infinity);
    }
}
var gGame = {};
var gMines = [];
var gHintsAvailable = 3;
var gIsHintMode;
var TSFirstClick = null;
var gameTimeInterval = null;
var gLives;
var gElLives = document.querySelector('.lives');
var gElSafeClicks = document.querySelector('.safe-click-btn');

// CR: Marked cells shouldn't be clickable.

// CR: Overall great code! Love the comments, makes the programmer's life easy! keep it up.

// Sprint Score: 96


function onInit(){
    let elFstPlaceSpan= document.querySelector('.best-time');

    elFstPlaceSpan.classList.add('text-focus-in');
    elFstPlaceSpan.style.display='none';
    elFstPlaceSpan.innerHTML=printBestTime(getBestTime());
    elFstPlaceSpan.style.display='inline';
}


function getBestTime(){
    console.log(gLevel.size);
    console.log(localStorage.getItem(`bestTimeLevel${gLevel.size}`));
    return  (localStorage.getItem(`bestTimeLevel${gLevel.size}`)==='Infinity')? null: localStorage.getItem(`bestTimeLevel${gLevel.size}`);
}
initGame();



function initGame(elSmileyButton = null) {
    if (elSmileyButton) {
        elSmileyButton.innerHTML = '&#128522';
        clearInterval(gameTimeInterval);
    }
    gLives = 3;
    gElLives.innerHTML = '💚💚💚';
    gSafeClicksLeft = 3;
    gElSafeClicks.innerText = 'safe click(3)';
    gIsHintMode = false;
    gMines = [];
    gHintsAvailable = 3;

    gGame = {
        isOn: false,
        shownCount: 0,
        mineFlaggedCount: 0,
    };
    buildBoard();
    renderBoard();
    var elButtonhint = document.querySelector('.button-hint');
    elButtonhint.innerText = 'hint (3)';
}




function buildBoard() {
    for (var i = 0; i < gLevel.size; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            };
            gBoard[i].push(cell);

        }
    }
}




function renderBoard() {
    var strHtml = '';
    for (var i = 0; i < gLevel.size; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < gLevel.size; j++) {
            strHtml += `<td class="cell cell-${i}-${j}" onclick="cellclicked(this)" onmouseover="handleMouseHintMode(this)"  onmouseout="handleMouseHintMode(this)" oncontextmenu="rightClick(this)" data-i="${i}" data-j=${j}></td>`
        }
        strHtml += '</td>'
    }
    var elTableBody = document.querySelector('tbody');
    elTableBody.innerHTML = strHtml;
}




function cellclicked(elCell) {
    { }

    var cellIdxI = +elCell.getAttribute('data-i');
    var cellIdxJ = +elCell.getAttribute('data-j');

    // check if this is the first cell click- if so, generate game war-zone
    if (!gGame.isOn) {
        if (gMines.length === 0) {  //indicates game hasn't initiated yet
        // CR: Next time check if gMines.length is falsy (!gMines.length).
            gGame.isOn = true;
            buildtWarZone(cellIdxI, cellIdxJ);
            TSFirstClick = Date.now();
            gameTimeInterval = setInterval(printTime, 1000);
            checkReveal(elCell, cellIdxI, cellIdxJ);
        } else return;


    } else if (gIsHintMode) {
        cellclickedHintMode(cellIdxI, cellIdxJ);
        gIsHintMode = false;
        setTimeout(clearHintedCells, 1500);

    }
    else if (gBoard[cellIdxI][cellIdxJ].isMine) {
        gLives--;                                    //lose 1 life
        var strHtml = '';
        for (var i = 1; i <= gLives; i++) {
            strHtml += '💚';
        }
        gElLives.innerHTML = strHtml;
        elCell.classList.add('stepped-Mine');
        if (gLives !== 0) {                       // now check if that was last life
            setTimeout(function () {
                elCell.classList.remove('stepped-Mine');
            }, 1000);
        }
        else {                                    // last life
            for (var i = 0; i < gMines.length; i++) {
                if (gMines[i].i === cellIdxI && gMines[i].j === cellIdxJ) { continue; }
                var elMineCell = document.querySelector(`.cell-${gMines[i].i}-${gMines[i].j}`);
                elMineCell.classList.add('revealed');
            }
            gameOver();
        }

        //just regular cell clicked, initiate check if there's need for recursion
    } else checkReveal(elCell, cellIdxI, cellIdxJ);
}


    // CR: getHint would be nicer 
function hint(elButtonHint) {

    if (gHintsAvailable === 0 || gGame.isOn === false) { return; }
    gHintsAvailable--;
    elButtonHint.innerText = `hint (${gHintsAvailable})`;
    gIsHintMode = true;
}



function gameOver() {
    var elMainSmiley = document.querySelector('.button-smiley');
    elMainSmiley.innerHTML = LOSER;
    gGame.isOn = false;
    for (var i = 0; i < gMines.length; i++) {
        var minePos = { i: gMines[i].i, j: gMines[i].j };
        var elMineCell = document.querySelector(`.cell-${minePos.i}-${minePos.j}`);
        elMineCell.innerHTML = MINE;
    }
    clearInterval(gameTimeInterval);
}


function victory() {
    var elMainSmiley = document.querySelector('.button-smiley');
    elMainSmiley.innerHTML = WINNER;
    clearInterval(gameTimeInterval);
    gGame.time = (Date.now() - TSFirstClick);
    var bestT = updateShortestTime(gGame.time, localStorage.getItem(`bestTimeLevel${gLevel.size}`));
    localStorage.setItem(`bestTimeLevel${gLevel.size}`, bestT);
}


function changeLevel(elbutton) {
    clearInterval(gameTimeInterval);
    gLevel.size = +elbutton.getAttribute('data-level');
    gLevel.mines = +elbutton.getAttribute('data-mines');
    onInit();
    initGame();
}
