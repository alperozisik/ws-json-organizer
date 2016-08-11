# WebSocket JSON Organizer
This module provides a function to parse JSON Objects from multiple (or single) JSONs in a single string chunk. It is useful such when a WebSocket on message event is supposed to be fired only for a single JSON message however some times it contains more than one JSON.

Use this function as pre-processor for messages in WebSocket

## How to use
This module can be used in NodeJS or Browser (AMD) environment. In order to use the function, just require it.

## Install
```shell
npm i ws-json-organizer --save
```

## Usage
```javascript
var parseEachJSON = require("ws-json-organizer");

function onMessage (messageText) {
    parseEachJSON(messageText, handleContent, this);

    function handleContent(err, jsonObj) {
        if (err) {
            // use setTimeout for not to break whole flow for other future messages
            return setTimeout(function() {
                var e = new Error("Debugger recieved invalid message");
                e.data = contentText;
                console.error(e);
                throw e;
            });
        }
        
        //perform your own logic such as the one below
        
        for (var i = 0; i < this.$pending.length; i++) {
            if (this.$pending[i][1].seq == jsonObj.request_seq) {
                this.$pending.splice(i, 1);
                break;
            }
        }

        if (!this.$attached) {
            this.$beforeAttachMessages.push(jsonObj);
        }
        this.emit("debugger_command_0", {
            data: jsonObj
        });
    }
}

```