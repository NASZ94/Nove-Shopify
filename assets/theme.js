/* ==================================================
   NOVE SHOPIFY THEME
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    function formatMoney(cents) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(cents / 100);
    }

    
    /* ==========================================
       MOBILE MENU
    ========================================== */

    const menu = document.getElementById("mobile-menu");
    const openButton = document.getElementById("menu-toggle");
    const closeButton = document.getElementById("close-menu");

    if (menu && openButton) {
        openButton.addEventListener("click", () => {
            menu.classList.add("open");
        });
    }

    if (menu && closeButton) {
        closeButton.addEventListener("click", () => {
            menu.classList.remove("open");
        });
    }

    document.addEventListener("click", (event) => {

        if (!menu || !menu.classList.contains("open")) return;

        if (
            !menu.contains(event.target) &&
            !openButton.contains(event.target)
        ) {
            menu.classList.remove("open");
        }

    });

    /* ==========================================
       PRODUCT GALLERY
    ========================================== */

    const mainImage = document.getElementById("ProductMainImage");
    const thumbnails = document.querySelectorAll(".thumbnail-button");

    thumbnails.forEach((thumb) => {

        thumb.addEventListener("click", () => {

            if (!mainImage) return;

            mainImage.src = thumb.dataset.image;
            mainImage.removeAttribute("srcset");

            thumbnails.forEach(item => {
                item.classList.remove("active");
            });

            thumb.classList.add("active");

        });

    });

    /* ==========================================
       QUANTITY SELECTOR
    ========================================== */

    const quantityInput = document.getElementById("Quantity");
    const minusButton = document.querySelector(".qty-minus");
    const plusButton = document.querySelector(".qty-plus");

    if (quantityInput && minusButton && plusButton) {

        minusButton.addEventListener("click", () => {

            quantityInput.value =
                Math.max(
                    1,
                    Number(quantityInput.value) - 1
                );

        });

        plusButton.addEventListener("click", () => {

            quantityInput.value =
                Number(quantityInput.value) + 1;

        });

    }

   /* ==========================================
   PRODUCT VARIANTS
========================================== */

const variantJSON = document.getElementById("ProductVariants");

if (variantJSON) {

    const variants = JSON.parse(variantJSON.textContent);

    const hiddenVariant =
        document.getElementById("SelectedVariant");

    const price =
        document.getElementById("ProductPrice");

    const comparePrice =
        document.getElementById("ComparePrice");

    const stock =
        document.getElementById("StockStatus");

    const button =
        document.getElementById("AddToCartButton");

    document.querySelectorAll(
        '.variant-buttons input[type="radio"]'
    ).forEach((radio) => {

        radio.addEventListener("change", () => {

            const variant = variants.find(
                v => v.id == radio.value
            );

            if (!variant) return;

            /* Selected Variant */

            hiddenVariant.value = variant.id;

            /* Update URL */

            const url = new URL(window.location);

            url.searchParams.set("variant", variant.id);

            window.history.replaceState({}, "", url);

            /* Price */

            if (price) {

                price.innerHTML = Shopify.formatMoney(
                    variant.price,
                    window.Shopify.money_format
                );

            }

            /* Compare At Price */

            if (comparePrice) {

                if (
                    variant.compare_at_price &&
                    variant.compare_at_price > variant.price
                ) {

                    comparePrice.style.display = "";

                    comparePrice.innerHTML = Shopify.formatMoney(
                        variant.compare_at_price,
                        window.Shopify.money_format
                    );

                } else {

                    comparePrice.style.display = "none";

                }

            }

            /* Stock */

            if (stock) {

                if (variant.available) {

                    stock.classList.remove("out");
                    stock.textContent = "✓ In Stock";

                } else {

                    stock.classList.add("out");
                    stock.textContent = "Sold Out";

                }

            }

            /* Add To Cart Button */

            if (button) {

                button.disabled = !variant.available;

                button.textContent = variant.available
                    ? "Add to Cart"
                    : "Sold Out";

            }

            /* Featured Image */

            if (
                mainImage &&
                variant.featured_image
            ) {

                mainImage.src =
                    variant.featured_image.src;

                mainImage.alt =
                    variant.featured_image.alt ||
                    variant.title ||
                    "";

                mainImage.removeAttribute("srcset");

            }

        });

    });

}
    /* ==========================================
       CART DRAWER
    ========================================== */

    const drawer =
        document.getElementById("CartDrawer");

    const overlay =
        document.querySelector(".cart-drawer-overlay");

    const closeDrawer =
        document.getElementById("CloseCart");

    function openCartDrawer() {

        if (drawer)
            drawer.classList.add("open");

    }

    function closeCartDrawer() {

        if (drawer)
            drawer.classList.remove("open");

    }

    if (overlay)
        overlay.addEventListener(
            "click",
            closeCartDrawer
        );

    if (closeDrawer)
        closeDrawer.addEventListener(
            "click",
            closeCartDrawer
        );

    /* ==========================================
       AJAX CART
    ========================================== */

    async function getCart() {

    try {

        const response = await fetch("/cart.js");

        if (!response.ok) {
            throw new Error("Failed to load cart.");
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return {
            items: [],
            item_count: 0,
            total_price: 0
        };

    }

}

    async function renderCart() {

        const cart = await getCart();

        const container =
            document.getElementById("CartDrawerItems");

        const subtotal =
            document.getElementById("CartSubtotal");

        if (!container || !subtotal) return;

        subtotal.innerHTML =
            Shopify.formatMoney(
                cart.total_price,
                window.Shopify.money_format
            );

        if (cart.item_count === 0) {

            container.innerHTML =
                "<p class='cart-empty'>Your cart is empty.</p>";

            return;

        }

        container.innerHTML = "";

        cart.items.forEach(item => {

            container.insertAdjacentHTML(
                "beforeend",
                `
                <div class="cart-item">

                    <img
                        src="${item.image}"
                        alt="${item.product_title}">

                    <div class="cart-item-info">

                        <h4>${item.product_title}</h4>

                        <p>${Shopify.formatMoney(item.final_price, window.Shopify.money_format)}</p>

                        <div class="cart-qty">

                            <button
                                class="cart-minus"
                                data-key="${item.key}">−</button>

                            <span>${item.quantity}</span>

                            <button
                                class="cart-plus"
                                data-key="${item.key}">+</button>

                        </div>

                        <button
                            class="remove-item"
                            data-key="${item.key}">

                            Remove

                        </button>

                    </div>

                </div>
                `
            );

        });

    }

    /* ==========================================
       ADD TO CART
    ========================================== */

    document
        .querySelectorAll('form[action*="/cart/add"]')
        .forEach((form) => {

            form.addEventListener(
                "submit",
                async (event) => {

                    event.preventDefault();

                    const data = new FormData(form);

                    try {

                        const response = await fetch("/cart/add.js", {

                            method: "POST",

                            body: data

                         });

                        if (!response.ok) {
                             throw new Error("Unable to add item.");
                        }

                        await renderCart();

                        openCartDrawer();

                    } catch (error) {

                        console.error(error);

                    }

                }
            );

        });

/* ==========================================
   UPDATE CART
========================================== */

document.addEventListener("click", async (event) => {

    const plus = event.target.closest(".cart-plus");
    const minus = event.target.closest(".cart-minus");
    const remove = event.target.closest(".remove-item");

    if (!plus && !minus && !remove) return;

    const cart = await getCart();

    const key =
        plus?.dataset.key ||
        minus?.dataset.key ||
        remove?.dataset.key;

    const item = cart.items.find(i => i.key === key);

    if (!item) return;

    let quantity = item.quantity;

    if (plus) {

        quantity++;

    }

    if (minus) {

        quantity = Math.max(0, quantity - 1);

    }

    if (remove) {

        quantity = 0;

    }

    try {

        const response = await fetch("/cart/change.js", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                id: key,
                quantity
            })

        });

        if (!response.ok) {
            throw new Error("Unable to update cart.");
        }

        await renderCart();

    } catch (error) {

        console.error(error);

    }

});
/* ==========================================
   COLLECTION PAGE
========================================== */

const sortForm = document.getElementById("CollectionSortForm");

if (sortForm) {

    const sortSelect = sortForm.querySelector("select");

    if (sortSelect) {

        sortSelect.addEventListener("change", () => {

            const url = new URL(window.location);

            url.searchParams.set(
                "sort_by",
                sortSelect.value
            );

            window.location = url;

        });

    }

}

const filterForm = document.getElementById("FacetFiltersForm");

if (filterForm) {

    filterForm.addEventListener("change", () => {

        filterForm.submit();

    });

}

/* ==========================================
   MOBILE FILTER TOGGLE
========================================== */

const filterToggle = document.getElementById("FilterToggle");
const collectionSidebar = document.getElementById("CollectionSidebar");

if (filterToggle && collectionSidebar) {

    filterToggle.addEventListener("click", () => {

        collectionSidebar.classList.toggle("open");

        filterToggle.setAttribute(
            "aria-expanded",
            collectionSidebar.classList.contains("open")
        );

    });

}
/* ==========================================
   QUICK VIEW MODAL
========================================== */

const quickViewModal = document.getElementById("QuickViewModal");
const quickViewBody = document.getElementById("QuickViewBody");
const quickViewClose = document.getElementById("QuickViewClose");
const quickViewOverlay = document.getElementById("QuickViewOverlay");

function openQuickView() {

    if (!quickViewModal) return;

    quickViewModal.hidden = false;

    document.body.classList.add("quick-view-open");

}

function closeQuickView() {

    if (!quickViewModal) return;

    quickViewModal.hidden = true;

    document.body.classList.remove("quick-view-open");

}

if (quickViewClose) {

    quickViewClose.addEventListener("click", closeQuickView);

}

if (quickViewOverlay) {

    quickViewOverlay.addEventListener("click", closeQuickView);

}

document.addEventListener("click", async (event) => {

    const button = event.target.closest(".quick-view-button");

    if (!button) return;

    const handle = button.dataset.productHandle;

    if (!handle) return;

    openQuickView();

    quickViewBody.innerHTML = `
        <div class="quick-view-loading">
            Loading...
        </div>
    `;

    try {

        const response = await fetch(`/products/${handle}.js`);

        if (!response.ok) {
            throw new Error("Unable to load product.");
        }

        const product = await response.json();

        let currentVariant = product.variants[0];

        const image = product.images.length
            ? product.images[0]
            : "";

        quickViewBody.innerHTML = `
            <div class="quick-view-product">

                <div class="quick-view-image">

                    ${
                        image
                            ? `<img id="QuickViewImage" src="${image}" alt="${product.title}">`
                            : ""
                    }

                </div>

                <div class="quick-view-info">

                    <h2>${product.title}</h2>

                    <p>${product.vendor}</p>

                    <p
                        class="quick-view-price"
                        id="QuickViewPrice"
                    >

                        ${Shopify.formatMoney(
                            currentVariant.price,
                            window.Shopify.money_format
                        )}

                    </p>

                    ${
                        product.variants.length > 1
                            ? `
                                <label for="QuickViewVariant">
                                    Variant
                                </label>

                                <select id="QuickViewVariant">

                                    ${product.variants.map(variant => `
                                        <option
                                            value="${variant.id}"
                                            ${variant.id === currentVariant.id ? "selected" : ""}
                                        >

                                            ${variant.title}

                                        </option>
                                    `).join("")}

                                </select>
                            `
                            : ""
                    }

                    <div class="quantity-selector">

                        <button
                            type="button"
                            id="QuickViewMinus"
                        >

                            −

                        </button>

                        <input
                            id="QuickViewQuantity"
                            type="number"
                            value="1"
                            min="1"
                        >

                        <button
                            type="button"
                            id="QuickViewPlus"
                        >

                            +

                        </button>

                    </div>

                    <div class="product-card-actions">

                        <button
                            class="wishlist-button"
                            data-product-handle="${product.handle}"
                            aria-label="Add to wishlist"
                            aria-pressed="false"
                            type="button">

                            ♡

                        </button>

                        <button
                            id="QuickViewAddToCart"
                             class="button"
                             ${currentVariant.available ? "" : "disabled"}>

                             ${currentVariant.available ? "Add to Cart" : "Sold Out"}

                         </button>

                         <a
                             href="/products/${handle}"
                            class="button button-secondary">

                            View Product

                         </a>

                    </div>

                    <div class="quick-view-trust">

                        <div>🚚 Free Shipping</div>

                        <div>🔒 Secure Checkout</div>

                        <div>↩ 30-Day Returns</div>

                    </div>

                    </div>

            </div>
        `;

        const variantSelect = document.getElementById("QuickViewVariant");
        const quantityInput = document.getElementById("QuickViewQuantity");
        const minusButton = document.getElementById("QuickViewMinus");
        const plusButton = document.getElementById("QuickViewPlus");
        const addButton = document.getElementById("QuickViewAddToCart");
        const priceElement = document.getElementById("QuickViewPrice");

        if (variantSelect) {

            variantSelect.addEventListener("change", () => {

                currentVariant = product.variants.find(
                    variant => variant.id == variantSelect.value
                );

                if (!currentVariant) return;

                priceElement.innerHTML = Shopify.formatMoney(
                    currentVariant.price,
                    window.Shopify.money_format
                );

                addButton.disabled = !currentVariant.available;

                addButton.textContent = currentVariant.available
                    ? "Add to Cart"
                    : "Sold Out";

            });

        }

        if (minusButton && quantityInput) {

            minusButton.addEventListener("click", () => {

                quantityInput.value = Math.max(
                    1,
                    Number(quantityInput.value) - 1
                );

            });

        }

        if (plusButton && quantityInput) {

            plusButton.addEventListener("click", () => {

                quantityInput.value =
                    Number(quantityInput.value) + 1;

            });

        }

        if (addButton) {

            addButton.addEventListener("click", async () => {

                if (!currentVariant.available) return;

                try {

                    const response = await fetch("/cart/add.js", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            id: currentVariant.id,

                            quantity: Number(quantityInput.value)

                        })

                    });

                    if (!response.ok) {
                        throw new Error("Unable to add product.");
                    }

                    await renderCart();

                    closeQuickView();

                    openCartDrawer();

                } catch (error) {

                    console.error(error);

                }

            });

        }

    } catch (error) {

        console.error(error);

       quickViewBody.innerHTML = `
           <p>
                Unable to load product.
          </p>
        
        `;

    }

});
/* ==========================================
   KEYBOARD SHORTCUTS
========================================== */

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    closeCartDrawer();

    closeQuickView();

    if (menu) {
        menu.classList.remove("open");
    }

    if (collectionSidebar) {

        collectionSidebar.classList.remove("open");

        if (filterToggle) {
            filterToggle.setAttribute("aria-expanded", "false");
        }

    }

});
/* ==========================================
   RECENTLY VIEWED PRODUCTS
========================================== */

const recentlyViewedContainer =
    document.getElementById("RecentlyViewedProducts");

const productForm =
    document.querySelector('form[action*="/cart/add"]');

if (recentlyViewedContainer && productForm) {

    const currentHandle =
        window.location.pathname.split("/products/")[1]?.split("?")[0];

    if (currentHandle) {

        let viewed =
            JSON.parse(localStorage.getItem("recentlyViewed")) || [];

        viewed = viewed.filter(handle => handle !== currentHandle);

        viewed.unshift(currentHandle);

        viewed = viewed.slice(0, 8);

        localStorage.setItem(
            "recentlyViewed",
            JSON.stringify(viewed)
        );

        renderRecentlyViewed(viewed);
        

    }

    
}

async function renderRecentlyViewed(handles) {

    if (!recentlyViewedContainer) return;

    const currentHandle =
        window.location.pathname
            .split("/products/")[1]
            ?.split("?")[0];

    const filtered =
        handles.filter(handle => handle !== currentHandle);

    if (!filtered.length) {

        recentlyViewedContainer.innerHTML = `
            <p class="recently-viewed-empty">
                No recently viewed products.
            </p>
        `;

        return;

    }

    recentlyViewedContainer.innerHTML = "";

    for (const handle of filtered) {

        try {

            const response =
                await fetch(`/products/${handle}.js`);

            if (!response.ok) continue;

            const product =
                await response.json();

            const variant =
                product.variants[0];

            recentlyViewedContainer.insertAdjacentHTML(
                "beforeend",
                `
                <article class="product-card">

                    <button
                        class="wishlist-button"
                        data-product-handle="${product.handle}"
                        aria-label="Add to wishlist"
                        aria-pressed="false"
                        type="button">

                        ♡

                    </button>

                    <a
                        href="/products/${product.handle}"
                        class="product-card-image">

                        <div class="product-card-image-wrapper">

                            ${
                                product.images.length
                                    ? `
                                        <img
                                            class="product-image-primary"
                                            src="${product.images[0]}"
                                            alt="${product.title}">
                                      `
                                    : ""
                            }

                            ${
                                product.images.length > 1
                                    ? `
                                        <img
                                            class="product-image-secondary"
                                            src="${product.images[1]}"
                                            alt="${product.title}">
                                      `
                                    : ""
                            }

                        </div>

                    </a>

                    <div class="product-card-content">

                        <p class="product-vendor">

                            ${product.vendor}

                        </p>

                        <h3>

                            <a href="/products/${product.handle}">

                                ${product.title}

                            </a>

                        </h3>

                        <div class="product-price">

                            ${Shopify.formatMoney(
                                variant.price,
                                window.Shopify.money_format
                            )}

                        </div>

                        <div class="product-card-actions">

                            <button
                                class="button quick-view-button"
                                data-product-handle="${product.handle}">

                                Quick View

                            </button>

                            <a
                                href="/products/${product.handle}"
                                class="button button-secondary">

                                View Product

                            </a>

                        </div>

                    </div>

                </article>
                `
            );

        } catch (error) {

            console.error(error);

        }

    }

    updateWishlistButtons();

}
/* ==========================================
   WISHLIST
========================================== */

const wishlistContainer =
    document.getElementById("WishlistProducts");

function getWishlist() {

    return JSON.parse(
        localStorage.getItem("wishlist")
    ) || [];

}

function saveWishlist(list) {

    localStorage.setItem(
        "wishlist",
        JSON.stringify(list)
    );

}

function updateWishlistButtons() {

    const wishlist = getWishlist();

    document
        .querySelectorAll(".wishlist-button")
        .forEach((button) => {

            const handle =
                button.dataset.productHandle;

            const active =
                wishlist.includes(handle);

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                active
            );

            button.innerHTML =
                active
                    ? "♥"
                    : "♡";

        });

}

document.addEventListener("click", async (event) => {

    const button =
        event.target.closest(".wishlist-button");

    if (!button) return;

    const handle =
        button.dataset.productHandle;

    if (!handle) return;

    let wishlist =
        getWishlist();

    if (wishlist.includes(handle)) {

        wishlist =
            wishlist.filter(item => item !== handle);

    } else {

        wishlist.unshift(handle);

    }

    saveWishlist(wishlist);

    updateWishlistButtons();

    renderWishlist();

});

async function renderWishlist() {

    if (!wishlistContainer) return;

    const wishlist =
        getWishlist();

    if (!wishlist.length) {

        wishlistContainer.innerHTML = `
            <p class="wishlist-empty">

                Your wishlist is empty.

            </p>
        `;

        return;

    }

    wishlistContainer.innerHTML = "";

    for (const handle of wishlist) {

        try {

            const response =
                await fetch(`/products/${handle}.js`);

            if (!response.ok) continue;

            const product =
                await response.json();

            const variant =
                product.variants[0];

            wishlistContainer.insertAdjacentHTML(
                "beforeend",
                `
                <article class="product-card">

                    <button
                        class="wishlist-button active"
                        data-product-handle="${product.handle}"
                        aria-label="Remove from wishlist"
                        aria-pressed="true"
                        type="button">

                        ♥

                    </button>

                    <a
                        href="/products/${product.handle}"
                        class="product-card-image">

                        <div class="product-card-image-wrapper">

                            ${
                                product.images.length
                                    ? `
                                        <img
                                            class="product-image-primary"
                                            src="${product.images[0]}"
                                            alt="${product.title}">
                                      `
                                    : ""
                            }

                            ${
                                product.images.length > 1
                                    ? `
                                        <img
                                            class="product-image-secondary"
                                            src="${product.images[1]}"
                                            alt="${product.title}">
                                      `
                                    : ""
                            }

                        </div>

                    </a>

                    <div class="product-card-content">

                        <p class="product-vendor">

                            ${product.vendor}

                        </p>

                        <h3>

                            <a href="/products/${product.handle}">

                                ${product.title}

                            </a>

                        </h3>

                        <div class="product-price">

                            ${Shopify.formatMoney(
                                variant.price,
                                window.Shopify.money_format
                            )}

                        </div>

                        <div class="product-card-actions">

                            <button
                                class="button quick-view-button"
                                data-product-handle="${product.handle}">

                                Quick View

                            </button>

                            <a
                                href="/products/${product.handle}"
                                class="button button-secondary">

                                View Product

                            </a>

                        </div>

                    </div>

                </article>
                `
            );

        } catch (error) {

            console.error(error);

        }

    }

    updateWishlistButtons();

}
/* ==========================================
   INITIALIZE
========================================== */

updateWishlistButtons();

renderWishlist();

renderCart();

});