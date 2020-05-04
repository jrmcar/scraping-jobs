const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const getPageInfos = async page => {
    await page.waitFor('section.sc-12bzhsi-16.eXgLWp');

    const results = await page.evaluate(() => {
        let preferredExp = '';
        let yearsExp = '';

        const jobTitle = document.querySelector('h1.sc-12bzhsi-3.kaJlvc').innerText;

        const companyName = document.querySelector('h4.sc-17gqtt5-6.cbgsrE').innerText;

        const sections = document.querySelectorAll('section.sc-12bzhsi-16.eXgLWp');
        [].forEach.call(sections, function(section){

            if  (section.querySelector('h2') &&
                (section.querySelector('h2').innerText.toLowerCase() === 'preferred experience' || section.querySelector('h2').innerText.toLowerCase() === 'profil recherché'))
            {
                preferredExp = section.querySelector('div').innerText;
            }

        });

        const educations = document.querySelectorAll('svg.sc-eilVRo.logCoo[alt="EducationLevel"]');
        [].forEach.call(educations, function(education){
            yearsExp = education.parentNode.parentNode.querySelector('span.sc-1qc42fc-2.iUzoOq').innerText;
        });

        return {
            jobTitle,
            companyName,
            preferredExp,
            yearsExp
        };
    });

    return results;
};

const scraping = (async (link) => {
    const browser = await puppeteer.launch(
    {
        userDataDir: "./user_data",
        headless: false,
    });

    const page = await browser.newPage();
    await page.viewport({ width: 1680, height: 920 })

    await page.goto(link, { waitUntil: 'networkidle2' });

    const urls = [];
    const infos = [];

    const jobThumbs = await page.$$('article div.sc-1flb27e-5 header a');

    for(const job of jobThumbs){
        const url = await page.evaluate(el => el.href, job);

        urls.push({
            url
        });
    }

    for(let i = 0; i < urls.length; i++){
        await page.goto(urls[i].url, { waitUntil: 'networkidle2'});

        const pageInfos = await getPageInfos(page);
        pageInfos.url = urls[i].url;

        infos.push(
            pageInfos
        )
    }


    // Create PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('./public/pdf/job_search.pdf'));

    infos.forEach((info) => {
        doc.moveDown();
        doc.fontSize(25)
            .fillColor('black')
            .text(info.jobTitle, {
                align: 'center'
            });

        // doc.moveDown();
        doc.fontSize(20)
            .text(info.companyName, {
                align: 'left'
            });

        if(info.yearsExp != ''){
            doc.fontSize(11)
            .text(`Experience ${info.yearsExp}`, {
                align: 'left'
            });
        }

        doc.fontSize(11)
            .text(info.preferredExp, {
                align: 'left'
            });

        doc.moveDown();
        doc.fontSize(11)
            .fillColor('blue')
            .text('Voir plus', {
                align: 'left',
                underline: true,
                link: info.url
            });
    })

    doc.end();

    await browser.close();
});

module.exports = scraping;