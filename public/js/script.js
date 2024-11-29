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



async function addItemToCart(event) {
    console.log("------->", event);
    let productId = event.target.dataset.productId;
    const response = await fetch(`/api/products?id=${productId}`);
    if(!response.ok){
        throw new Error('failed to fetch product information')
    }

    const product = await response.json();

    console.log('product details', product);
    let productSearchInCart = cart.find((item) => item.id === Number(productId));
    if(productSearchInCart){
        productSearchInCart.quantity += 1;
    }else {
        cart.push({
            ...product, quantity: 1
        })
    }
    
    //let shopping = document.querySelector('.cartTab');
   renderCart();
}



function renderCart(){
    const cartContainer = document.querySelector('.listCart');
    cartContainer.innerHTML = '';

    if(cart.length == 0){
        cartContainer.innerHTML = `
        <div class="empty-cart-msg"> 
            <p >Your cart is empty</p>
        </div>
        `
        return;
    }

    cart.forEach((item, index) => {
        const element = document.createElement('div');
        element.classList.add('item');

        element.innerHTML = `
            <div class="image">
                <img src="/public/img/p1.png" alt="">
            </div>
            <div class="name">${item.name}</div>
            <div class="totalPrice">${item.price * item.quantity}</div>
            <div class="quantity">
                <span class="minus"><</span>
                    <span>${item.quantity}</span>
                <span class="plus">></span>
            </div>
        `;
        cartContainer.appendChild(element)
    });

}


async function renderProductList(){
    const productListCotainer = document.querySelector('.product-container');

    if(!productListCotainer){
        console.log('no product container found. skipping rendering the products')
        return;
    }

    try{
        const response = await fetch(`/api/products`);
        if(!response.ok){
            throw Error('unable to fetch products from api')
        }

        const products = await response.json();
        console.log('products', products);
        products.forEach((product) => {
            const productElement = document.createElement('div')
            productElement.classList.add('box')
            productElement.innerHTML = `
                <img src="/public/img/p1.png" alt="">
                <h3>${product.name}</h3>
                <div class="content">
                    <span>$${product.price}</span>
                    <a data-product-id='${product.id}' id="addToCart"> Add To Cart</a>
                </div>
            `
            productListCotainer.appendChild(productElement)
            const buttonElement = productElement.querySelector('#addToCart');
            buttonElement.addEventListener('click', async(event) => {
                await addItemToCart(event)
            })

        })
        

    }catch(error){

    }

}

renderCart();
renderProductList();
