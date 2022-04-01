# Auction house

This is a fork i created for the specific use case of tracking auction price data on honing materials.

*remove*
## Scrape recipe data
```
yarn scrape
```


## OCR data from auction house
This controls your mouse and uses OCR to extract the price information. 

**Beaware**: re-configuration might be needed if a different screen resoution is used. This can be changed in `src/AuctionExctractor.js` line 9 - 12.
```
yarn ocr
```


## Analyze data
```
yarn start
```


## To do
Re query for failed searches
use in-game interest list instead of passed list of strings
