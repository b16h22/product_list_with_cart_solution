async function getData() {
    try{
      const url = "data.json";
      const response = await fetch(url);
      const dessertData = await response.json();
      populateLayout(dessertData);
    } catch(error) {
        console.log(error);
    }
}
  
getData();

function populateLayout(dessertData) {

  const popupLayout = document.querySelector(".popup-dialog");
  popupLayout.style.display = "none";

  // Cart variables
  const emptyCartLayout = document.getElementById("empty-cart");
  const cartListLayout = document.querySelector(".cart-list-layout");
  const cartList = document.getElementById("cart-list");
  const cartTitleTotalItems = document.getElementById("cart-title-items");
  const orderTotalCost = document.getElementById("order-total-price");
  const confirmedCartList = document.querySelector(".confirmed-order-list");
  const confirmOrderButton = document.querySelector(".confirm-order");
  const newOrderButton = document.querySelector(".new-order");
  const confirmedTotalCost = document.getElementById("confirmed-total-cost");
  let cartItemName;

  const dessertListObj = {};
  const cartListObj = {};
  let dessertListObjKeys = [];
  let cartListObjKeys = [];
  let totalPricesArray = [];
  let individualItemQuantity = 1;
  let totalItemCount = 0;
  let totalCost;

  cartListLayout.style.display = "none";

  for(let i = 0; i < dessertData.length; i++) {
    dessertListObj[dessertData[i].name] = dessertData[i];
  }
  console.log(dessertListObj);

  // Populate dessert items
  for(let x of dessertData) {
    populateDessertItems(x);
  }

  function populateDessertItems(item) {
    const dessertItemDiv = document.querySelector(".items-grid");
    const dessertItem = document.createElement("div");
    dessertItem.className = "item-dessert";
  
    dessertItem.innerHTML =
    `<div class="dessert-image-div">
      <img class="dessert-image" src="${item.image.desktop}">
      <div class="bottom-button">
        <button class="add-to-cart-button"><img class="cart-icon" src="./assets/images/icon-add-to-cart.svg" alt="cart icon">Add to Cart</button>
        <button class="quantity-button">
          <img class="remove-button" src="./assets/images/icon-decrement-quantity.svg" alt="decrease quantity">
          <p class="quantity"></p>
          <img class="add-button" src="./assets/images/icon-increment-quantity.svg" alt="increase quantity">
        </button>
      </div>
      </div>
      <div class="dessert-details">
        <p class="dessert-category">${item.category}</p>
        <p class="dessert-name">${item.name}</p>
        <p class="dessert-price">$${item.price.toFixed(2)}</p>
      </div>`
    dessertItemDiv.appendChild(dessertItem);
  }

  const dessertImages = document.querySelectorAll(".dessert-image");
  const dessertNames = document.querySelectorAll(".dessert-name");

  const addToCartButton = document.querySelectorAll(".add-to-cart-button");
  const quantityButton = document.querySelectorAll(".quantity-button");
  const incrementButton = document.querySelectorAll(".add-button");
  const decrementButton = document.querySelectorAll(".remove-button");

  // Media query for changing dessert images based on screen size
  function myFunction(screensize) {
    if (screensize.matches) {
      for(let i = 0; i < dessertImages.length; i++) {
        dessertImages[i].src = dessertData[i].image.mobile;
      }
    } else {
      for(let i = 0; i < dessertImages.length; i++) {
        dessertImages[i].src = dessertData[i].image.desktop;
      }
    }
  }

  let screensize = window.matchMedia("(max-width:48em)");
  myFunction(screensize);

  screensize.addEventListener("change", function() {
    myFunction(screensize);
  });


  // Button click handlers
  addToCartButton.forEach(button => {
    button.onclick = addItemToCart;
  });

  quantityButton.forEach(button => {
    button.style.display = "none";
  });
  
  incrementButton.forEach(button => {
    button.onclick = increaseItemCart;
  })
        
  decrementButton.forEach(button => {
    button.onclick = drecreaseItemCart;
  })

  confirmOrderButton.onclick = showCartListDialog;

  newOrderButton.onclick = resetCart;


  // Populate cart items
  function addItemToCart(event) {

    // Finding dessert name of clicked cart button
    let nameChildCartButton = event.currentTarget.closest(".item-dessert").querySelector(".dessert-name").innerHTML;

    dessertListObjKeys = Object.keys(dessertListObj);
    let keyMatched = dessertListObjKeys.filter(checkKeyMatch);

    function checkKeyMatch(key) {
      return key === nameChildCartButton;
    }
    console.log(keyMatched);

    const cartListDiv = document.getElementById("cart-list");
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
  
    cartItem.innerHTML = 
    `<div class="cart-item-details">
      <p class="cart-item-name">${dessertListObj[keyMatched].name}</p>
      <div class="cart-item-price-quantity">
        <p class="cart-item-qantity">${individualItemQuantity + "x"}</p>
        <p class="cart-item-single-price">${"@ $" + dessertListObj[keyMatched].price.toFixed(2)}</p>
        <p class="cart-item-total-price">${"$" + (dessertListObj[keyMatched].price * individualItemQuantity).toFixed(2)}</p>
      </div>
    </div>
    <img class="remove-from-cart" src="./assets/images/icon-remove-item.svg" alt="remove from cart">`;
    cartListDiv.appendChild(cartItem);

    // Update total item count
    if(totalItemCount === 0) {
        totalItemCount = 1;
    } else {
        totalItemCount = totalItemCount + 1;
    }
    calculateTotalCart();

    // Update cart list object with new key
    individualItemQuantity = 1 ;
    cartListObj[nameChildCartButton] = individualItemQuantity;
    event.currentTarget.closest(".item-dessert").querySelector(".quantity").innerHTML = individualItemQuantity;
    console.log(cartListObj);

    // Update cart button & item selection
    cartListLayout.style.display = "block";
    emptyCartLayout.style.display = "none";
    event.currentTarget.style.display = "none";
    event.currentTarget.closest(".item-dessert").querySelector(".quantity-button").style.display = "flex";
    event.currentTarget.closest(".item-dessert").querySelector(".dessert-image").style.outline = "2px solid hsl(14, 86%, 42%)";

    // Remove item from cart button event handler
    const removeFromCartButton = document.querySelectorAll(".remove-from-cart");
    removeFromCartButton.forEach(button => {
    button.addEventListener("click", removeItemFromCart);
    })
  }

  // Increase the item quantity in cart
  function increaseItemCart(event) {
    const nameChildPlus = event.currentTarget.closest(".item-dessert").querySelector(".dessert-name").innerHTML;

    cartListObjKeys = Object.keys(cartListObj);
    let keyMatched = cartListObjKeys.filter(checkKeyMatch);

    function checkKeyMatch(key) {
      return key === nameChildPlus;
    }

    cartListObj[keyMatched] = cartListObj[keyMatched] + 1;
    event.currentTarget.closest(".item-dessert").querySelector(".quantity").innerHTML = cartListObj[keyMatched];
    totalItemCount = totalItemCount + 1;

    cartItemName = document.querySelectorAll(".cart-item-name");

    for( let x = 0; x < cartItemName.length; x++) {
      if(cartItemName[x].innerHTML === nameChildPlus) {
        console.log(cartItemName[x].innerHTML);
        cartItemName[x].closest(".cart-item").querySelector(".cart-item-qantity").innerHTML = cartListObj[nameChildPlus] + "x";
        cartItemName[x].closest(".cart-item").querySelector(".cart-item-total-price").innerHTML = "$" + (dessertListObj[nameChildPlus].price * cartListObj[nameChildPlus]);
      }
    }

    calculateTotalCart();
    console.log(cartListObj);
  }

  // Decrease the item quantity in cart  
  function drecreaseItemCart(event) {
    let clickedMinusButton = event.currentTarget;
    const nameChildMinus = clickedMinusButton.closest(".item-dessert").querySelector(".dessert-name").innerHTML;

    cartListObjKeys = Object.keys(cartListObj);
    let keyMatched = cartListObjKeys.filter(checkKeyMatch);

    function checkKeyMatch(key) {
      return key === nameChildMinus;
    }

    if(cartListObj[keyMatched] === 1) {
      delete cartListObj[keyMatched];
      clickedMinusButton.closest(".item-dessert").querySelector(".add-to-cart-button").style.display = "block";
      clickedMinusButton.closest(".item-dessert").querySelector(".quantity-button").style.display = "none";
      clickedMinusButton.closest(".item-dessert").querySelector(".dessert-image").style.outline = "none";

      //Remove cart item
      cartItemName = document.querySelectorAll(".cart-item-name");
      
      for (let i of cartItemName) {
        if(i.innerHTML === nameChildMinus) {
          i.closest(".cart-item").remove();
        }
      }
    } else {
      cartListObj[keyMatched] = cartListObj[keyMatched] - 1;
    }
    
    for( let y = 0; y < cartItemName.length; y++) {
      if(cartItemName[y].innerHTML === nameChildMinus) {
        console.log(cartItemName[y].innerHTML);
        cartItemName[y].closest(".cart-item").querySelector(".cart-item-qantity").innerHTML = cartListObj[nameChildMinus] + "x";
        cartItemName[y].closest(".cart-item").querySelector(".cart-item-total-price").innerHTML = "$" + (dessertListObj[nameChildMinus].price * cartListObj[nameChildMinus]);
      }
    }

    // Update quantity and cost
    event.currentTarget.closest(".item-dessert").querySelector(".quantity").innerHTML = cartListObj[keyMatched];
    totalItemCount = totalItemCount - 1;
    calculateTotalCart();
    console.log(cartListObj);
  }

  //Remove cart item with remove item button
  function removeItemFromCart(event) {
    let currentItemName = event.currentTarget.parentElement.querySelector(".cart-item-name").innerHTML;
    cartListObjKeys = Object.keys(cartListObj);
    let cartListKeyMatched = cartListObjKeys.filter(checkKeyMatch);

    function checkKeyMatch(key) {
      return key === currentItemName;
    }

    delete cartListObj[cartListKeyMatched];

    let objValArray = Object.values(cartListObj);
    totalItemCount = 0;

    for (i = 0; i < objValArray.length; i++) {
      totalItemCount += objValArray[i];
    }

    for( let z = 0; z < dessertNames.length; z++) {
      if(dessertNames[z].innerHTML === currentItemName) {
      dessertNames[z].closest(".item-dessert").querySelector(".add-to-cart-button").style.display = "block";
      dessertNames[z].closest(".item-dessert").querySelector(".quantity-button").style.display = "none";
      dessertNames[z].closest(".item-dessert").querySelector(".dessert-image").style.outline = "none";
      }
    }
    event.currentTarget.closest(".cart-item").remove();
    calculateTotalCart();
  }

  function calculateTotalCart() {
    if(totalItemCount === 0) {
      cartListLayout.style.display = "none";
      emptyCartLayout.style.display = "block";
    }
    cartTitleTotalItems.innerHTML = "(" + totalItemCount + ")";

    //Display total cost of order
    const itemTotalPrices = document.querySelectorAll(".cart-item-total-price");
    totalCost = 0;

    for(let i = 0; i < itemTotalPrices.length; i++) {
      let totalPriceText = itemTotalPrices[i].innerHTML.replace(/^\D+/g, '');
      totalPricesArray[i] = Number(totalPriceText);
    }
    console.log(totalPricesArray);

    for (let r = 0; r < totalPricesArray.length; r++) {
      totalCost += totalPricesArray[r];
    }
    orderTotalCost.innerHTML = "$" + totalCost.toFixed(2);
    console.log(totalCost);
  }

  function showCartListDialog() {
    popupLayout.style.display = "flex";

    let orderedItemName;
    let orderedItemQuantity;
    let orderedItemPrice;
    let orderedItemThumbnail;

    cartListObjKeys = Object.keys(cartListObj);
    dessertListObjKeys = Object.keys(dessertListObj);

    for(let cartItem of cartListObjKeys) {
      orderedItemName = cartItem;
      orderedItemPrice = dessertListObj[cartItem].price;
      orderedItemQuantity = cartListObj[cartItem];
      orderedItemThumbnail = dessertListObj[cartItem].image.thumbnail;

      const confirmedCartListItem = document.createElement("div");
      confirmedCartListItem.className = "confirmed-cart-list-item";
    
      confirmedCartListItem.innerHTML =
        `<img class="dessert-image-thumb" src="${orderedItemThumbnail}">
        <div class="order-item-details">
          <div class="order-item-name-cost">
            <p class="order-item-name">${orderedItemName}</p>
            <div class="order-item-price-section">
              <p class="order-item-qantity">${orderedItemQuantity + "x"}</p>
              <p class="order-item-single-price">${"@ $" + orderedItemPrice.toFixed(2)}</p>
            </div>
          </div>
          <p class="order-item-total-price">${"$" + (orderedItemPrice * orderedItemQuantity).toFixed(2)}</p>
        </div>`
      confirmedCartList.appendChild(confirmedCartListItem);

      confirmedTotalCost.innerHTML = "$" + totalCost.toFixed(2);
    }
  }

  function resetCart() {
    Object.keys(cartListObj).forEach((key) => { delete cartListObj[key]});
    totalPricesArray = [];
    confirmedCartList.innerHTML = "";
    cartList.innerHTML = "";

    // Reset total cost and quantity
    let confirmedTotalCost = document.getElementById("confirmed-total-cost");
    totalCost = 0;
    totalItemCount = 0;
    confirmedTotalCost.innerHTML = "$" + totalCost.toFixed(2);
    orderTotalCost.innerHTML = "$" + totalCost.toFixed(2);
    cartTitleTotalItems.innerHTML = "(" + totalItemCount + ")";

    // Update UI elements
    popupLayout.style.display = "none";
    cartListLayout.style.display = "none";
    emptyCartLayout.style.display = "block";

    dessertImages.forEach((element) => {element.style.outline = "none"})
    addToCartButton.forEach((button) => {button.style.display = "block"})
    quantityButton.forEach((button) => {button.style.display = "none"})
    
    location.reload();
  }
}