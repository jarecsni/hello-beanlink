
<div class="tile">
    <div class="tile-row-1">
        <div>
            <Select bind:value={selectedSymbol} label="Symbol">
                {#each symbols as symbol}
                    <Option value={symbol}>{symbol}</Option>
                {/each}
            </Select>
        </div>
        <div class="close-button">
            <IconButton class="material-icons" on:click={()=>{onCloseTile()}}>
                close
            </IconButton>
        </div>
    </div>
    <div class="price">
        <PriceLabel/>
    </div>
    <div class="buttons">
        <EventButton 
            label="Book" 
            disabled={disabled} 
            buttonClicked={bookDealButtonClicked}
        />
        {#if bookingInProgress}
            <img src={Spinner} alt="spinner" class="spinner"/>
        {/if}
    </div>
</div>

<script lang="ts">
    import IconButton from '@smui/icon-button';
	import { BeanLink } from 'beanlink';
	import Select, { Option } from '@smui/select';
	import { Streamer } from '../../datastream/Streamer';
	import { 
        closeTile, 
        symbolChanged, 
        bookDeal, 
        priceLabelSetValue, 
        priceTickReceived,
		bookDealButtonClicked,
		bookDealDone,
    } from './types';
	import PriceLabel from './PriceLabel.svelte';
    import EventButton from '../button/EventButton.svelte';
    import Spinner from './spinner.gif';

    export let id:string;
    export let selectedSymbol = '';

    const { beanLink, parentBeanLink } = BeanLink.getInstance('Tile');

    export let bookingEnabled = false;

    let symbols = Streamer.getInstance().getSymbols();
    let price = 0;
    let disabled = true;
    let bookingInProgress = false;

    function onCloseTile() {
        parentBeanLink.publish(closeTile.event(id));
    }

    $: {
        disabled = !bookingEnabled || !selectedSymbol;
        parentBeanLink.publish(symbolChanged.event({id, symbol: selectedSymbol}));        
    }

    const priceTickListener = (event: ReturnType<typeof priceTickReceived.event>)=> {
        if (event.value.symbol === selectedSymbol) {
            // FIXME this is not nice to filter like this - need to be able to filter earlier on
            price = event.value.value;
            beanLink.publish(priceLabelSetValue.event(price));
        }
    };
    parentBeanLink.on(priceTickReceived, priceTickListener);

    const buttonListener = () => {
        bookingInProgress = true;
        beanLink.publish(bookDeal.event({symbol: selectedSymbol, value: price}));
    };
    beanLink.on(bookDealButtonClicked, buttonListener);

    const dealBookListener = () => {
        bookingInProgress = false;
    }
    beanLink.on(bookDealDone, dealBookListener);

</script>

<style>
    .tile {
        display: flex;
        flex-direction: column;
        background-color: lightsteelblue;
        margin: 5px;
        padding: 10px;
    }
    .tile-row-1 {
        display: flex;
        flex-direction: row;
        background-color: lightsteelblue;
    }
    .spinner {
        width: 32px;
        height: 32px;
        margin-left: 5px;
        align-self: center;
    }
    .buttons {
        display: flex;
    }
</style>