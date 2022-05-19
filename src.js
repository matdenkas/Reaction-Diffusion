'use strict';

class Cell {
    constructor(initA, initB){
        this.A = initA;
        this.B = initB;
    }
}

class Cells {

    constructor(sizeInit) {
        this.myCells = [];
        this.size = sizeInit;
        for(var i = 0; i < size * size; i++){
            myCells.push(new Cell(1, 0));
        }   
    }
    
    static getCell(x, y) {
        if(x > size || x < 0) {
            return null;
        }
        else if(y > size || y < 0) {
            return null;
        }
        else return this.myCells[y * size + x];
    }
    
    static setCell(x, y, cell) {
        if(x > size || x < 0) {
            throw 'Cell DNE!';
        }
        else if(y > size || y < 0) {
            throw 'Cell DNE!';
        }
        else this.myCells[y * size + x] = cell;
    }
}


let kernal = [[.5, .2, .5], 
              [.2, -1, .2], 
              [.5, .2, .5]];

let size = 100;
let diffusionRateA = 1.0;
let duffysuibRateB = 0.5;
let feedRate = 0.055;
let killRate = 0.062;

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;


const ctx = $("canvas").get(0).getContext('2d');  
const cells = new Cells(size);


$(document).ready(function(){

    ctx.width = size;
    ctx.height = size;
    
    
    var grd = ctx.createLinearGradient(0, 0, 200, 0);
    grd.addColorStop(0, "red");
    grd.addColorStop(1, "white");

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(10, 10, 150, 80);
    

    let lastTick = Date.now();
    var myInterval = setInterval(frame, 0);
    
});

function frame(){
    var timestamp = Date.now();
    var deltaTime = (timestamp - lastTimestamp) / perfectFrameTime;
    lastTimestamp = timestamp;
    
    
    for(var i = 0; i < cells.size; i++) {
        for(var j = 0; j < cells.size; j++){
            var cell = cells.getCell(i, j);
            var [avgA, avgB] = runConvolution(i, j);
            cell.A = computeA(cell, avgA, deltaTime);
            cell.B = computeB(cell, avgB, deltaTime);
            cells.setCell(i, j, cell);
        }
    }
}


function computeA(cell, avgA, deltaT){
    return cell.A + ((diffusionRateA * avgA - cell.A * (cell.B * cell.B) + feedRate(1 - Cell.A))) * deltaT;
}

function computeB(cell, avgB, deltaT){
    return cell.B + ((diffusionRateB * avgB + cell.A * (cell.B * cell.B) - (killRate + feedRate) * cell.B)) * deltaT;
    
}


function runConvolution(x, y){
   
    var totalA = 0;
    var totalB = 0;
    for(var i = -1; i < 1; i++){
        for(var j = -1; j < 1; j++){
            cell = cells.getCell(x + i, y + j);
            cell = cell ?? new Cell(1, 0); //out of bounds
            
            k = kernal[x + i][y + j];
            totalA += cell.A * k;
            totalB += cell.B * k
        }
    }
    
    return [totalA/9, totalB/9];
}
        
