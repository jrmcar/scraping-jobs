const express = require('express')
const scraping = require ('./src/scraping')


const app = express()
const port = process.env.PORT || 3000

app.get('', (req, res) => {
    res.send({
        action: 'homepage, nothing to do here.'
    })
})

app.get('/jobs', (req, res) => {
    let link = "https://www.welcometothejungle.com/fr/jobs?page=1&query=nodejs&aroundQuery=Paris%2C%20France&refinementList%5Boffice.district%5D%5B%5D=Paris&refinementList%5Boffice.state%5D%5B%5D=Ile-de-France&refinementList%5Boffice.country_code%5D%5B%5D=FR&refinementList%5Bcontract_type_names.fr%5D%5B%5D=CDI&refinementList%5Bprofession_name.fr.Tech%5D%5B%5D=Dev%20Fullstack&refinementList%5Bprofession_name.fr.Tech%5D%5B%5D=Dev%20Backend";

    if(req.query.link){
        link = req.query.link
        console.log("link")
    }

    res.send({
        action: 'jobs, scraping and creating pdf here.'
    })

    scraping(link)
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})