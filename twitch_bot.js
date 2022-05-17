const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');
const Max = require('max-api');
require('dotenv').config();

// This will pre printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script.`);

// Define configuration options
const opts = {
	identity: {
		username: process.env.BOT_USERNAME, 
		password: process.env.OAUTH_TOKEN, 
	},
	channels: [
		'daniel_cowman'	
	],
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect on Twitch
client.connect();

// Define the range of valid CC#s
const minCC = 0;
const maxCC = 127;

// Initialize all CCs to 0
for (let i=0; i < 128; i++) {
    Max.outlet(`cc ${i}`)
	Max.outlet(`0 0 0`);
}

// Store all the CC values in an array for recall
const ccStore = ["0", "0", "0", "0", "0", "0", "0", "0", 
        	"0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0",
	        "0", "0", "0", "0", "0", "0", "0", "0"];

// Set up the handler for the current CC values comin into the script object's inlet

Max.addHandler("current", (msg) => {
	currentVal = msg.split(" ");
	let ccNum = parseInt(currentVal[0]);
	ccStore[parseInt(currentVal[0])] = parseInt(currentVal[1]);
	// Max.post(ccStore);
});

// Called every time a message comes in
function onMessageHandler (target, userstate, msg, self) {
	if (self) { return; } // Ignore messages from the bot

	// Remove whitespace from chat message
	const commandName = msg.trim();

	// If the command is known, let's execute it

	if (commandName === "!help") {
		client.say(target,  `${userstate.username} !cc is the main command. Syntax: "!cc [cc#] [value] [time]". [cc#] is from ${minCC}-${maxCC},
                            [value] is from 0-127, [time] is duration from old to new value in milliseconds. Ex: "!cc 5 23 1000" means CC#5 goes from
                            its current value to 23 in 1 second. Use "!val [cc#]" to check the current value. Ex: "!val 5" will get you CC#5's 
                            current value.`);
	
	} else if (commandName.startsWith("!cc")) {
		cc = commandName.replace('!cc', '').trim();
		ccVals = cc.split(" ");
		let botSay = "";

		if (ccVals.length === 3) {
			// Check for valid CC ranges (0-127)
			if (ccVals[0] >= minCC && ccVals[0] <= maxCC && ccVals[1] >=0 && ccVals[1] < 128) {

				// Output valid messages to Max
				Max.outlet(`cc ${ccVals[0]}`);
                Max.outlet(`${ccVals[0]} ${ccStore[ccVals[0]]} ${ccVals[1]} ${ccVals[2]}`)
				
				// Store the CC value for later recall
				let ccNum = parseInt(ccVals[0]);
				ccStore[ccNum] = ccVals[1];
				botSay = "Good job.";

			} else {
				botSay = "Invalid command.";
			}
		} else {
			botSay = "Invalid command.";
		}
		client.say(target, `${userstate.username} ${botSay}`);
		Max.post(`* Executed ${commandName} command`);
	} else if (commandName.startsWith('!val')) {
		ccRecall = parseInt(commandName.replace('!val', '').trim());

		// Make sure input is valid CC# and get value
		if (ccRecall >= 0 && ccRecall < 128) {
            Max.post(ccStore);
			botSay = `CC# ${ccRecall}'s value is ${ccStore[ccRecall]}.`;
		} else {
			botSay = "Invalid command.";
		}
		
		client.say(target, `${userstate.username} ${botSay}`);
	} else if (commandName.startsWith("!")) {
		client.say(target, `${userstate.username} Invalid command. :(`); 
		Max.post(`* Unknown command ${commandName}`);
	} else {
		Max.post(`* Unknown command ${commandName}`);
	}
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
	client.action(opts.channels[0], 'Put these foolish ambitions to rest.')
	Max.post(`* Connected to ${addr}:${port}`);
}

