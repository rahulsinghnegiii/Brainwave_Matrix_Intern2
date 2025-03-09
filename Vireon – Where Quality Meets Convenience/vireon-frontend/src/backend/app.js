import responseHandler from './middleware/responseHandler.js';

// ... other imports and setup ...

// Add the middleware before routes
app.use(responseHandler);
app.use('/api', productRoutes); 