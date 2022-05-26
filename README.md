# Auction house

This is a fork i created for the specific use case of tracking auction price data on honing materials.

It will parse all the items on your interest list with all the data available on that page. Once parse it saves it in a json file called recent_scans.

## OCR data from auction house
This controls your mouse and uses OCR to extract the price information. 

**Beaware**: re-configuration might be needed if a different screen resoution is used. This can be changed in `src/utils.ts`
```
yarn scan
```


## Save data
Save recent_scans data onto the sql db
```
yarn transfer
```

## Grab Database
Push the database info to a JSON file
```
yarn export
```



## To do
    [x] use in-game interest list instead of passed list of strings
    [ ] check if game is in 21:9 to warn user and not start program  
    [x] implement better refetching system. 
    [ ] make api server to connect it to google sheets

