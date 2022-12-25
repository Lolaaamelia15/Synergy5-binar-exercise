const express = require('express');
const upload = require('./helpers/fileUpload');



const app = express();
// fungsi untuk membaca json dari body
app.use(express.json()); 

const products = [
    {
        id: 1,
        name: "HP",
        price: 2000,
    },
    {
        id: 2,
        name: "Laptop",
        price: 10000,
    },
    {
        id: 3,
        name: "Remot",
        price: 5600,
    }
]

const getProductHandler =(req, res) => {
    // query parameter digunakan untuk memfilter
    const maxPrice = req.query.max_price;
    const minPrice = req.query.min_price;

    res.send(JSON.stringify(products.filter(product => product.price < maxPrice && product.price > minPrice)));
}

const createProductHandler =(req, res) => {
    const {name, price} = req.body;
    
    // Validasi payload
    if (!name || !price) {
        res.status(400).send("Name and Price should not be empty");

        return;
    }

    // menambahkan id baru dari id terakhir
    req.body.id = products[products.length - 1].id + 1;
    req.body.image = req.uploaded_image;

    products.push(req.body);

    // ketika menambahkan data dan berhasil maka statusnya menjadi 201
    res.status(201).send(products);
    return;
}

const getProductDetailHandler =(req, res) => {
    const { id } = req.params;
    // filter product
    const filteredProduct = products.filter(product => product.id === parseInt(id));
    
    if (filteredProduct.length === 0) res.status(404).send("Product not found");
    else res.send(filteredProduct[0]);

    return
}

const updateProductHandler =(req, res) => {
    const { id } = req.params;
    const {name, price} = req.body;

    const filteredProducts = products.filter(product => product.id === parseInt(id));
    
    if (filteredProducts.length === 0) {
        res.status(404).send("Product not found");
        
        return 
    }

    const updateProducts = products.map(product => {
        if (product.id === parseInt(id)) {
            product.name = name;
            product.price = price;
        } 

        return product;
    })

    res.send(updateProducts);
    
    return

}
const deleteProductByIDHandler =(req, res) => {
    // id -> nge get data ke database sesuai dengan id yang dikirim user
    const { id } = req.params;
    // filter product
    const filteredProduct = products.filter(product => product.id !== parseInt(id));
    
    if (filteredProduct.length == products.length) res.status(404).send("Product not found");
    else res.send(filteredProduct);

    return
}

// fungsi middleware => melakukan pengecekan apakah admin aau tidak 
const isAdmin = (req, res, next) => {
    if (req.query.role === 'admin') {
        next();

        return
    }

    res.status(401).send("Anda bukan Admin")
    return
}

app.get("/api/products", getProductHandler)
app.post("/api/products", isAdmin, upload.single("image"),createProductHandler)
app.get("/api/products/:id", getProductDetailHandler)
app.put("/api/products/:id", updateProductHandler)
app.delete("/api/products/:id", deleteProductByIDHandler)


app.listen(1000, () => {
    console.log("Server running at http://127.0.0.1:1000")
})