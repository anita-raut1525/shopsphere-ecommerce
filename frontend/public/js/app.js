let cartCount = 0;

const cartCounter = document.querySelector(".cart-btn span");
const cartButtons = document.querySelectorAll(".add-cart");

cartButtons.forEach((button) => {
    button.addEventListener("click", () => {
        cartCount++;

        cartCounter.textContent = cartCount;

        const originalText = button.textContent;

        button.textContent = "✓ Added";

        setTimeout(() => {
            button.textContent = originalText;
        }, 1200);
    });
});
