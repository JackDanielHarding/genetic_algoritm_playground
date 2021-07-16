const CANVAS_SIZE = 1000;
const FRAME_RATE = 30;

class Food{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;

        this.size = 5;
    }

    draw(){
        stroke(color(0, 0, 0))
        if(this.type == 0){
            fill(color(0, 0, 0))
        } else {
            fill(color(255, 255, 255))
        }
        rect(this.x, this.y, this.size, this.size);
    }
}

class Agent{

    constructor(x, y, DNA){
        this.x = x
        this.y = y
        this.movementVector = [0, 0]
        this.killtime = Date.now() + 10000

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
        this.r = DNA.redGene.value
        this.g = DNA.greenGene.value
        this.b = DNA.blueGene.value
        this.foodType = DNA.foodGene.value

        this.speed = 5 * (50 / this.size)
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

    constructor(name, value, mutationValue, minValue=0, maxValue=1000){
        this.name = name
        this.value = value
        this.mutationValue = mutationValue
        this.minValue = minValue
        this.maxValue = maxValue
    }

    mutate(mutationRate){
        if(random_number(mutationRate) == 0){
            if(random_number(2) == 0){
                this.value -= this.mutationValue
            } else {
                this.value += this.mutationValue
            }
        }

        if(this.value < this.minValue){
            this.value = this.minValue
        }

        if(this.value > this.maxValue){
            this.value = this.maxValue
        }
    }
}

class DNA{
    constructor(size, r, g, b, foodType, mutation){
        this.sizeGene = new Gene("Size", size, 10, 10)
        this.redGene = new Gene("Red", r, 10, 0, 255)
        this.greenGene = new Gene("Green", g, 10, 0, 255)
        this.blueGene = new Gene("Blue", b, 10, 0, 255)
        this.foodGene = new Gene("Food", foodType, 1, 0, 1)
        this.mutationGene = new Gene("Mutation", mutation, 1, 1)
    }

    mutate(){
        this.sizeGene.mutate(this.mutationGene.value)
        this.redGene.mutate(this.mutationGene.value)
        this.greenGene.mutate(this.mutationGene.value)
        this.blueGene.mutate(this.mutationGene.value)
        this.foodGene.mutate(this.mutationGene.value)
        this.mutationGene.mutate(this.mutationGene.value)
    }

    toString(){
        return `Size: ${this.sizeGene.value}
                R: ${this.redGene.value}
                G: ${this.greenGene.value}
                B: ${this.blueGene.value}
                Food: ${this.foodGene.value}
                Mutation Rate: ${this.mutationGene.value}`
    }

    copy(){
        return new DNA(this.sizeGene.value, this.redGene.value, this.greenGene.value, this.blueGene.value, this.foodGene.value, this.mutationGene.value)
    }
}

const food_cull_time = 10000

function multiply(original){
    var clone_dna = original.DNA.copy()
    clone_dna.mutate()
    return new Agent(original.x, original.y, clone_dna)
}

function setup(){
    let canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent('sketch-holder');
    frameRate(FRAME_RATE);
    generateCharts()
}

function random_number(limit){
    return Math.floor(Math.random() * limit)
}

var agents = []
const initial_size = 50
const initial_color = 150
const initial_mutation_rate = 6
var starting_dna_0 = new DNA(initial_size, initial_color, initial_color, initial_color, 0, initial_mutation_rate)
var starting_dna_1 = new DNA(initial_size, initial_color, initial_color, initial_color, 1, initial_mutation_rate)

var food = []

const FOOD_AMOUNT = 40

for(var i = 0; i < FOOD_AMOUNT; i++){
    food.push(new Food(random_number(CANVAS_SIZE), random_number(CANVAS_SIZE), 0))
    food.push(new Food(random_number(CANVAS_SIZE), random_number(CANVAS_SIZE), 1))
}

agents.push(new Agent(random_number(CANVAS_SIZE), random_number(CANVAS_SIZE), starting_dna_0))
agents.push(new Agent(random_number(CANVAS_SIZE), random_number(CANVAS_SIZE), starting_dna_1))

function mutate_agent(agent){
    agent.DNA.mutate()
    agent = new Agent(agent.x, agent.y, agent.DNA)
    console.log("Agent Mutated")
    console.log(agent.DNA.toString())
}

var directionIntervalId = window.setInterval(function(){
    for(const agent of agents){
        agent.movementVector = [random_number(3) - 1, random_number(3) - 1]
    }
  }, 500);

var chartUpdateIntervalId = window.setInterval(function(){
    gatherPopulationData()
  }, 5000);

const MAX_AGENTS = 100

function draw(){    

    for (const agent of agents){
        agent.move()
    }

    var agents_to_multiply = []

    for (const agent of agents){
        var agent_x = agent.x
        var agent_y = agent.y
        for (var j = 0; j < food.length; j++){
            var food_x = food[j].x
            var food_y = food[j].y
            if(food[j].type == agent.foodType && (food_x >= agent_x && food_x <= agent_x + agent.size) && (food_y >= agent_y && food_y <= agent_y + agent.size)){
                agents_to_multiply.push(agent)
                food.splice(j, 1)
                continue;
            }
        }
    }

    for (var i = 0; i < agents_to_multiply.length; i++){
        agents.push(multiply(agents_to_multiply[i]))
    }

    var killlist = []
    for (var i = 0; i < agents.length; i++){
        if (agents[i].killtime < Date.now()){
            killlist.push(i)
            if(agents[i].foodType == 0){
                food.push(new Food(agents[i].x + (agents[i].size / 2), agents[i].y + (agents[i].size / 2), 1))
            } else {
                food.push(new Food(agents[i].x + (agents[i].size / 2), agents[i].y + (agents[i].size / 2), 0))
            }
        }
    }

    for (var i = killlist.length - 1; i >= 0; i--){
        agents.splice(i, 1)
    }

    clear()
    fill(color(255, 255, 255))
    rect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    for (var i = 0; i < food.length; i++){
        food[i].draw()
    }

    for (const agent of agents){
        agent.draw()
    }
}

var timeIndex = 0

function gatherPopulationData(){
    timeIndex++

    var mutationRates = {}
    var averageMutationRate = 0
    var sizes = {}
    var averageSize = 0
    var foodTypes = {}

    for (const agent of agents){
        const mutationRate = agent.DNA.mutationGene.value.toString()
        if(!(mutationRate in mutationRates)){
            mutationRates[mutationRate] = 1
        } else {
            mutationRates[mutationRate]++
        }

        averageMutationRate += agent.DNA.mutationGene.value

        const size = agent.DNA.sizeGene.value.toString()
        if(!(size in sizes)){
            sizes[size] = 1
        } else {
            sizes[size]++
        }

        averageSize += agent.DNA.sizeGene.value
        
        const foodType = agent.foodType.toString()
        if(!(foodType in foodTypes)){
            foodTypes[foodType] = 1
        } else {
            foodTypes[foodType]++
        }
    }

    averageMutationRate = averageMutationRate / agents.length
    averageSize = averageSize / agents.length

    mutationRateHistogram.data.labels = []
    mutationRateHistogram.data.datasets[0].data = []

    for(const rate in mutationRates){
        mutationRateHistogram.data.labels.push(rate);
        mutationRateHistogram.data.datasets[0].data.push(mutationRates[rate])
    }

    mutationRateHistogram.update()

    mutationRateLineChart.data.labels.push(timeIndex.toString());
    mutationRateLineChart.data.datasets[0].data.push(averageMutationRate)
    mutationRateLineChart.update()

    sizeHistogram.data.labels = []
    sizeHistogram.data.datasets[0].data = []

    for(const size in sizes){
        sizeHistogram.data.labels.push(size);
        sizeHistogram.data.datasets[0].data.push(sizes[size])
    }

    sizeHistogram.update()

    sizeLineChart.data.labels.push(timeIndex.toString());
    sizeLineChart.data.datasets[0].data.push(averageSize)
    sizeLineChart.update()

    foodTypeHistogram.data.labels = []
    foodTypeHistogram.data.datasets[0].data = []

    for(const foodType in foodTypes){
        foodTypeHistogram.data.labels.push(foodType);
        foodTypeHistogram.data.datasets[0].data.push(foodTypes[foodType])
    }

    foodTypeHistogram.update()
}

var mutationRateHistogram = null
var mutationRateLineChart = null
var sizeHistogram = null
var sizeLineChart = null
var foodTypeHistogram = null

function generateBarChart(elementId, backgroundColor, borderColor, initalLabels, initialData, title){
    var chart = document.getElementById(elementId)
    var ctx = chart.getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: initalLabels,
            datasets: [{
                data: initialData,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}

function generateLineChart(elementId, borderColor, initialData, title){
    var chart = document.getElementById(elementId)
    var ctx = chart.getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0'],
            datasets: [{
                data: [initialData],
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}

function generateCharts(){
    mutationRateHistogram = generateBarChart('mutationRateHistogram', 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)', [initial_mutation_rate.toString()], [2], 'Mutation Rates')
    mutationRateLineChart = generateLineChart('mutationRateLineChart', 'rgba(255, 99, 132, 1)', initial_mutation_rate, 'Mutation Rate Over Time')

    sizeHistogram = generateBarChart('sizeHistogram', 'rgba(99, 255, 132, 0.2)', 'rgba(99, 255, 132, 1)', [initial_size.toString()], [2], 'Sizes')
    sizeLineChart = generateLineChart('sizeLineChart', 'rgba(99, 255, 132, 1)', initial_size, 'Size Over Time')

    foodTypeHistogram = generateBarChart('foodTypeHistogram', 'rgba(255, 132, 99, 0.2)', 'rgba(255, 132, 99, 1)', ['0', '1'], [1, 1], 'Food Types')
}
