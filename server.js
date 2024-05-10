const { createServer } = require("node:http");
const PORT = 3000;
let db = [];

const generateId = () => {
  return db.length > 0 ? db[db.length - 1].id + 1 : 1;
};

const parsedJoke = (req, cb) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    cb(JSON.parse(body));
  });
};

const requestHandler = (req, res) => {
  const { method, url } = req;
  if (method === "GET" && url === "/") {
    res.writeHead(200);
    res.end(JSON.stringify(db));
  } else if (method === "POST" && url === "/") {
    parsedJoke(req, (joke) => {
      joke.id = generateId();
      db.push(joke);
      res.writeHead(201); // Changed to 201 Created
      res.end(JSON.stringify(db));
    });
  } else if (method === "PATCH" && url.split("/")[1] === "joke") {
    const id = +url.split("/")[2];
    const jokeIndex = db.findIndex((_joke) => _joke.id === id);
    if (jokeIndex !== -1) {
      parsedJoke(req, (updatedJoke) => {
        db = db.map((_joke) =>
          _joke.id === id ? { ..._joke, ...updatedJoke } : _joke
        );
        res.writeHead(200); // Changed to 200 OK
        res.end(JSON.stringify(db[jokeIndex]));
      });
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: true, message: "Resource not found" }));
    }
  } else if (method === "DELETE" && url.split("/")[1] === "joke") {
    const id = +url.split("/")[2];
    const jokeIndex = db.findIndex((_joke) => _joke.id === id);
    if (jokeIndex !== -1) {
      const deletedJoke = db.splice(jokeIndex, 1)[0]; // Extract the deleted joke
      res.writeHead(200); // Changed to 200 OK
      res.end(JSON.stringify(deletedJoke)); // Respond with the deleted joke
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: true, message: "Resource not found" }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: true, message: "Resource not found" }));
  }
};

const server = createServer(requestHandler);

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
