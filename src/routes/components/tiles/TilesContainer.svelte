{#each tiles as tile (tile.id)}
    <Tile id={tile.id} {bookingEnabled}/>
{/each}

<script lang="ts">
    import {v4 as uuidv4} from 'uuid';
	import { BeanLink } from 'beanlink';
    import Tile from './Tile.svelte';
	import { addNewTile, closeTile, priceTickReceived, symbolChanged } from './types';
	import { Streamer, type onStreamDataHandler } from '../../datastream/Streamer';
	
    export let bookingEnabled = false;

    const { beanLink, parentBeanLink } = BeanLink.getInstance('TilesContainer');
    let tiles:{id:string, symbol?:string, streamHandler?:onStreamDataHandler}[] = [];

    const addNewTitleListener = () => {
        let tileId = uuidv4();
        tiles.push({
            id: tileId
        });
        tiles = tiles; // svelte needs this
    };
    parentBeanLink.on(addNewTile, addNewTitleListener);

    const closeTileListener = (event:ReturnType<typeof closeTile.event>) => {
        const index = tiles.findIndex((element) => element.id === event.value);
        if (index !== -1) {
            Streamer.getInstance().disconnect(tiles[index].symbol!, tiles[index].streamHandler!);
            tiles.splice(index, 1);
            tiles = tiles;
        }
    };
    beanLink.on(closeTile, closeTileListener);

    const symbolChangedListener = (event:ReturnType<typeof symbolChanged.event>) => {
        const index = tiles.findIndex((element) => element.id === event.value.id);
        const oldSymbol = tiles[index].symbol;
        tiles[index].symbol = event.value.symbol;
        if (tiles[index].streamHandler) {
            Streamer.getInstance().disconnect(oldSymbol!, tiles[index].streamHandler!);
        }
        const streamHandler = (symbol:string, value:number) => {
            // This is not a circular reference as it will happen at a different time!
            beanLink.publish(priceTickReceived.event({symbol, value}));
        };
        tiles[index].streamHandler = streamHandler;
        Streamer.getInstance().connect(tiles[index].symbol!, streamHandler);
    };
    beanLink.on(symbolChanged, symbolChangedListener);

</script>