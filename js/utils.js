'use strict';

function buildtWarZone(firstI, firstJ) {
    // plant mines on the board randomly, NOT on first cell clicked.
    for (var i = 1; i <= gLevel.mines; i++) {
        var idxI = getRandomIntInclusive(0, gLevel.size - 1);
        var idxJ = getRandomIntInclusive(0, gLevel.size - 1);
        while ((idxI === firstI && idxJ === firstJ) || (gBoard[idxI][idxJ].isMine)) {  //if rand pos is first cell clicked rand new pos.  !idxI for first pos randing 
            var idxI = getRandomIntInclusive(0, gLevel.size - 1);
            var idxJ = getRandomIntInclusive(0, gLevel.size - 1);
        }
        gBoard[idxI][idxJ].isMine = true;
        gMines.push({ i: idxI, j: idxJ });
    }
    console.table('mines at ', gMines);

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            setMinesNegsCount(i, j);
        }
    }

}


function setMinesNegsCount(idxI, idxJ) {
    var mineSum = 0;
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i === gLevel.size) { continue; }
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j === gLevel.size) { continue; }
            if (i === idxI && j === idxJ) { continue; }
            if (gBoard[i][j].isMine === true) {
                mineSum++;
            }
        }
    }
    gBoard[idxI][idxJ].minesAroundCount = mineSum;
}



function checkReveal(elCell, cellIdxI, cellIdxJ) {

    if (gBoard[cellIdxI][cellIdxJ].minesAroundCount === 0 && !gBoard[cellIdxI][cellIdxJ].isRevealed) {
        revealCell(elCell, cellIdxI, cellIdxJ);
        for (var i = cellIdxI - 1; i <= cellIdxI + 1; i++) {
            if (i < 0 || i === gLevel.size) { continue; }
            for (var j = cellIdxJ - 1; j <= cellIdxJ + 1; j++) {
                if (j < 0 || j === gLevel.size) { continue; }
                if (i === cellIdxI && j === cellIdxJ) { continue; } {
                    var elNewCell = document.querySelector(`.cell-${i}-${j}`);
                    checkReveal(elNewCell, i, j);
                }
            }
        }
    } else if (!gBoard[cellIdxI][cellIdxJ].isMine && !gBoard[cellIdxI][cellIdxJ].isRevealed) {
        revealCell(elCell, cellIdxI, cellIdxJ);
    }
}



function revealCell(elCell, cellIdxI, cellIdxJ) {

    if (gBoard[cellIdxI][cellIdxJ].isRevealed) { return; }
    if (gBoard[cellIdxI][cellIdxJ].minesAroundCount !== 0) {
        elCell.innerText = gBoard[cellIdxI][cellIdxJ].minesAroundCount;
    }

    gGame.shownCount++;
    gBoard[cellIdxI][cellIdxJ].isRevealed = true;
    elCell.classList.add('revealed');
    elCell.style.color = gNumberColors[gBoard[cellIdxI][cellIdxJ].minesAroundCount - 1];
    // checkpoint for victory - last regular cell clicked
    if (gGame.mineFlaggedCount === gLevel.mines && gGame.shownCount === gLevel.size ** 2 - gLevel.mines) {
        victory();
    }
}





function cellclickedHintMode(cellIdxI, cellIdxJ) {
    for (var i = cellIdxI - 1; i <= cellIdxI + 1; i++) {
        if (i < 0 || i === gLevel.size) { continue; }
        for (var j = cellIdxJ - 1; j <= cellIdxJ + 1; j++) {
            if (j < 0 || j === gLevel.size) { continue; }
            var hintCell = document.querySelector(`.cell-${i}-${j}`);
            if (gBoard[i][j].isMine) {
                hintCell.innerHTML = MINE;
            } else if (gBoard[i][j].minesAroundCount > 0) {
                hintCell.innerHTML = gBoard[i][j].minesAroundCount;
            }
        }
    }
}





function rightClick(elCell) {
    if (!gGame.isOn) { return; }
    var cellIdxI = +elCell.getAttribute('data-i');
    var cellIdxJ = +elCell.getAttribute('data-j');

    if (gBoard[cellIdxI][cellIdxJ].isRevealed === true) { return; }

    if (gBoard[cellIdxI][cellIdxJ].ismarked === true) {
        if (gBoard[cellIdxI][cellIdxJ].isMine) {
            gGame.mineFlaggedCount--;
        }
        gBoard[cellIdxI][cellIdxJ].ismarked = false;
        elCell.innerHTML = '';
    } else {
        elCell.innerHTML = FLAG;
        gBoard[cellIdxI][cellIdxJ].ismarked = true;
        if (gBoard[cellIdxI][cellIdxJ].isMine) {
            gGame.mineFlaggedCount++;
        }
    }
    // 2nd checpoint for victory -  if all cells were clicked and this is the last mine flagged
    if (gGame.mineFlaggedCount + gGame.shownCount === gLevel.size ** 2) {
        victory();
    }
}




function handleMouseHintMode(elCell) {
    if (!gIsHintMode) { return; }
    var cellIdxI = +elCell.getAttribute('data-i');
    var cellIdxJ = +elCell.getAttribute('data-j');
    for (var i = cellIdxI - 1; i <= cellIdxI + 1; i++) {
        if (i < 0 || i === gLevel.size) { continue; }
        for (var j = cellIdxJ - 1; j <= cellIdxJ + 1; j++) {
            if (j < 0 || j === gLevel.size) { continue; }
            var elHintCell = document.querySelector(`.cell-${i}-${j}`);
            if (!elHintCell.classList.contains('suggest-hint')) {
                elHintCell.classList.add('suggest-hint');
            } else {
                elHintCell.classList.remove('suggest-hint');
            }
        }
    }
}


function clearHintedCells() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            if (elCell.classList.contains('suggest-hint')) {
                if (!gBoard[i][j].isRevealed) {
                    elCell.innerHTML = '';
                }
                elCell.classList.remove('suggest-hint');
            }
        }
    }
}

if (document.addEventListener) {
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
} else {
    document.attachEvent('oncontextmenu', function () {
        alert("You've tried to open context menu");
        window.event.returnValue = false;
    });
}



//handle watch on head bar
function printTime() {
    var elTime = document.querySelector('.time');
    var currTime = Date.now();
    var Tdif = currTime - TSFirstClick;
    var minutes = Math.floor((Tdif % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((Tdif % (1000 * 60)) / 1000);
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;;
    elTime.innerHTML = minutes + ':' + seconds;
}
function printBestTime(TS){
    console;
    if(TS==null){
        return 'No best Time yet'
    }
    var minutes = Math.floor((TS % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((TS % (1000 * 60)) / 1000);
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;;
    return( minutes + ':' + seconds );
}



function updateShortestTime(currBestTime, lastGameTime) {
    if (currBestTime > lastGameTime) {
        var elBestTimeSpan = document.querySelector('.bestT');
        elBestTimeSpan.innerText = parseInt(lastGameTime / 1000) + ' secconds';
        alert('OMG! you just destroyed the record!');
        return lastGameTime;
    }
    return currBestTime;
}


function safeClick(elSafeClicksButton) {
    if (gSafeClicksLeft === 0 || gGame.isOn===false) { return; }
    var safePoses = [];
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++)
            if (gBoard[i][j].isMine === false && gBoard[i][j].isRevealed === false) {
                safePoses.push({ idxI: i, idxJ: j });
            }
    }
    var posIdx = safePoses[getRandomIntInclusive(0, safePoses.length - 2)];
    var elSafeCell = document.querySelector(`.cell-${posIdx.idxI}-${posIdx.idxJ}`);
    elSafeCell.innerText = gBoard[posIdx.idxI][posIdx.idxJ].minesAroundCount;
    elSafeCell.classList.add('revealed');
    gSafeClicksLeft--;
    elSafeClicksButton.innerText= `safe click(${gSafeClicksLeft})` ;
    setTimeout(function () {
        elSafeCell.innerText = '';
        elSafeCell.classList.remove('revealed');
    }, 2000);
}




function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

