'use strict';

class Cell {
    constructor(initA, initB){
        this.A = initA;
        this.B = initB;
    }

    getAColor() {
        //console.log("I ran: " + this.A)
        return 255 * this.A;
    }

    getBColor(){
        return 255 * this.B;
    }
}

class Cells {

    constructor(sizeInit) {
        this.myCells = [];
        this.size = sizeInit;
        for(var i = 0; i < size * size; i++){
            this.myCells.push(new Cell(1, 0));
        }   
    }
    
    getCell(x, y) {
        if(x > size || x < 0) {
            return null;
        }
        else if(y > size || y < 0) {
            return null;
        }
        else return this.myCells[y * size + x];
    }
    
    setCell(x, y, cell) {
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

let size = 200;
let diffusionRateA = 1.0;
let diffusionRateB = 0.5;
let feedRate = 0.055;
let killRate = 0.062;

const intervalTime = 2000;
let deltaTime = 0;
let lastTimestamp = Date.now();


const ctx = $("canvas").get(0).getContext('2d');  
const cells = new Cells(size);


$(document).ready(function(){

    ctx.width = size;
    ctx.height = size;

    var startX = Math.ceil(size/2);
    var startY = Math.ceil(size/2);

    for(var i = -3; i < 3; i++){
        for(var j = -3; j < 3; j++){
            var cell = cells.getCell(startX + i, startY + j);
            cell.B = 1;
            cells.setCell(startX + i, startY + j, cell)
        }
    }
    
    var myInterval = setInterval(frame, 2000);
});

var logged = false;
function frame(){
    var timestamp = Date.now();
    var deltaTime = (timestamp - lastTimestamp - intervalTime) / 1000;
    //console.log('Tick:', timestamp.toString())
    console.log({
        timestamp: timestamp,
        lastTimestamp: lastTimestamp,
        deltaTime: deltaTime,
    })
    lastTimestamp = timestamp;
    
    draw();

    var NaNCounter = 0;
    var BCounter = 0;
    var ACounter = 0;
    cells.myCells.forEach((cell) => {
        if(cell.A === NaN || cell.B === NaN){
            counter++;
        }
        if(cell.B > 0) {
            BCounter++;
        }
        if(cell.A > 0) {
            ACounter++;
        }
    });

    console.log('Nan-Count:', NaNCounter);
    console.log('B-Count:', BCounter);
    console.log('A-Count:', ACounter);
    
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
    // if(!logged){
    //     logged = true;
    //     console.log({
    //         prev: cell.A,
    //         diffusionRateA: diffusionRateA,
    //         avgA: avgA,
    //         diffA_avgA: diffusionRateA * avgA,
    //         prevB: cell.B,
    //         chance: cell.A * (cell.B * cell.B),
    //         feedRate: feedRate,
    //         feedtotal: feedRate * (1 - cell.A),
    //         deltaT: deltaT,
    //         full: cell.A + (diffusionRateA * avgA - cell.A * (cell.B * cell.B) + feedRate * (1 - cell.A)) * deltaT,
    //     })
    //}
    return (cell.A + (diffusionRateA * avgA - cell.A * (cell.B * cell.B) + feedRate * (1 - cell.A))) * deltaT;
}

function computeB(cell, avgB, deltaT){
    return (cell.B + (diffusionRateB * avgB + cell.A * (cell.B * cell.B) - (killRate + feedRate) * cell.B)) * deltaT;
    
}

function runConvolution(x, y){
   
    var totalA = 0;
    var totalB = 0;
    for(var i = -1; i < 1; i++){
        for(var j = -1; j < 1; j++){
            var cell = cells.getCell(x + i, y + j);
            cell = cell ?? new Cell(1, 0); //out of bounds
            
            var k = kernal[i + 1][j + 1];
            totalA += cell.A * k;
            totalB += cell.B * k
        }
    }
    
    return [totalA/9, totalB/9];
}

function draw() {
    var image = ctx.getImageData(0, 0, ctx.width, ctx.height);
    for(var i = 0; i < cells.size; i++) {
        for(var j = 0; j < cells.size; j++){

            var cell = cells.getCell(i, j);
            if (cell === null) {
                throw 'Cell DNE!';
            }
            else{
                var index = 4 * (cells.size * j + i);

                if(cell.B > 0){
                    image.data[index + 0] = 0;
                    image.data[index + 1] = 0;
                    image.data[index + 2] = 255;
                    image.data[index + 3] = 255;
                }
                else {
                    image.data[index + 0] = 0;
                    image.data[index + 1] = 255;
                    image.data[index + 2] = 0;
                    image.data[index + 3] = 255;
                }


                //console.log(cell.getAColor());

            }
        }
    }
    ctx.putImageData(image, 0, 0);
}
       
