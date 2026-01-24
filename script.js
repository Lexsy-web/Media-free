let balance = Number(localStorage.getItem("coins")) || 0;
const prizes = [100, 200, 50, 500, 1000, 5000];

function updateBalance() {
  const el = document.getElementById("balance");
  if (el) el.innerText = balance;
}
updateBalance();

function deposit() {
  const amount = Number(document.getElementById("amount").value);
  if (amount > 0) {
    balance += amount;
    localStorage.setItem("coins", balance);
    alert("Deposit successful!");
  }
}

function withdraw() {
  const amount = Number(document.getElementById("amount").value);
  if (amount > 0 && amount <= balance) {
    balance -= amount;
    localStorage.setItem("coins", balance);
    alert("Withdraw successful!");
  } else {
    alert("Not enough coins");
  }
}

function spin() {
  if (balance < 100) {
    alert("Not enough coins to spin!");
    return;
  }

  balance -= 100;

  const index = Math.floor(Math.random() * prizes.length);
  const win = prizes[index];

  const wheel = document.getElementById("wheel");
  const rotateDeg = 360 * 6 + (index * 60);

  wheel.style.transform = `rotate(${rotateDeg}deg)`;

  setTimeout(() => {
    balance += win;
    localStorage.setItem("coins", balance);
    document.getElementById("result").innerText =
      `🎉 You won ${win} coins!`;
    updateBalance();
  }, 4000);
}
