const CANVAS_SIZE = 1000;
const FRAME_RATE = 30;

class Agent{

    constructor(x, y, DNA){
        this.x = x
        this.y = y
        this.movementVector = [0, 0]

        this.DNA = DNA

        this.loadDNA(DNA)
    }

    draw(){
        stroke(color(0, 0, 0))
        fill(color(this.r, this.g, this.b))
        rect(this.x, this.y, this.size, this.size);
    }

    loadDNA(DNA){
        this.size = DNA.sizeGene.value
        this.speed = 5 * (50 / this.size)
        this.r = DNA.redGene.value
        this.g = DNA.greenGene.value
        this.b = DNA.blueGene.value
    }

    move(){
        this.x += this.movementVector[0] * this.speed
        this.y += this.movementVector[1] * this.speed

        if(this.x < 0){
            this.x = 0
        } else if (this.x > (CANVAS_SIZE - this.size)){
            this.x = CANVAS_SIZE - this.size
        }

        if(this.y < 0){
            this.y = 0
        } else if (this.y > (CANVAS_SIZE - this.size)){
            this.y = CANVAS_SIZE - this.size
        }
    }
}

class Gene{

    constructor(name, value, mutationValue){
        this.name = name
        this.value = value
        this.mutationValue = mutationValue

        this.mutationRate = 2
    }

    mutate(){
        if(random_number(this.mutationRate) == 0){
            if(random_number(2) == 0){
                this.value -= this.mutationValue
            } else {
                this.value += this.mutationValue
            }
        }
    }
}

class DNA{
    constructor(size, r, g, b){
        this.sizeGene = new Gene("Size", size, 10)
        this.redGene = new Gene("Red", r, 10)
        this.greenGene = new Gene("Green", g, 10)
        this.blueGene = new Gene("Blue", b, 10)
    }

    mutate(){
        this.sizeGene.mutate()
        this.redGene.mutate()
        this.greenGene.mutate()
        this.blueGene.mutate()
    }

    toString(){
        return `Size: ${this.sizeGene.value}
                R: ${this.redGene.value}
                G: ${this.greenGene.value}
                B: ${this.blueGene.value}`
    }
}

function breed(DNA1, DNA2){
    var childSize = null
    var childR = null
    var childG = null
    var childB = null

    if(random_number(2) == 0){
        childSize = DNA1.sizeGene
    } else {
        childSize = DNA2.sizeGene
    }

    if(random_number(2) == 0){
        childR = DNA1.redGene
    } else {
        childR = DNA2.redGene
    }

    if(random_number(2) == 0){
        childG = DNA1.greenGene
    } else {
        childG = DNA2.greenGene
    }

    if(random_number(2) == 0){
        childB = DNA1.blueGene
    } else {
        childB = DNA2.blueGene
    }

    return new DNA(childSize.value, childR.value, childG.value, childB.value)
}

function setup(){
    let canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent('sketch-holder');
    frameRate(FRAME_RATE);
}

function random_number(limit){
    return Math.floor(Math.random() * limit)
}

var agents = []
var starting_dna = new DNA(50, 150, 150, 150)

agents.push(new Agent(random_number(CANVAS_SIZE), random_number(CANVAS_SIZE), starting_dna))
agents.push(new Agent(random_number(CANVAS_SIZE), random_number(CANVAS_SIZE), starting_dna))

function mutate_agent(agent){
    agent.DNA.mutate()
    agent = new Agent(agent.x, agent.y, agent.DNA)
    console.log("Agent Mutated")
    console.log(agent.DNA.toString())
}

var breedIntervalId = window.setInterval(function(){
    var breeds = Math.floor(agents.length/2)
    for (var i = 0; i < breeds; i++){
        childDna = breed(agents[random_number(agents.length)].DNA, agents[random_number(agents.length)].DNA)
        childDna.mutate()
        agents.push(new Agent(random_number(CANVAS_SIZE), random_number(CANVAS_SIZE), childDna))
    }
  }, 5000);

var directionIntervalId = window.setInterval(function(){
    for(var i = 0; i < agents.length; i++){
        agents[i].movementVector = [random_number(3) - 1, random_number(3) - 1]
    }
  }, 500);

const MAX_AGENTS = 100

function draw(){    

    while (agents.length > MAX_AGENTS){
        agents.splice(random_number(agents.length), 1)
    }

    for (var i = 0; i < agents.length; i++){
        agents[i].move()
    }

    clear()
    fill(color(255, 255, 255))
    rect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    for (var i = 0; i < agents.length; i++){
        agents[i].draw()
    }
}
