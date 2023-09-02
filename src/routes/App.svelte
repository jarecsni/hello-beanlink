<div class="app">
    <TabBar tabs={['Steaming Prices', 'Circular Reference Detection']} let:tab bind:active>
        <Tab stacked={true} {tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
    {#if active === 'Steaming Prices'}
    <div class="toolbar">
        <CounterpartyPicker 
            {counterparties} selectedCounterparty={counterparties[0]}
        />
        <div class="button-panel">
            <div class="spacer"/>
            <div class="add-button">
                <EventButton label="New Tile" buttonClicked={addNewTile}/>
            </div>
        </div>
    </div>
    <div class="container">
        <TilesContainer bookingEnabled={$counterpartySpecified}/>
    </div>
    <div class="bottom-panel">

    </div>
    {:else if active === 'Circular Reference Detection'}
        <div>Circular stuff</div>
    {/if}
</div>

<script lang="ts">
    import Tab, { Label } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import CounterpartyPicker from './components/counterparty/CounterpartyPicker.svelte';
	import { CounterpartyService } from './services/CounterpartyService';
	import { BeanLink } from './beanlink/BeanLink';
	import { Streamer } from './datastream/Streamer';
    import EventButton from './components/button/EventButton.svelte';
    import TilesContainer from './components/tiles/TilesContainer.svelte';
	import { counterpartyChanged } from './components/counterparty/types';
	import { BookingFeature } from './features/BookingFeature';
	import { FeatureManager } from './beanlink/FeatureManager';
	import { addNewTile } from './components/tiles/types';
    import { counterpartySpecified } from './features/store';
    
    FeatureManager.instance.registerFeature(new BookingFeature());
    const counterparties = CounterpartyService.getInstance().getCounterparties();
    const { beanLink } = BeanLink.getInstance('App'); // top level BeanLink instance
    const counterpartyListener = (event:ReturnType<typeof counterpartyChanged.event>) => {
        console.log('counterparty changed:', event.value && event.value.label);
    };
    beanLink.on(counterpartyChanged, counterpartyListener);
    Streamer.getInstance().startStreaming();
    let active:string = 'Steaming Prices';
</script>

<style>
    .app {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    .toolbar {
        display: flex;
        padding: 10px;
        margin: 5px;
        background: rgb(209, 211, 213);
    }
    .container {
        display: flex;
        flex-wrap: wrap;
    }
    .bottom-panel {
        display: flex;
        flex-direction: column;
    }
    .button-panel {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
    }
    .spacer {
        flex-grow: 1;
    }
    .add-button {
        align-self: center;
    }
</style>
