import { io } from "socket.io-client";

const host = io("http://localhost:5000");
const guest = io("http://localhost:5000");

let roomCode = "";
let testNumber = 0;

host.on("connect", () => {
  console.log("🟢 Host connected");

  host.emit("create_room", "Rohan");
});

host.on("room_created", (data) => {
  roomCode = data.code;

  console.log("");
  console.log("🏠 Test room created:", roomCode);

  console.log("");
  console.log("🧪 Test 1: Empty username");

  guest.emit("join_room", {
    code: roomCode,
    username: "",
  });
});

guest.on("connect", () => {
  console.log("🔵 Guest connected");
});

guest.on("join_room_error", (data) => {
  testNumber++;

  console.log("❌ Validation error:", data);

  if (testNumber === 1) {
    console.log("");
    console.log("🧪 Test 2: Spaces only");

    guest.emit("join_room", {
      code: roomCode,
      username: "     ",
    });
  } else if (testNumber === 2) {
    console.log("");
    console.log("🧪 Test 3: Username longer than 20 characters");

    guest.emit("join_room", {
      code: roomCode,
      username: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    });
  } else if (testNumber === 3) {
    console.log("");
    console.log("🧪 Test 4: Empty room code");

    guest.emit("join_room", {
      code: "",
      username: "Rahul",
    });
  } else if (testNumber === 4) {
    console.log("");
    console.log("🧪 Test 5: Invalid room code");

    guest.emit("join_room", {
      code: "XXXXXX",
      username: "Rahul",
    });
  } else if (testNumber === 5) {
    console.log("");
    console.log("🧪 Test 6: Username with spaces");

    guest.emit("join_room", {
      code: `  ${roomCode}  `,
      username: "  Rahul  ",
    });
  }
});

guest.on("room_joined", (data) => {
  console.log("");
  console.log("✅ Guest joined successfully");
  console.log(data);

  console.log("");
  console.log("🎉 JOIN ROOM VALIDATION TEST PASSED");

  host.disconnect();
  guest.disconnect();
});