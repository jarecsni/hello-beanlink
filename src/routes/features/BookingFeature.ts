import { counterpartyChanged } from '../components/counterparty/types';
import { BeanLink } from 'beanlink';
import { bookDeal, bookDealDone } from '../components/tiles/types';
import type { Feature } from 'beanlink';
import { counterpartySpecified } from './store';

export class BookingFeature implements Feature {
    private counterpartyListener;
    constructor() {
        this.counterpartyListener = (event:ReturnType<typeof counterpartyChanged.event>) => {
            counterpartySpecified.update(() => (!!event.value));
        };
    }

    setup():void {        
        BeanLink.registerFeature('App', this.name, (beanLink:BeanLink) => {
            beanLink.on(counterpartyChanged.name, this.counterpartyListener);
        });
        BeanLink.registerFeature('Tile', this.name, (beanLink:BeanLink) => {
            console.log('registering BookingFeature for tile context');
            beanLink.on(bookDeal, (event:ReturnType<typeof bookDeal.event>) => {
                console.log('[BookingFeature]', 'booking deal...', JSON.stringify(event.value));
                setTimeout(() => {
                    beanLink.publish(bookDealDone.event());
                }, 2000);
            }, false);
        });
    }
    get name() {
        return 'BookingFeature';
    }
}