import { createEvent } from 'beanlink';

export const counterpartyChanged = createEvent<Counterparty>('counterparty');

export type Counterparty = {
    id: number;
    label: string;
};