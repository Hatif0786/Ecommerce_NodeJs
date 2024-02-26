const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv');
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const categoryRouter = require('./routes/categoryRoute');
const blogCategoryRouter = require('./routes/blogCategoryRoute');
const brandRouter = require( './routes/brandRoute' );
const blogRouter = require('./routes/blogRoute')
const couponRouter = require('./routes/couponRoute')
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')

dotenv.config(); // Call config method to load environment variables

dbConnect();

app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user', authRouter);  
app.use('/api/blog', blogRouter)
app.use('/api/blog-category', blogCategoryRouter)
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/brand', brandRouter)
app.use('/api/coupon', couponRouter)

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
