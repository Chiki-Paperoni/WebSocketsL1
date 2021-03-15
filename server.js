"use strict";

const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const index = fs.readFileSync("./index.html", "utf8");
let data = {};
const server = http.createServer((req, res) => {
	if (req.url === "/data" && req.method === "GET") {
		console.log(1);
		res.writeHead(200);
		res.end(JSON.stringify(data));
	} else {
		res.writeHead(200);
		res.end(index);
	}
});

server.listen(8000, () => {
	console.log("Listen port 8000");
});

const ws = new WebSocket.Server({ server });

ws.on("connection", (connection, req) => {
	const ip = req.socket.remoteAddress;
	console.log(`Connected ${ip}`);
	connection.on("message", (message) => {
		console.log("Received: " + message);
		const change = JSON.parse(message);
		data[change.cell] = change.value;
		console.log(JSON.stringify(data));
		for (const client of ws.clients) {
			if (client.readyState !== WebSocket.OPEN) continue;
			if (client === connection) continue;
			client.send(message);
		}
	});
	connection.on("close", () => {
		console.log(`Disconnected ${ip}`);
	});
});
