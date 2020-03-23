const prods = [  
    {
        image: 'img/1.jpg',
        title: 'LeBron',
        price: 70,
        category: 'Sneakers',
        bestSeller: true
    },
    {
        image: 'img/2.jpg',
        title: 'Black Passiano',
        price: 40,
        category: 'Formals',
        bestSeller: false
    },
    {
        image: 'img/3.jpg',
        title: 'Pink Passiano',
        price: 60,
        category: 'Formals',
        bestSeller: false
    },
    {
        image: 'img/4.jpg',
        title: 'AirJordan 1',
        price: 70,
        category: 'Sneakers',
        bestSeller: true
    },
    {
        image: 'img/5.jpg',
        title: 'SF AirForce 1',
        price: 80,
        category: 'Sneakers',
        bestSeller: true
    },
    {
        image: 'img/6.jpg',
        title: 'Airmax 90',
        price: 90,
        category: 'Sneakers',
        bestSeller: true
    },
 ];

let prodCategories = new Set(prods.map(prod => {
    return prod.category;
}));

prodCategories = Array.from(prodCategories);

let products = {products: prods, categories: prodCategories};

module.exports=products;