// ======================
// NAVIGATION
// ======================
function openGame(page) {
    window.location.href = page;
}

function goHome() {
    window.location.href = "index.html";
}

// ======================
// RUN ONLY ON CRYSTAL PAGE
// ======================
if (window.location.pathname.includes("CrystalCollector.html")) {

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    }

    addEventListener("resize", resize);
    resize();

    // PLAYER
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 22,
        speed: 4
    };

    const keys = {};
    const crystals = [];

    let score = 0;
    let timeLeft = 60;
    let gameOver = false;

    addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

    function spawnCrystal() {
        crystals.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            size: 12 + Math.random() * 10
        });
    }

    for (let i = 0; i < 15; i++) spawnCrystal();

    setInterval(() => {
        if (!gameOver) {
            timeLeft--;
            document.getElementById("time").textContent = timeLeft;
            if (timeLeft <= 0) gameOver = true;
        }
    }, 1000);

    function update() {
        if (gameOver) return;

        if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
        if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
        if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
        if (keys["d"] || keys["arrowright"]) player.x += player.speed;

        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

        for (let i = crystals.length - 1; i >= 0; i--) {
            const c = crystals[i];

            const dist = Math.hypot(player.x - c.x, player.y - c.y);

            if (dist < player.radius + c.size) {
                crystals.splice(i, 1);
                score += 10;
                document.getElementById("score").textContent = score;
                spawnCrystal();
            }
        }
    }

    function drawCrystal(c) {
        ctx.save();
        ctx.translate(c.x, c.y);

        ctx.beginPath();

        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const radius = i % 2 === 0 ? c.size : c.size / 2;

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = "cyan";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "cyan";
        ctx.fill();

        ctx.restore();
    }

    function render() {
        ctx.fillStyle = "#08111f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = "white";
            ctx.fillRect((i * 97) % canvas.width, (i * 53) % canvas.height, 2, 2);
        }

        crystals.forEach(drawCrystal);

        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
        ctx.fill();

        if (gameOver) {
            ctx.fillStyle = "white";
            ctx.textAlign = "center";

            ctx.font = "60px Arial";
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);

            ctx.font = "40px Arial";
            ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 + 30);
        }
    }

    function loop() {
        update();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}

// ======================
// NAVIGATION
// ======================
function openGame(page) {
    window.location.href = page;
}

function goHome() {
    window.location.href = "index.html";
}

// ======================
// MAZE GAME ONLY
// ======================
if (window.location.pathname.includes("MazeGame.html")) {

    const game = document.getElementById("game");
    const ctx = game.getContext("2d");

    const editor = document.getElementById("editor");
    const ectx = editor.getContext("2d");

    function resize() {
        game.width = innerWidth;
        game.height = innerHeight;
    }

    addEventListener("resize", resize);
    resize();

    // ======================
    // MAP SYSTEM
    // ======================
    let SIZE = 64;
    let map = [];

    function build(size) {

        SIZE = size;
        map = [];

        for (let y = 0; y < SIZE; y++) {
            map[y] = [];

            for (let x = 0; x < SIZE; x++) {

                if (
                    x === 0 || y === 0 ||
                    x === SIZE - 1 || y === SIZE - 1
                ) {
                    map[y][x] = 1;
                } else {
                    map[y][x] = Math.random() < 0.25 ? 1 : 0;
                }
            }
        }

        // spawn safe area
        map[1][1] = map[1][2] = map[2][1] = map[2][2] = 0;

        player.x = 2.5;
        player.y = 2.5;

        drawEditor();
    }

    window.newMap = function () {
        build(
            Math.max(8, Math.min(128,
                +document.getElementById("size").value || 64
            ))
        );
    };

    // ======================
    // EDITOR
    // ======================
    function drawEditor() {

        let cell = editor.width / SIZE;

        ectx.fillStyle = "black";
        ectx.fillRect(0, 0, editor.width, editor.height);

        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {

                ectx.fillStyle = map[y][x] ? "white" : "black";

                ectx.fillRect(
                    x * cell,
                    y * cell,
                    cell,
                    cell
                );

                ectx.strokeStyle = "#333";
                ectx.strokeRect(
                    x * cell,
                    y * cell,
                    cell,
                    cell
                );
            }
        }
    }

    let painting = false;
    let drawMode = 1;

    function paintCell(e) {

        let rect = editor.getBoundingClientRect();
        let cell = editor.width / SIZE;

        let x = Math.floor((e.clientX - rect.left) / cell);
        let y = Math.floor((e.clientY - rect.top) / cell);

        if (
            x < 1 || y < 1 ||
            x >= SIZE - 1 || y >= SIZE - 1
        ) return;

        map[y][x] = drawMode;
        drawEditor();
    }

    editor.onmousedown = e => {
        painting = true;

        let rect = editor.getBoundingClientRect();
        let cell = editor.width / SIZE;

        let x = Math.floor((e.clientX - rect.left) / cell);
        let y = Math.floor((e.clientY - rect.top) / cell);

        drawMode = map[y][x] ? 0 : 1;

        paintCell(e);
    };

    editor.onmousemove = e => {
        if (painting) paintCell(e);
    };

    addEventListener("mouseup", () => painting = false);

    // ======================
    // PLAYER
    // ======================
    const player = {
        x: 2.5,
        y: 2.5,
        a: 0
    };

    const keys = {};
    let flashlight = true;

    addEventListener("keydown", e => {

        keys[e.key.toLowerCase()] = true;

        if (e.code === "Space") {
            flashlight = !flashlight;

            document.getElementById("flashText").textContent =
                "Flashlight: " + (flashlight ? "ON" : "OFF");
        }
    });

    addEventListener("keyup", e => {
        keys[e.key.toLowerCase()] = false;
    });

    function wall(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);

        return (
            x < 0 || y < 0 ||
            x >= SIZE || y >= SIZE ||
            map[y][x]
        );
    }

    function update() {

        const speed = 0.03;
        const turn = 0.04;

        if (keys["arrowleft"]) player.a -= turn;
        if (keys["arrowright"]) player.a += turn;

        let dx = 0, dy = 0;

        if (keys["w"]) {
            dx += Math.cos(player.a) * speed;
            dy += Math.sin(player.a) * speed;
        }

        if (keys["s"]) {
            dx -= Math.cos(player.a) * speed;
            dy -= Math.sin(player.a) * speed;
        }

        if (keys["a"]) {
            dx += Math.cos(player.a - Math.PI / 2) * speed;
            dy += Math.sin(player.a - Math.PI / 2) * speed;
        }

        if (keys["d"]) {
            dx += Math.cos(player.a + Math.PI / 2) * speed;
            dy += Math.sin(player.a + Math.PI / 2) * speed;
        }

        if (!wall(player.x + dx, player.y)) player.x += dx;
        if (!wall(player.x, player.y + dy)) player.y += dy;
    }

    // ======================
    // RENDER
    // ======================
    function render() {

        ctx.fillStyle = "#4aa3ff";
        ctx.fillRect(0, 0, game.width, game.height / 2);

        ctx.fillStyle = "#333";
        ctx.fillRect(0, game.height / 2, game.width, game.height / 2);

        const FOV = Math.PI / 3;

        for (let x = 0; x < game.width; x++) {

            let rayAngle =
                player.a - FOV / 2 +
                (x / game.width) * FOV;

            let distance = 0;

            while (distance < 80) {
                distance += 0.02;

                let rx = player.x + Math.cos(rayAngle) * distance;
                let ry = player.y + Math.sin(rayAngle) * distance;

                if (wall(rx, ry)) break;
            }

            distance *= Math.cos(rayAngle - player.a);

            let height = Math.min(game.height, game.height / (distance + 0.001));

            let brightness;

            if (flashlight) {

                let centerDist = Math.abs(x - game.width / 2);
                let beam = Math.max(0, 1 - centerDist / (game.width * 0.22));

                brightness = Math.max(0, (255 - distance * 12) * beam);

            } else {
                brightness = 4;
            }

            ctx.fillStyle = `rgb(${brightness},${brightness * 0.8},${brightness * 0.6})`;

            ctx.fillRect(
                x,
                (game.height - height) / 2,
                1,
                height
            );
        }
    }

    function loop() {
        update();
        render();
        requestAnimationFrame(loop);
    }

    build(64);
    loop();
}


// ======================
// METEOR GAME
// ======================
if (window.location.pathname.includes("Meteor.html")) {

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    const hud = document.getElementById("hud");
    const restartBtn = document.getElementById("restartBtn");
    const restartIcon = document.getElementById("restartIcon");

    function resize() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    }

    addEventListener("resize", resize);
    resize();

    function urlToBase64(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = function () {
                const c = document.createElement("canvas");
                c.width = img.width;
                c.height = img.height;

                const cx = c.getContext("2d");
                cx.drawImage(img, 0, 0);

                resolve(c.toDataURL("image/png"));
            };

            img.onerror = reject;
            img.src = url;
        });
    }

    const SOURCES = {
        restart: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Arrow_refresh_icon.svg"
    };

    let player, asteroids, score, gameOver;
    const keys = {};

    let restartImg = new Image();

    function initGame() {

        player = {
            x: canvas.width / 2,
            y: canvas.height - 80,
            size: 22,
            speed: 7
        };

        asteroids = [];
        score = 0;
        gameOver = false;

        restartBtn.style.display = "none";
    }

    initGame();

    addEventListener("keydown", e => {
        keys[e.key.toLowerCase()] = true;
    });

    addEventListener("keyup", e => {
        keys[e.key.toLowerCase()] = false;
    });

    function spawnAsteroid() {
        asteroids.push({
            x: Math.random() * canvas.width,
            y: -40,
            r: 15 + Math.random() * 30,
            speed: 2 + Math.random() * 5
        });
    }

    setInterval(() => {
        if (!gameOver) spawnAsteroid();
    }, 600);

    restartBtn.onclick = initGame;

    function update() {

        if (gameOver) {
            restartBtn.style.display = "flex";
            return;
        }

        if (keys["a"] || keys["arrowleft"])
            player.x -= player.speed;

        if (keys["d"] || keys["arrowright"])
            player.x += player.speed;

        player.x = Math.max(
            player.size,
            Math.min(canvas.width - player.size, player.x)
        );

        for (let i = asteroids.length - 1; i >= 0; i--) {

            let a = asteroids[i];
            a.y += a.speed;

            if (a.y > canvas.height + 50) {
                asteroids.splice(i, 1);
                score++;
            }

            let dist = Math.hypot(
                player.x - a.x,
                player.y - a.y
            );

            if (dist < player.size + a.r) {
                gameOver = true;
            }
        }

        hud.textContent = "Score: " + score;
    }

    function draw() {

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const a of asteroids) {

            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = "gray";
            ctx.fill();
        }

        ctx.fillStyle = "cyan";

        ctx.beginPath();
        ctx.moveTo(player.x, player.y - player.size);
        ctx.lineTo(player.x - player.size, player.y + player.size);
        ctx.lineTo(player.x + player.size, player.y + player.size);
        ctx.closePath();
        ctx.fill();

        if (gameOver) {

            ctx.fillStyle = "white";
            ctx.font = "60px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                "Game Over",
                canvas.width / 2,
                canvas.height / 2
            );
        }
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    async function start() {

        hud.textContent = "Loading assets...";

        try {

            const base64 =
                await urlToBase64(SOURCES.restart);

            restartImg.src = base64;
            restartIcon.src = base64;

            hud.textContent = "Score: 0";

            loop();

        } catch (e) {

            console.error(e);
            hud.textContent = "Failed to load assets";
        }
    }

    start();
}
