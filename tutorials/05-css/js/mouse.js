document.addEventListener("click", function (event) {
  const ripple = document.createElement("span");
  ripple.className = "mouse-ripple";
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;

  for (let i = 0; i < 3; i += 1) {
    const ring = document.createElement("span");
    ring.className = "mouse-ripple__ring";
    ring.style.setProperty("--ring-delay", `${i * 90}ms`);
    ripple.appendChild(ring);
  }

  document.body.appendChild(ripple);
  ripple.addEventListener("animationend", function () {
    ripple.remove();
  });
});
