# Today's Mission: set up a reusable server/client framework for potential online card games

## TODOs
- [x] set up a proper backend (enter name & connect)
- [x] let clients create and join rooms
- [x] make it work locally
- [x] make it work on phones
- [ ] style it appropriately (2024: Don't be like Herbert!)
  - [x] proper background
  - [ ] icons which show whether a table is full or not (maybe even show how many players are sitting already)
  - [ ] find an elegant button style
  - [ ] find an elegant font
  - [ ] add this "warning/attention" pop-up when trying to close a tab ("Are you sure you want to close this tab?")
- [x] add a simple chat
- [ ] implement a first game (maybe try a simple & short logic but maybe more players or even an individual player number just for learning and testing purposes - could come in handy later on)
  - [ ] add CPU players
  - [ ] with CPU players implemented offline/alone playability is guaranteed too
- [ ] handle potential connection/disconnection/timeout issues
  - [ ] last resort = CPU player taking a disconnected (offline too long?) player's seat
  - [ ] prohibit multiple entries from one device
- [ ] online test on a proper server
- [ ] release a first simple game on a proper server
- [ ] release a first simple proper game as an app (~unlikely an iOS app)
- [ ] develop card games that do not exist yet
- [ ] **maybe** add Facebook/Google SDK for login
  - [ ] this could **maybe** contribute to sonething like an "Ewige Schrift"/endless score board

## Dependencies/Includes
Installing ```node``` and ```npm``` via *brew*, *nvm*, *docker*, etc. will provide a proper start into trying out this framework, I assume.

## Usage
two terminals in root directory
### terminal 1
update all scripts ```
npm install
```
start server ```
npm start
```
### terminal 2
start client ```
npm run client
```
### Possibly some additional dependencies are necessary but ```npm``` 's output will hopefully provide insight.