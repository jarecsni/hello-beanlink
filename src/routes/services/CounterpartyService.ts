import type { Counterparty } from "../components/counterparty/types";

export class CounterpartyService {
    private static instance: CounterpartyService;
    private static counterparties: Counterparty[] = [
        {id: 0, label: 'My counterparty'},
        {id: 1, label: 'Your counterparty'},
        {id: 2, label: 'Another counterparty'},
        {id: 3, label: 'Awesome counterparty'}
    ]    
    private constructor() {

    }
    public static getInstance(): CounterpartyService {
        if (!CounterpartyService.instance) {
            CounterpartyService.instance = new CounterpartyService();
        }
        return CounterpartyService.instance;
    }
    getCounterparties() {
        return structuredClone(CounterpartyService.counterparties);
    }
}