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
  - [x] add this "warning/attention" pop-up when trying to close a tab ("Are you sure you want to close this tab?")
- [x] add a simple chat
- [ ] implement a first game (maybe try a simple & short logic but maybe more players or even an individual player number just for learning and testing purposes - could come in handy later on)
  - [ ] add CPU players
  - [ ] with CPU players implemented offline/alone playability is guaranteed too
- [ ] handle potential connection/disconnection/timeout issues
  - [ ] last resort = CPU player taking a disconnected (offline too long?) player's seat
  - [ ] prohibit multiple entries from one device
- [x] online test on a proper server
- [ ] release a first simple game on a proper server
- [ ] release a first simple proper game as an app (~unlikely an iOS app)
- [ ] develop card games that do not exist yet
- [ ] **maybe** add Facebook/Google SDK for login
  - [ ] this could **maybe** contribute to something like an "Ewige Schrift"/endless score board

First game: **Mulatschak**
- [ ] HUD
  - [ ] which cards are shown to whom (**TODO:** check if one cannot cheat by looking at *source code* in browser!!)
  - [x] shuffle cards
  - [x] deal cards
  - [ ] waiting for reality-feeling? **(do not become Fifa)**
    - [ ] short time wait?
    - [ ] animation?
- [ ] handle player(s) leaving mid game
  - [ ] later switch: CPU player takes gone player's *seat*
  - [ ] wait a couple of second/a minute
- [ ] *Lizitation*
- [ ] *Schrift*
- [ ] **Game Logic**
  -[x] [Rules: Wikipedia](https://de.wikipedia.org/wiki/Mulatschak)
- [ ] Sound(s)
  

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