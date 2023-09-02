import data from "./data.json";

export declare type onStreamDataHandler = (symbol:string, number: number) => void;

export class DataPump {
    private symbol:string;
    private index: number = -1;
    private numbers:Array<number>;
    private running:boolean = false;
    private handler:onStreamDataHandler;

    constructor(symbol:string, numbers:Array<number>, handler:onStreamDataHandler) {
        this.symbol = symbol;
        this.numbers = numbers;
        this.handler = handler;
    }

    start():void {
        this.running = true;
        const doWork =() => {
            if (this.running) {
                const number = this.next();
                this.handler(this.symbol, number);
                // Generate a random interval between 1 and 5 seconds (1000 to 5000 milliseconds)
                const randomInterval = Math.floor(Math.random() * 4000) + 1000;
                // Call the doWork function again after the random interval
                setTimeout(doWork, randomInterval);
            }
        }      
        doWork();  
    }

    stop():void {
        this.running = false;
        this.index = -1;
    }

    next():number {
        if (++this.index >= this.numbers.length) {
            this.index = 0;
        }
        return this.numbers[this.index];        
    }
}


export class Streamer {
    
    private static instance: Streamer;
    private handlerMap: Map<String, Array<onStreamDataHandler>>;
    private data: {[key: string]: Array<number>};
    private pumpers:Array<DataPump> = [];
    private running:boolean = false;

    private constructor() {
        // Private constructor to prevent instantiation from outside the class
        this.handlerMap = new Map();
        this.data = data;
    }
  
    public static getInstance(): Streamer {
        if (!Streamer.instance) {
            Streamer.instance = new Streamer();
        }
        return Streamer.instance;
    }

    public initialise() {
        this.stopStreaming();
        this.handlerMap = new Map();
    }

    public connect(symbol:string, handler:onStreamDataHandler) {
        let handlers = this.handlerMap.get(symbol);
        if (!handlers) {
            handlers = [];
            this.handlerMap.set(symbol, handlers);
        }
        handlers.push(handler);
    }

    public disconnect(symbol:string, handler:onStreamDataHandler) {
        const handlers = this.handlerMap.get(symbol);
        if (handlers) {
            const index = handlers.findIndex((item) => item == handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }  
        }
    }

    public startStreaming() {
        this.running = true;
        for (const symbol in this.data) {
            const pumper = new DataPump(symbol, this.data[symbol], (symbol:string, number:number) => {
                this.publish(symbol, number);
            });
            this.pumpers.push(pumper);
            pumper.start();
        }
    }

    public stopStreaming() {
        this.running = false;
        this.pumpers.forEach(p => {
            p.stop();
        })
        this.pumpers = [];
    }

    private publish(symbol:string, number:number) {
        if (!this.running) {
            return;
        }
        const handlers:Array<onStreamDataHandler>|undefined = this.handlerMap.get(symbol);
        if (handlers) {
            handlers.forEach(h => {
                h(symbol, number);
            })
        }
    }

    public getSymbols() {
        return Object.keys(data);
    }
    //['AAPL', 'GOOGL', 'SI', 'AMZN']
}