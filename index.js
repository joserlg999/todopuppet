const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
// const todoist = require('todoist-nodejs');

// b2fd0276a3b2e2a8639bd15f3142da0e37bb5950

// const api = new todoist('b2fd0276a3b2e2a8639bd15f3142da0e37bb5950');
//     await api.sync().then(() =>
//         api.items.add('task1', {
//             priority: 1,
//             due: {
//                 string: 'today'
//             }
//         })
//     ).then(() => api.commit())
//         .catch( (e) => {process.exit([0]);});

(async () => {
    try {
        let url = 'https://randomtodolistgenerator.herokuapp.com/library';
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.waitForSelector('.card-body',{timeout:3000}).catch(() => console.log('Class card-body doesn\'t exist!'));
        let tasks = await page.evaluate(() => {
            let cards = document.querySelectorAll('div.card-body');
            let tasksList = [];
            if (cards.length >= 5){
                cards.forEach((each) => {
                    let obj = {};
                    obj.name = each.childNodes[0].firstChild.innerText.replaceAll('/n/r', '');
                    obj.text = each.childNodes[1].innerText.replaceAll('/n/r', '');
                    tasksList.push(obj);
                });
            } else {
                console.log('There is less than five tasks!');
                process.exit([-1]);
            }
            return tasksList;
        });
        await browser.close();

        let count = 0;
        let get = await getRequest('https://api.todoist.com/rest/v1/projects', { 'Authorization': 'Bearer b2fd0276a3b2e2a8639bd15f3142da0e37bb5950' });
        for (const task of tasks) {
           if (count < 5){
               let body = {
                   "content": task.name,
                   "project_id": get[0].id,
                   "description": task.text,
                   "due_string": "today",
                   "priority": ((count+4)%4)+1
               };
               await postRequest('https://api.todoist.com/rest/v1/tasks', body, { 'Content-Type': 'application/json', 'Authorization': 'Bearer b2fd0276a3b2e2a8639bd15f3142da0e37bb5950'});
               count ++;
           } else {
               break;
           }
        }
    } catch (err) {
        console.log(err);
        process.exit([-1]);
    }
})();

const getRequest = async (url, headers) => {
    const response = await fetch(url, {
        method: 'get',
        headers: headers,
    })
        .then(res => res.json());
    return response;
};

const postRequest = async (url, body, headers) => {
    await fetch(url, {
        method: 'post',
        body:    JSON.stringify(body),
        headers: headers,
    })
        .then(res => res.json())
        .then(json => console.log(json));
};
