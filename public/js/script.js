//const { createConnection } = require("mysql");

let search = document.querySelector('.search-box');

document.querySelector('#search-icon').onclick =()=>{
    search.classList.toggle('active');
    navbar.classList.remove('active');
}

// let navbar = document.querySelector('.navbar');
// document.querySelector('#menu-icon').onclick = ()=>{
//     navbar.classList.toggle('active')
//     search.classList.remove('active')
// }

window.onscroll =()=>{
    navbar.classList.remove('active');
    search.classList.remove('active')
}

//shopping cart

let shopping = document.querySelector('.cartTab');
document.querySelector('#cart-icon').onclick = ()=>{
    console.log("------->",shopping);
    shopping.classList.toggle('active')
    navbar.classList.remove('active')
}

let cart = []
//add to cart
document.querySelector('#addToCart').onclick = (event)=>{
    console.log("------->", event);
    let productId = event.target.dataset.productId;
    console.log("Hello", productId)
    //cart.push
    cart.push({id: productId})
    //let shopping = document.querySelector('.cartTab');
   renderCart();
}

function renderCart(){
    const cartContainer = document.querySelector('.cartList');
    cartContainer.innerHTML = '';

    if(cart.length == 0){
        createConnection.innerHTML = '<p>Your cart is empty</p>'
        return;
    }

    cart.forEach((item, index) => {
        const element = document.createElement('div');
        element.innerHTML = `
        <div class="name">${item.id}</div>
        `;
        cartContainer.appendChild(element)
    });
}
