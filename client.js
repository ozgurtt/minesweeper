(function() {
	var canvas, context;
	var socket;
	var opponent;
	var map;
	var turn;

	function main() {
		setupCanvas();
		setupSocket();
	}

	function setupCanvas() {
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");

		canvas.addEventListener("mousedown", ev_mousedown, false);
	}

	function setupSocket() {
		renderMessage("Connecting to game server...");

		socket = io.connect("http://localhost:5050", { "connect timeout": 5 });

		socket.on("connect_failed", function (data) {
			renderMessage("Connection failed.");
		});

		socket.on("connect", function (data) {
			renderMessage("Waiting for opponents...");
		});

		socket.on("opponent", function (data) {
			opponent = data;
			turn = false;
			setupMap();
			renderGame();
		});

		socket.on("turn", function (data) {
			turn = true;
			renderGame();
		});

		socket.on("wait", function (data) {
			turn = false;
			renderGame();
		});
	}

	function setupMap() {
		map = [];
		for(var i = 0; i < 16; i++) {
			map.push([]);
			for(var j = 0; j < 16; j++) {
				map[i].push(-1);
			}
		}
	}

	function renderGame() {
		clearScreen();
		renderText("Your opponent is " + opponent, canvas.width/2, canvas.height - 24);
		renderText(turn ? "It's your turn" : "Please wait...", canvas.width/2, canvas.height - 12);
		for(var i = 0; i < 16; i++) {
			for(var j = 0; j < 16; j++) {
				if(map[i][j] == -1) context.fillStyle = "#aaa";
				else context.fillStyle = "#000";
				context.fillRect(24*i, 24*j, 24, 24);
				context.strokeStyle = "#000";
				context.strokeRect(24*i, 24*j, 24, 24);
			}
		}
	}

	function clearScreen() {
		context.fillStyle = "#000";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "#fff";
	}

	function renderText(msg, x, y) {
		context.font = "bold 12px sans-serif";
		context.textAlign = "center";
		context.fillText(msg, x, y);
	}

	function renderMessage(msg) {
		clearScreen();
		renderText(msg, canvas.width/2, canvas.height/2);
	}

	function ev_mousedown(ev) {
		var x, y;

		if(!turn) return;

		if(ev.offsetX) {
			x = ev.offsetX;
			y = ev.offsetY;
		} else {
			x = ev.layerX;
			y = ev.layerY;
		}

		x = Math.floor(x/24);
		y = Math.floor(y/24);

		if(x >= 0 && x < 16 && y >= 0 && y < 16) {
			if(map[x][y] >= 0) return;
			map[x][y] = 0;
			turn = false;
			socket.emit("shoot", { x : x, y : y });
		}

		renderGame();
	}

	main();
})();
