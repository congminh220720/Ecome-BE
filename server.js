const app = require('./src/app')
const { app: {port} } = require('./src/config/config.db')

const PORT = port || 3055

app.listen(PORT, () => {
    console.log('server is running on port', PORT)
})

// process.on('SIGINT', () => {
//     server.close(() => console.log('server is exit'))
// })
