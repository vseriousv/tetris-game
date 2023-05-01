const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scale = 25;
let score = 0;
let gamePaused = false;

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = player.piece.color;
        ctx.fillRect(
          (x + offset.x) * scale,
          (y + offset.y) * scale,
          scale,
          scale
        );

        // Draw a border around the square
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          (x + offset.x) * scale,
          (y + offset.y) * scale,
          scale,
          scale
        );
      }
    });
  });

  // Draw the playing field
  playingField.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = "white";
        ctx.fillRect(x * scale, y * scale, scale, scale);

        // Draw a border around the square
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.strokeRect(x * scale, y * scale, scale, scale);
      }
    });
  });

  document.getElementById('score').textContent = score;
}

const shapes = [
  {
    name: 'T',
    rotations: [
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 0],
      ],
    ],
    color: "#FF0",
  },
  {
    name: 'J',
    rotations: [
      [
        [2, 0, 0],
        [2, 2, 2],
      ],
      [
        [2, 2],
        [2, 0],
        [2, 0],
      ],
      [
        [2, 2, 2],
        [0, 0, 2],
      ],
      [
        [0, 2],
        [0, 2],
        [2, 2],
      ],
    ],
    color: "#FA9",
  },
  {
    name: 'L',
    rotations: [
      [
        [0, 0, 3],
        [3, 3, 3],
      ],
      [
        [3, 0],
        [3, 0],
        [3, 3],
      ],
      [
        [3, 3, 3],
        [3, 0, 0],
      ],
      [
        [3, 3],
        [0, 3],
        [0, 3],
      ],
    ],
    color: "#AF0",
  },
  {
    name: 'O',
    rotations: [
      [
        [4, 4],
        [4, 4],
      ],
    ],
    color: "#CC9",
  },
  {
    name: 'S',
    rotations: [
      [
        [0, 5, 5],
        [5, 5, 0],
      ],
      [
        [5, 0],
        [5, 5],
        [0, 5],
      ],
    ],
    color: "#2FF",
  },
  {
    name: 'Z',
    rotations: [
      [
        [6, 6, 0],
        [0, 6, 6],
      ],
      [
        [0, 6],
        [6, 6],
        [6, 0],
      ],
    ],
    color: "#2AC",
  },
  {
    name: 'I',
    rotations: [
      [
        [0, 0, 0, 0],
        [7, 7, 7, 7],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 7],
        [0, 7],
        [0, 7],
        [0, 7],
      ],
    ],
    color: "#9C9",
  },
];


function createShape(type) {
  const piece = shapes.find((p) => p.name === type);

  return {
    matrix: piece.rotations[0],
    rotations: piece.rotations,
    color: piece.color,
    currentRotation: 0,
  };
}

function getRandomShape() {
  const names = shapes.map((p) => p.name);
  const randomIndex = Math.floor(Math.random() * names.length);
  return createShape(names[randomIndex]);
}

const player = {
  position: { x: 0, y: 0 },
  piece: getRandomShape(),
};

player.position.y = 0;
player.position.x = Math.floor(canvas.width / scale / 2) - 1;

const playingField = Array.from({ length: Math.floor(canvas.height / scale) }, () =>
  Array(canvas.width / scale).fill(0)
);

function collide(matrix, position) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < matrix[y].length; ++x) {
      if (
        matrix[y][x] !== 0 &&
        (position.y + y >= canvas.height / scale || position.x + x < 0 || position.x + x >= canvas.width / scale || playingField[position.y + y][position.x + x] !== 0)
      ) {
        return true;
      }
    }
  }
  return false;
}

function movePiece(direction) {
  player.position.x += direction;

  if (collide(player.piece.matrix, player.position)) {
    player.position.x -= direction;
  }
}

function lockPiece() {
  player.piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        playingField[player.position.y + y][player.position.x + x] = "white";
      }
    });
  });
}

function clearLines() {
  let linesCleared = 0;

  outer: for (let y = playingField.length - 1; y >= 0; --y) {
    for (let x = 0; x < playingField[y].length; ++x) {
      if (playingField[y][x] === 0) {
        continue outer;
      }
    }

    // Remove the full line
    const row = playingField.splice(y, 1)[0].fill(0);
    // Add a new empty line at the top
    playingField.unshift(row);
    // Check the same row again as it has shifted down
    y++;

    linesCleared++;
  }

  // Update score based on the number of lines cleared
  if (linesCleared > 0) {
    score += 10 * Math.pow(2, linesCleared - 1);
  }
}


function dropPiece() {
  player.position.y++;

  if (collide(player.piece.matrix, player.position)) {
    player.position.y--;
    lockPiece(); // Lock the piece
    clearLines(); // Clear full lines
    player.piece = getRandomShape(); // Create a new piece
    player.position.y = 0;
    player.position.x = Math.floor(canvas.width / scale / 2) - 1;
  }
}

function rotatePiece() {
  const currentRotation = player.piece.currentRotation;
  player.piece.currentRotation = (currentRotation + 1) % player.piece.rotations.length;
  player.piece.matrix = player.piece.rotations[player.piece.currentRotation];

  if (collide(player.piece.matrix, player.position)) {
    player.piece.currentRotation = currentRotation;
    player.piece.matrix = player.piece.rotations[currentRotation];
  }
}

function togglePause() {
  gamePaused = !gamePaused;
}

function resetGame() {
  // Clear the playing field
  for (let y = 0; y < playingField.length; ++y) {
    for (let x = 0; x < playingField[y].length; ++x) {
      playingField[y][x] = 0;
    }
  }

  // Reset the score
  score = 0;

  // Get a new piece and set its position
  player.piece = getRandomShape();
  player.position.y = 0;
  player.position.x = Math.floor(canvas.width / scale / 2) - 1;
}



let dropCounter = 0;
let dropInterval = 250; // Time in milliseconds between piece drops
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  if (!gamePaused) {
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      dropPiece();
      dropCounter = 0;
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMatrix(player.piece.matrix, player.position);
  if (!gamePaused) {
    requestAnimationFrame(update);
  }
}

update(performance.now());

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    movePiece(-1);
  } else if (event.key === 'ArrowRight') {
    movePiece(1);
  } else if (event.key === 'ArrowDown') {
    dropPiece();
  } else if (event.key === 'ArrowUp') {
    rotatePiece();
  } else if (event.key === "p" || event.key === "P") {
    togglePause();
    if (!gamePaused) {
      update();
    }
  }
});

document.getElementById("start-game").addEventListener("click", () => {
  // Restart the game
  resetGame();
  if (gamePaused) {
    togglePause();
  }
});

document.getElementById("pause-game").addEventListener("click", () => {
  // Pause or resume the game
  togglePause();
  if (!gamePaused) {
    update();
  }
});

document.getElementById("show-rules").addEventListener("click", () => {
  // Display game rules
  alert("Tetris Rules:\n\n1. Move the pieces left, right, or down using the arrow keys.\n2. Rotate the pieces using the up arrow key.\n3. Clear lines by filling them with blocks.\n4. The game ends when there's no space for a new piece.");
});

document.getElementById("move-left").addEventListener("click", () => {
  movePiece(-1);
});

document.getElementById("move-right").addEventListener("click", () => {
  movePiece(1);
});

document.getElementById("rotate-up").addEventListener("click", () => {
  rotatePiece();
});

document.getElementById("move-down").addEventListener("click", () => {
  // Move the piece down
  dropPiece();
});



